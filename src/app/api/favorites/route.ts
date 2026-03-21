import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ favorites: [] });
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
      return NextResponse.json({ favorites: [] });
    }

    const { data: favorites } = await supabase
      .from("favorites")
      .select("*, characters(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ favorites: favorites ?? [] });
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return NextResponse.json({ favorites: [] });
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const characterId = body.characterId;

    // Check if already favorited
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("character_id", characterId)
      .single();

    if (existing) {
      // Remove favorite (toggle)
      await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      return NextResponse.json({ favorited: false });
    }

    // Add favorite
    await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        character_id: characterId,
      });

    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
