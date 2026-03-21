import { NextResponse } from "next/server";
import { generateAIResponse, buildSystemPrompt } from "@/lib/gemini";
import { mockCharacters } from "@/lib/mock-data";

interface ChatRequestBody {
  characterId: string;
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  nsfwEnabled: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { characterId, message, conversationHistory, nsfwEnabled } = body;

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

    // Check NSFW gating: character is NSFW but user hasn't enabled it
    if (character.is_nsfw && !nsfwEnabled) {
      return NextResponse.json(
        { error: "NSFW content is not enabled. Please enable it in settings." },
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
