"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { mockCharacters } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import type { Character } from "@/types";

let messageIdCounter = 100;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage({ params }: { params: Promise<{ characterId: string }> }) {
  const { characterId } = use(params);
  const { user: authUser } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load character
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const res = await fetch(`/api/characters/${characterId}`);
        if (res.ok) {
          const data = await res.json();
          setCharacter(data.character);
        } else {
          // Fallback to mock data
          const mock = mockCharacters.find((c) => c.id === characterId) || mockCharacters[0];
          setCharacter(mock);
        }
      } catch {
        const mock = mockCharacters.find((c) => c.id === characterId) || mockCharacters[0];
        setCharacter(mock);
      }
    };
    loadCharacter();
  }, [characterId]);

  // Load conversation history
  useEffect(() => {
    if (!authUser || !character) return;
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/conversations?characterId=${characterId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversations?.length > 0) {
            const convoId = data.conversations[0].id;
            const msgRes = await fetch(`/api/conversations/${convoId}/messages`);
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              if (msgData.messages?.length > 0) {
                setMessages(
                  msgData.messages.map((m: { id: string; role: string; content: string; created_at: string }) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  }))
                );
                return;
              }
            }
          }
        }
      } catch {
        // Fall through to greeting
      }

      // Show greeting if no history
      if (character) {
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content: `Welcome. I am ${character.name}. ${character.tagline}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    };
    loadHistory();
  }, [authUser, character, characterId]);

  // Show greeting for non-authenticated users
  useEffect(() => {
    if (authUser || !character || messages.length > 0) return;
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: `Welcome. I am ${character.name}. ${character.tagline}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [authUser, character, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !character) return;
    setError(null);
    messageIdCounter += 1;
    const now = new Date();
    const userMsg: ChatMessage = {
      id: String(messageIdCounter),
      role: "user",
      content: input.trim(),
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const userText = input.trim();
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          message: userText,
          conversationHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error ?? "Failed to get response");
        setSending(false);
        return;
      }

      const contentType = res.headers.get("Content-Type") ?? "";

      if (contentType.includes("text/event-stream")) {
        // Handle streaming SSE response
        messageIdCounter += 1;
        const aiMsgId = String(messageIdCounter);
        const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        setMessages((prev) => [
          ...prev,
          { id: aiMsgId, role: "assistant", content: "", timestamp: aiTime },
        ]);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiMsgId
                          ? { ...m, content: m.content + parsed.text }
                          : m
                      )
                    );
                  }
                } catch {
                  // Skip invalid JSON chunks
                }
              }
            }
          }
        }
      } else {
        // Handle JSON response (fallback when Gemini not configured)
        const data = await res.json();
        messageIdCounter += 1;
        const aiMsg: ChatMessage = {
          id: String(messageIdCounter),
          role: "assistant",
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [input, sending, character, messages, characterId]);

  if (!character) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-surface">
        <div className="animate-pulse text-muted text-[13px]">Loading character...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Chat Area */}
      <section className="flex-1 flex flex-col relative bg-surface">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="w-9 h-9 rounded-lg bg-surface-highest shrink-0 overflow-hidden border border-accent/15">
                  <Image src={character.avatar_url} alt={character.name} width={36} height={36} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-accent-surface shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-light text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
              )}
              <div className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : ""}`}>
                <div
                  className={`px-4 py-3 rounded-xl text-[13px] border leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-surface-highest text-text-primary rounded-tl-none border-border"
                      : "bg-accent-surface text-accent-light rounded-tr-none border-accent/20"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="font-label text-[10px] text-text-tertiary px-1">
                  {msg.timestamp} {msg.role === "assistant" ? `\u2022 ${character.name.toUpperCase()}` : "\u2022 READ"}
                </span>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-9 h-9 rounded-lg bg-surface-highest shrink-0 overflow-hidden border border-accent/15">
                <Image src={character.avatar_url} alt={character.name} width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div className="bg-surface-highest text-text-tertiary px-4 py-3 rounded-xl rounded-tl-none text-[13px] border border-border">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="max-w-2xl mx-auto p-3 bg-coral/10 border border-coral/20 rounded-lg">
              <p className="text-coral text-[12px]">{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 md:p-5 bg-gradient-to-t from-bg to-transparent">
          <div className="max-w-3xl mx-auto relative flex items-center gap-2.5">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-highest border border-border text-muted hover:text-accent-light transition-colors">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full bg-bg border border-border rounded-xl py-2.5 px-4 pr-12 text-text-primary text-[13px] focus:ring-1 focus:ring-accent focus:border-accent resize-none placeholder:text-text-tertiary outline-none"
                placeholder="Type your message..."
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-dim transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-highest border border-border text-muted hover:text-accent-light transition-colors">
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right Pane: Profile */}
      <aside className="hidden lg:flex w-[360px] bg-surface border-l border-border flex-col overflow-y-auto">
        <div className="relative h-[400px] w-full group">
          <Image
            src={character.avatar_url}
            alt={character.name}
            fill
            className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5">
            <h3 className="text-2xl font-bold text-text-primary tracking-tight">{character.name}</h3>
            <p className="font-label text-accent-light font-bold text-[10px] tracking-[0.2em] mt-1">PRIMARY CONSTRUCT</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Traits */}
          <div className="space-y-3">
            <h4 className="font-label text-[10px] font-bold text-text-tertiary tracking-widest uppercase">Traits</h4>
            <div className="flex flex-wrap gap-1.5">
              {character.traits.map((trait, i) => (
                <span
                  key={trait}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                    i === 0
                      ? "bg-accent/10 text-accent-light border-accent/15"
                      : i === 1
                      ? "bg-coral/10 text-coral border-coral/15"
                      : "bg-surface-highest text-text-secondary border-border"
                  }`}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-3">
            <h4 className="font-label text-[10px] font-bold text-text-tertiary tracking-widest uppercase">Bio</h4>
            <p className="text-text-secondary text-[12px] leading-relaxed italic">{character.tagline}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-surface-high p-4 rounded-xl border border-border">
              <span className="material-symbols-outlined text-accent text-[18px] mb-2">auto_awesome</span>
              <p className="text-[10px] text-text-tertiary uppercase font-bold font-label">Interactions</p>
              <p className="text-lg font-bold text-text-primary mt-1">{character.chat_count.toLocaleString()}</p>
            </div>
            <div className="bg-surface-high p-4 rounded-xl border border-border">
              <span className="material-symbols-outlined text-coral text-[18px] mb-2">favorite</span>
              <p className="text-[10px] text-text-tertiary uppercase font-bold font-label">Affinity</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-1.5 flex-1 bg-surface-highest rounded-full overflow-hidden">
                  <div className="h-full bg-coral w-[85%]" />
                </div>
                <span className="text-[10px] font-bold text-text-primary">85%</span>
              </div>
            </div>
          </div>

          {/* Memory Card */}
          <div className="bg-surface-high p-5 rounded-xl border border-accent/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-5xl">psychology</span>
            </div>
            <h4 className="font-semibold text-text-primary text-[13px] mb-2">Core Memory</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {character.name} remembers your conversations and builds a deeper understanding over time.
            </p>
            <button className="mt-3 text-[10px] font-bold text-accent-light uppercase tracking-widest flex items-center gap-1 font-label hover:text-accent transition-colors">
              View Vault <span className="material-symbols-outlined text-[12px]">arrow_forward_ios</span>
            </button>
          </div>

          <button className="w-full py-3 rounded-xl bg-surface-highest text-coral font-semibold text-[13px] border border-coral/15 hover:bg-coral/10 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>Clear Memory
          </button>
        </div>
      </aside>
    </div>
  );
}
