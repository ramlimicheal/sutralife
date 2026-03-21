import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateAIResponse, buildSystemPrompt } from "@/lib/gemini";
import { mockCharacters } from "@/lib/mock-data";
import { shouldShowNSFW } from "@/lib/nsfw-gate";
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

    // Server-side NSFW gating: verify user session and profile
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
          const user: User = {
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

    // Check NSFW gating: character is NSFW but user hasn't passed all 3 layers
    if (character.is_nsfw && !nsfwEnabled) {
      return NextResponse.json(
        { error: "NSFW content is not enabled. Please enable it in settings and ensure you have a qualifying subscription." },
        { status: 403 }
      );
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
