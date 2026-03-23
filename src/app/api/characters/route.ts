import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mockCharacters } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const trait = searchParams.get("trait");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const sort = searchParams.get("sort") ?? "trending";

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

    let query = supabase
      .from("characters")
      .select("*", { count: "exact" })
      .eq("is_published", true);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (trait) {
      query = query.contains("traits", [trait]);
    }

    if (search) {
      // Sanitize search input to prevent PostgREST filter injection
      const safeSearch = search.replace(/[,.()'"\\%]/g, "");
      if (safeSearch.length > 0) {
        query = query.or(`name.ilike.%${safeSearch}%,tagline.ilike.%${safeSearch}%`);
      }
    }

    // Sorting
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "rating") {
      query = query.order("rating", { ascending: false });
    } else {
      // trending = by chat_count
      query = query.order("chat_count", { ascending: false });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: characters, count, error } = await query;

    if (!error && characters) {
      return NextResponse.json({
        characters,
        total: count ?? 0,
        page,
        limit,
        hasMore: (count ?? 0) > offset + limit,
      });
    }
  }

  // Fallback to mock data with filtering
  let characters = [...mockCharacters];

  if (category && category !== "all") {
    characters = characters.filter((c) => c.category === category);
  }

  if (trait) {
    characters = characters.filter((c) =>
      c.traits.some((t) => t.toLowerCase() === trait.toLowerCase())
    );
  }

  if (search) {
    const q = search.toLowerCase();
    characters = characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.traits.some((t) => t.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    characters,
    total: characters.length,
    page: 1,
    limit: 20,
    hasMore: false,
  });
}

// Create a new character
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

    const { data: character, error } = await supabase
      .from("characters")
      .insert({
        name: body.name,
        tagline: body.tagline ?? "",
        bio: body.bio ?? "",
        avatar_url: body.avatar_url ?? "",
        category: body.category ?? "cyberpunk",
        traits: body.traits ?? [],
        speaking_style: body.speaking_style ?? "neutral",
        system_prompt: body.system_prompt ?? null,
        is_nsfw: body.is_nsfw ?? false,
        is_published: body.is_published ?? false,
        creator_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error("Character creation error:", error);
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
  }
}
