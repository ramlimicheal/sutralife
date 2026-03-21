import { NextResponse } from "next/server";

interface UpdateUserBody {
  name?: string;
  nsfw_enabled?: boolean;
  avatar_url?: string;
}

export async function GET() {
  // In production, this would fetch from Supabase using the auth session
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

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateUserBody;

    // In production, this would update the user in Supabase
    // For now, return the mock updated user
    return NextResponse.json({
      user: {
        id: "mock-user-1",
        email: "alex@example.com",
        name: body.name ?? "Alex Mercer",
        avatar_url: body.avatar_url ?? null,
        tier: "premium",
        nsfw_enabled: body.nsfw_enabled ?? false,
        age_verified: true,
        role: "user",
        subscription_status: "active",
        subscription_expires_at: "2026-04-12T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
