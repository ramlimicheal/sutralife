import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateAIResponse, buildSystemPrompt } from "@/lib/gemini";
import { mockCharacters } from "@/lib/mock-data";
import { shouldShowNSFW, canAccessCharacter } from "@/lib/nsfw-gate";
import type { User, UserTier } from "@/types";

interface ChatRequestBody {
  characterId: string;
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { characterId, message, conversationHistory } = body;

    if (!characterId || !message) {
      return NextResponse.json(
        { error: "characterId and message are required" },
        { status: 400 }
      );
    }

    const character = mockCharacters.find((c) => c.id === characterId);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Server-side access control: verify user session and profile
    let user: User | null = null;
    let nsfwEnabled = false;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      });

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("age_verified, nsfw_enabled, tier")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          user = {
            id: authUser.id,
            email: authUser.email ?? "",
            name: "",
            avatar_url: null,
            tier: (profile.tier as UserTier) ?? "free",
            nsfw_enabled: profile.nsfw_enabled ?? false,
            age_verified: profile.age_verified ?? false,
            role: "user",
            razorpay_customer_id: null,
            razorpay_subscription_id: null,
            subscription_status: "inactive",
            subscription_expires_at: null,
            created_at: "",
            updated_at: "",
          };
          nsfwEnabled = shouldShowNSFW(user);
        }
      }
    }

    // Check character access: NSFW gating + premium tier check
    if (supabaseUrl && supabaseAnonKey && user) {
      const access = canAccessCharacter(character, user);
      if (!access.allowed) {
        return NextResponse.json(
          { error: access.reason ?? "Access denied" },
          { status: 403 }
        );
      }
    } else {
      // No auth configured or user not logged in — block premium and NSFW characters
      if (character.is_premium) {
        return NextResponse.json(
          { error: "This character requires a Premium or Collector subscription" },
          { status: 403 }
        );
      }
      if (character.is_nsfw) {
        return NextResponse.json(
          { error: "NSFW content requires authentication and a qualifying subscription" },
          { status: 403 }
        );
      }
    }

    const systemPrompt = buildSystemPrompt(character, nsfwEnabled);
    const response = await generateAIResponse(
      systemPrompt,
      conversationHistory || [],
      message
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    );
  }
}
