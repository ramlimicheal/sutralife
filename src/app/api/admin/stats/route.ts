import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ stats: null });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service role client to bypass RLS for aggregate queries
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ stats: null });
    }
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get stats using service role (bypasses RLS)
    const { count: totalUsers } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: activeSubscribers } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active");

    const { count: premiumCount } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("tier", "premium");

    const { count: totalCharacters } = await adminClient
      .from("characters")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      stats: {
        totalRevenue: 0, // Would come from payment provider
        activeSubscribers: activeSubscribers ?? 0,
        premiumCount: premiumCount ?? 0,
        churnRate: 0,
        totalUsers: totalUsers ?? 0,
        totalCharacters: totalCharacters ?? 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
