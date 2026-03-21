import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // Return mock user when Supabase is not configured
      return NextResponse.json({
        user: {
          id: "mock-user-1",
          email: "alex@example.com",
          name: "Alex Mercer",
          avatar_url: null,
          tier: "premium",
          nsfw_enabled: false,
          age_verified: true,
          role: "user",
          subscription_status: "active",
          subscription_expires_at: "2026-04-12T00:00:00Z",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-03-01T00:00:00Z",
        },
      });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields: Record<string, unknown> = {};

    if (typeof body.name === "string") allowedFields.name = body.name;
    if (typeof body.avatar_url === "string") allowedFields.avatar_url = body.avatar_url;
    if (typeof body.nsfw_enabled === "boolean") allowedFields.nsfw_enabled = body.nsfw_enabled;
    if (typeof body.age_verified === "boolean") allowedFields.age_verified = body.age_verified;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(allowedFields)
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: profile });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
