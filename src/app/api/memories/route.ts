import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { extractMemories } from "@/lib/gemini";

interface CookieToSet {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

/**
 * GET /api/memories?characterId=xxx
 * Retrieve all memories for the authenticated user + character pair.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");

    if (!characterId) {
      return NextResponse.json({ error: "characterId is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ memories: [] });
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

    const { data: memories, error } = await supabase
      .from("memory_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch memories:", error);
      return NextResponse.json({ memories: [] });
    }

    const res = NextResponse.json({ memories: memories ?? [] });
    responseCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  } catch (error) {
    console.error("Memories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

/**
 * POST /api/memories
 * Extract and store memories from a conversation exchange.
 * Body: { characterId, characterName, userMessage, assistantResponse }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { characterId, characterName, userMessage, assistantResponse } = body as {
      characterId: string;
      characterName: string;
      userMessage: string;
      assistantResponse: string;
    };

    if (!characterId || !userMessage || !assistantResponse) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ extracted: [] });
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

    // Fetch existing memories to avoid duplicates
    const { data: existing } = await supabase
      .from("memory_entries")
      .select("content")
      .eq("user_id", user.id)
      .eq("character_id", characterId);

    const existingContents = (existing ?? []).map((m: { content: string }) => m.content);

    // Extract new memories using Gemini
    const newMemories = await extractMemories(
      characterName || "Character",
      userMessage,
      assistantResponse,
      existingContents
    );

    // Store extracted memories
    if (newMemories.length > 0) {
      const rows = newMemories.map((m) => ({
        user_id: user.id,
        character_id: characterId,
        category: m.category,
        content: m.content,
        importance: m.importance,
      }));

      const { error: insertError } = await supabase.from("memory_entries").insert(rows);
      if (insertError) {
        console.error("Failed to store memories:", insertError);
      }
    }

    const res = NextResponse.json({ extracted: newMemories });
    responseCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  } catch (error) {
    console.error("Memories POST error:", error);
    return NextResponse.json({ error: "Failed to extract memories" }, { status: 500 });
  }
}

/**
 * DELETE /api/memories?id=xxx
 * Delete a specific memory entry.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

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

    const { error } = await supabase
      .from("memory_entries")
      .delete()
      .eq("id", memoryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete memory:", error);
      return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
    }

    const res = NextResponse.json({ success: true });
    responseCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  } catch (error) {
    console.error("Memories DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
