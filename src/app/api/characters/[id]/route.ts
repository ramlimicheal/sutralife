import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mockCharacters } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try database first
    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      });

      const { data: character } = await supabase
        .from("characters")
        .select("*")
        .eq("id", id)
        .single();

      if (character) {
        // Increment view count
        await supabase
          .from("characters")
          .update({ view_count: (character.view_count ?? 0) + 1 })
          .eq("id", id);

        return NextResponse.json({ character });
      }
    }

    // Fallback to mock data
    const character = mockCharacters.find((c) => c.id === id);
    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Character fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("characters")
      .select("creator_id")
      .eq("id", id)
      .single();

    if (!existing || existing.creator_id !== user.id) {
      return NextResponse.json({ error: "You can only edit your own characters" }, { status: 403 });
    }

    const { data: character, error } = await supabase
      .from("characters")
      .update({
        name: body.name,
        tagline: body.tagline,
        bio: body.bio,
        category: body.category,
        traits: body.traits,
        speaking_style: body.speaking_style,
        is_nsfw: body.is_nsfw,
        is_published: body.is_published,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Character update error:", error);
    return NextResponse.json({ error: "Failed to update character" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("characters")
      .select("creator_id")
      .eq("id", id)
      .single();

    if (!existing || existing.creator_id !== user.id) {
      return NextResponse.json({ error: "You can only delete your own characters" }, { status: 403 });
    }

    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Character delete error:", error);
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}
