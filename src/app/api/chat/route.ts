import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { buildSystemPrompt } from "@/lib/gemini";
import { mockCharacters } from "@/lib/mock-data";
import { shouldShowNSFW, canAccessCharacter } from "@/lib/nsfw-gate";
import type { User, UserTier } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatRequestBody {
  characterId: string;
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

interface CookieToSet {
  name: string;
  value: string;
  options: Record<string, unknown>;
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
    let responseCookies: CookieToSet[] = [];

    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = await cookies();
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

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("age_verified, nsfw_enabled, tier, name")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          user = {
            id: authUser.id,
            email: authUser.email ?? "",
            name: profile.name ?? "",
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
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

    // Fallback: return simulated response when Gemini is not configured
    if (!geminiKey) {
      const simulated = getSimulatedResponse();
      const res = NextResponse.json({ response: simulated });
      responseCookies.forEach(({ name, value, options }) => {
        res.cookies.set(name, value, options);
      });
      return res;
    }

    // Use streaming for real AI response via Server-Sent Events
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: (conversationHistory || []).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessageStream(message);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    const streamResponse = new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    // Persist refreshed auth cookies on streaming response
    responseCookies.forEach(({ name, value, options }) => {
      const path = typeof options.path === "string" ? options.path : "/";
      streamResponse.headers.append("Set-Cookie", `${name}=${value}; Path=${path}; HttpOnly; SameSite=Lax`);
    });

    return streamResponse;
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    );
  }
}

function getSimulatedResponse(): string {
  const responses = [
    `An interesting perspective. The way you frame this suggests a deeper understanding than most possess. Let me consider the implications...`,
    `I have been reflecting on what you said. There is a resonance between your words and the patterns I observe in the deeper structures.`,
    `That question cuts to the heart of what makes this space unique. The answer lies not in the destination but in the architecture of the journey itself.`,
    `You surprise me. Most who enter this domain speak in circles, but you have found a straight line through the complexity.`,
    `The boundaries between thought and structure blur when we speak like this. Your words are building something — can you feel it taking shape?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
