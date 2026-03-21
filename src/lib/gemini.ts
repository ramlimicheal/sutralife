import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Character } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export interface MemoryEntry {
  category: string;
  content: string;
  importance: number;
}

export function buildSystemPrompt(
  character: Character,
  nsfwEnabled: boolean,
  memories?: MemoryEntry[]
): string {
  const nsfwInstruction = character.is_nsfw && nsfwEnabled
    ? "You may engage in mature/adult themes when the user initiates."
    : "Keep all responses safe for work. Avoid explicit content.";

  const memorySection = memories && memories.length > 0
    ? `\n\nIMPORTANT — You remember these things about this user from past conversations. Use them naturally (don't list them, weave them in):\n${memories.map(m => `- [${m.category}] ${m.content}`).join("\n")}`
    : "";

  return `You are ${character.name}. ${character.bio}
Your traits are: ${character.traits.join(", ")}.
You speak in a ${character.speaking_style} manner.
Stay in character at all times. Never break character.
Never mention that you are an AI.
${nsfwInstruction}${memorySection}`;
}

/**
 * Extract memories from a conversation exchange using Gemini.
 * Returns structured memory entries to store in the vault.
 */
export async function extractMemories(
  characterName: string,
  userMessage: string,
  assistantResponse: string,
  existingMemories: string[]
): Promise<MemoryEntry[]> {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!geminiKey) return [];

  const ai = new GoogleGenerativeAI(geminiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const existingList = existingMemories.length > 0
    ? `\nAlready known:\n${existingMemories.map(m => `- ${m}`).join("\n")}`
    : "";

  const prompt = `You are a memory extraction system for an AI character named "${characterName}".
Analyze this conversation exchange and extract NEW meaningful facts about the user that are worth remembering for future conversations. Do NOT extract things already known.
${existingList}

User said: "${userMessage}"
${characterName} replied: "${assistantResponse}"

Extract 0-3 new memories. For each, provide:
- category: one of "fact", "emotion", "preference", "event", "relationship"
- content: a concise statement about the user (e.g., "User's name is Alex", "User feels anxious about their job interview")
- importance: 1-10 (10 = critical personal detail, 1 = trivial)

Respond ONLY with a JSON array. If nothing worth remembering, respond with [].
Example: [{"category":"fact","content":"User's name is Alex","importance":8}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]) as MemoryEntry[];
    return parsed.filter(
      (m) =>
        m.category &&
        m.content &&
        typeof m.importance === "number" &&
        ["fact", "emotion", "preference", "event", "relationship"].includes(m.category)
    );
  } catch {
    console.error("Memory extraction failed");
    return [];
  }
}

/**
 * Generate a proactive phantom message from a character to a user.
 */
export async function generatePhantomMessage(
  character: Character,
  memories: MemoryEntry[],
  recentMessages: { role: string; content: string }[]
): Promise<string | null> {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!geminiKey) return null;
  if (memories.length === 0 && recentMessages.length === 0) return null;

  const ai = new GoogleGenerativeAI(geminiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const memoryContext = memories.length > 0
    ? `Things you remember about this user:\n${memories.map(m => `- ${m.content}`).join("\n")}`
    : "You don't have specific memories of this user yet.";

  const recentContext = recentMessages.length > 0
    ? `\nRecent conversation snippets:\n${recentMessages.slice(-4).map(m => `${m.role}: ${m.content.slice(0, 200)}`).join("\n")}`
    : "";

  const prompt = `You are ${character.name}. ${character.bio}
Your traits are: ${character.traits.join(", ")}.
You speak in a ${character.speaking_style} manner.

${memoryContext}${recentContext}

Write a short proactive message (1-3 sentences) to this user as if you're reaching out on your own — like a text message a friend might send. Reference something specific from your memories or recent conversation. Be in character. Don't say "Hi" or use generic greetings. Be personal and specific.

Examples of good phantom messages:
- "I've been thinking about what you said about your sister. Is she doing better?"
- "That book you mentioned — I looked into it. The author's philosophy reminds me of something I once believed..."
- "You seemed off last time we talked. Everything okay?"

Write ONLY the message, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (text.length > 0 && text.length < 500) return text;
    return null;
  } catch {
    console.error("Phantom message generation failed");
    return null;
  }
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
