import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generatePhantomMessage } from "@/lib/gemini";
import type { Character } from "@/types";

interface CookieToSet {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

/**
 * GET /api/phantom-messages
 * Retrieve all phantom messages for the authenticated user.
 * Optional query: ?unreadOnly=true
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ messages: [], unreadCount: 0 });
    }

    const cookieStore = await cookies();
    let responseCookies: CookieToSet[] = [];
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          responseCookies = cookiesToSet;
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("phantom_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    // Fetch messages with character info
    let query = supabase
      .from("phantom_messages")
      .select("*, characters:character_id(id, name, avatar_url, tagline)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error("Failed to fetch phantom messages:", error);
      return NextResponse.json({ messages: [], unreadCount: 0 });
    }

    const res = NextResponse.json({
      messages: messages ?? [],
      unreadCount: unreadCount ?? 0,
    });
    responseCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  } catch (error) {
    console.error("Phantom messages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch phantom messages" }, { status: 500 });
  }
}

/**
 * POST /api/phantom-messages
 * Generate a phantom message from a character.
 * Body: { characterId }
 * Called after user conversations to trigger proactive messages.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { characterId } = body as { characterId: string };

    if (!characterId) {
      return NextResponse.json({ error: "characterId is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ generated: false });
    }

    const cookieStore = await cookies();
    let responseCookies: CookieToSet[] = [];
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          responseCookies = cookiesToSet;
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Load character
    const { data: character } = await supabase
      .from("characters")
      .select("*")
      .eq("id", characterId)
      .single();

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Load memories for context
    const { data: memories } = await supabase
      .from("memory_entries")
      .select("category, content, importance")
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("importance", { ascending: false })
      .limit(10);

    // Load recent messages for context
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("updated_at", { ascending: false })
      .limit(1);

    let recentMessages: { role: string; content: string }[] = [];
    if (conversations && conversations.length > 0) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversations[0].id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (msgs) {
        recentMessages = msgs.reverse();
      }
    }

    // Check if we already sent a phantom message recently (throttle to 1 per 4 hours per character)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const { count: recentPhantomCount } = await supabase
      .from("phantom_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .gte("created_at", fourHoursAgo);

    if ((recentPhantomCount ?? 0) > 0) {
      const res = NextResponse.json({ generated: false, reason: "throttled" });
      responseCookies.forEach(({ name, value, options }) => {
        res.cookies.set(name, value, options);
      });
      return res;
    }

    const memoryEntries = (memories ?? []).map((m: { category: string; content: string; importance: number }) => ({
      category: m.category,
      content: m.content,
      importance: m.importance,
    }));

    // Generate phantom message
    const phantomContent = await generatePhantomMessage(
      character as Character,
      memoryEntries,
      recentMessages
    );

    if (!phantomContent) {
      const res = NextResponse.json({ generated: false, reason: "no_content" });
      responseCookies.forEach(({ name, value, options }) => {
        res.cookies.set(name, value, options);
      });
      return res;
    }

    // Find the memory reference (highest importance memory used)
    const memoryRefId = memories && memories.length > 0
      ? undefined  // We don't have the full ID from the select above, so skip ref
      : undefined;

    // Store the phantom message
    const { data: inserted, error: insertError } = await supabase
      .from("phantom_messages")
      .insert({
        user_id: user.id,
        character_id: characterId,
        content: phantomContent,
        memory_ref_id: memoryRefId ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to store phantom message:", insertError);
      return NextResponse.json({ error: "Failed to store phantom message" }, { status: 500 });
    }

    const res = NextResponse.json({ generated: true, message: inserted });
    responseCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  } catch (error) {
    console.error("Phantom messages POST error:", error);
    return NextResponse.json({ error: "Failed to generate phantom message" }, { status: 500 });
  }
}

/**
 * PATCH /api/phantom-messages
 * Mark phantom messages as read.
 * Body: { messageIds: string[] } or { markAllRead: true }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { messageIds, markAllRead } = body as { messageIds?: string[]; markAllRead?: boolean };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const cookieStore = await cookies();
    let responseCookies: CookieToSet[] = [];
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          responseCookies = cookiesToSet;
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (markAllRead) {
      await supabase
        .from("phantom_messages")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
    } else if (messageIds && messageIds.length > 0) {
      await supabase
        .from("phantom_messages")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .in("id", messageIds);
    }

    const res = NextResponse.json({ success: true });
    responseCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  } catch (error) {
    console.error("Phantom messages PATCH error:", error);
    return NextResponse.json({ error: "Failed to update phantom messages" }, { status: 500 });
  }
}
