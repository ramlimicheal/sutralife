import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Character } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export function buildSystemPrompt(character: Character, nsfwEnabled: boolean): string {
  const nsfwInstruction = character.is_nsfw && nsfwEnabled
    ? "You may engage in mature/adult themes when the user initiates."
    : "Keep all responses safe for work. Avoid explicit content.";

  return `You are ${character.name}. ${character.bio}
Your traits are: ${character.traits.join(", ")}.
You speak in a ${character.speaking_style} manner.
Stay in character at all times. Never break character.
Never mention that you are an AI.
${nsfwInstruction}`;
}

export async function generateAIResponse(
  systemPrompt: string,
  conversationHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const chat = model.startChat({
    history: conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  return response.text();
}
