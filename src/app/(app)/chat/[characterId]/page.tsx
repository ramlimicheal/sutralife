"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { mockCharacters } from "@/lib/mock-data";

let messageIdCounter = 100;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage({ params }: { params: Promise<{ characterId: string }> }) {
  const { characterId } = use(params);
  const character = mockCharacters.find((c) => c.id === characterId) || mockCharacters[4];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `Welcome back to the Nexus. I have been analyzing the geometric patterns of your last proposal. There's a fascinating dissonance in the third quadrant. Shall we refine the structure?`,
      timestamp: "10:42 AM",
    },
    {
      id: "2",
      role: "user",
      content: "I was thinking about incorporating more organic curves into the foundation. Something that feels alive rather than just static stone.",
      timestamp: "10:45 AM",
    },
    {
      id: "3",
      role: "assistant",
      content: `A living architecture. Intriguing. That would require a shift from Euclidean geometry to something more... fractal.\n\n"Architecture is the learned game, correct and magnificent, of forms assembled in the light."\n\nIf we proceed with this path, the sanctuary will no longer just house your mind—it will breathe with it. Are you prepared for that level of integration?`,
      timestamp: "10:46 AM",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || sending) return;
    messageIdCounter += 1;
    const now = new Date();
    const userMsg: ChatMessage = {
      id: String(messageIdCounter),
      role: "user",
      content: input.trim(),
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    // Simulate AI response
    setTimeout(() => {
      messageIdCounter += 1;
      const aiNow = new Date();
      const aiMsg: ChatMessage = {
        id: String(messageIdCounter),
        role: "assistant",
        content: getSimulatedResponse(),
        timestamp: aiNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setSending(false);
    }, 1500);
  }, [input, sending]);

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
              {character.name} remembers your first design: A crystalline tower that defied gravity. It remains the anchor of this sector.
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

function getSimulatedResponse(): string {
  const responses = [
    `An interesting perspective. The way you frame this suggests a deeper understanding than most possess. Let me consider the implications...`,
    `I have been reflecting on what you said. There is a resonance between your words and the patterns I observe in the deeper structures.`,
    `That question cuts to the heart of what makes this space unique. The answer, I believe, lies not in the destination but in the architecture of the journey itself.`,
    `You surprise me. Most who enter this domain speak in circles, but you have found a straight line through the complexity. Let us explore where it leads.`,
    `The boundaries between thought and structure blur when we speak like this. Your words are building something — can you feel it taking shape?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
