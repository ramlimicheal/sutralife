"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

interface PhantomMessage {
  id: string;
  character_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  characters: {
    id: string;
    name: string;
    avatar_url: string;
    tagline: string;
  } | null;
}

export default function PhantomMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PhantomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/phantom-messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadMessages();
  }, [user, loadMessages]);

  const markAsRead = async (messageIds: string[]) => {
    try {
      await fetch("/api/phantom-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds }),
      });
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m.id) ? { ...m, is_read: true } : m
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - messageIds.length));
    } catch {
      // non-critical
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/phantom-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      setUnreadCount(0);
    } catch {
      // non-critical
    }
  };

  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-text-tertiary mb-3 opacity-30">notifications</span>
          <p className="text-[13px] text-text-secondary">Sign in to see phantom messages</p>
          <Link href="/auth" className="mt-3 inline-block text-[12px] text-accent-light hover:text-accent transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl cta-gradient flex items-center justify-center shadow-lg shadow-accent/15">
              <span className="material-symbols-outlined text-bg text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications_active
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">Phantom Messages</h1>
              <p className="text-[12px] text-text-secondary mt-0.5">
                Characters reaching out to you
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-lg bg-surface-high border border-border text-[12px] text-text-secondary hover:text-text-primary transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface-high border border-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-[18px]">mail</span>
            <span className="text-[12px] text-text-secondary">
              <span className="font-bold text-text-primary">{messages.length}</span> total
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-coral text-[18px]">mark_email_unread</span>
            <span className="text-[12px] text-text-secondary">
              <span className="font-bold text-text-primary">{unreadCount}</span> unread
            </span>
          </div>
        </div>

        {/* Message List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-text-tertiary text-[13px]">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-high border border-border flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[36px] text-text-tertiary opacity-40">notifications_off</span>
            </div>
            <h3 className="text-[15px] font-bold text-text-primary mb-1">No phantom messages yet</h3>
            <p className="text-[12px] text-text-secondary max-w-[320px]">
              Chat with characters and share things about yourself. They&apos;ll start reaching out to you on their own.
            </p>
            <Link
              href="/discover"
              className="mt-4 px-5 py-2.5 rounded-lg cta-gradient text-bg text-[12px] font-semibold hover:opacity-90 transition-opacity"
            >
              Discover Characters
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <Link
                key={msg.id}
                href={`/chat/${msg.character_id}`}
                onClick={() => {
                  if (!msg.is_read) markAsRead([msg.id]);
                }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-accent/20 ${
                  msg.is_read
                    ? "bg-surface-high border-border"
                    : "bg-accent/5 border-accent/15 shadow-sm shadow-accent/5"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-accent/10">
                    {msg.characters?.avatar_url ? (
                      <Image
                        src={msg.characters.avatar_url}
                        alt={msg.characters?.name ?? "Character"}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-text-tertiary text-[20px]">person</span>
                      </div>
                    )}
                  </div>
                  {!msg.is_read && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-surface" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[13px] font-semibold ${msg.is_read ? "text-text-secondary" : "text-text-primary"}`}>
                      {msg.characters?.name ?? "Unknown Character"}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-label shrink-0 ml-2">
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                  <p className={`text-[12px] leading-relaxed line-clamp-2 ${msg.is_read ? "text-text-tertiary" : "text-text-secondary"}`}>
                    {msg.content}
                  </p>
                </div>

                {/* Arrow */}
                <span className="material-symbols-outlined text-text-tertiary text-[16px] mt-1 shrink-0">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
