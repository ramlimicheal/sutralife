"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const mainNav = [
  { href: "/discover", label: "Home", icon: "home" },
  { href: "/chat/5", label: "Chats", icon: "chat_bubble" },
  { href: "/library", label: "My Personas", icon: "person_play" },
];

const createItems = [
  { href: "/create", label: "Character", icon: "person_add" },
  { href: "/create", label: "Lorebook", icon: "menu_book", badge: "Soon" as const },
  { href: "/create", label: "Group Chat", icon: "group", badge: "Soon" as const },
];

const myCreationsItems = [
  { href: "/library?tab=created", label: "Characters", icon: "face" },
  { href: "/library", label: "Lorebooks", icon: "auto_stories", badge: "Soon" as const },
  { href: "/library", label: "Groups", icon: "groups", badge: "Soon" as const },
];

const browseItems = [
  { href: "/library?tab=favorites", label: "Favorites", icon: "favorite" },
  { href: "/discover?sort=recommended", label: "Recommendations", icon: "recommend" },
  { href: "/discover?sort=trending", label: "Leaderboard", icon: "leaderboard" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [createOpen, setCreateOpen] = useState(true);
  const [creationsOpen, setCreationsOpen] = useState(false);
  const [phantomUnread, setPhantomUnread] = useState(0);

  // Poll phantom message unread count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/phantom-messages?unreadOnly=true");
        if (res.ok) {
          const data = await res.json();
          setPhantomUnread(data.unreadCount ?? 0);
        }
      } catch {
        // non-critical
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  function isActive(href: string): boolean {
    const cleanHref = href.split("?")[0];
    if (cleanHref === "/discover") return pathname === "/discover";
    return pathname.startsWith(cleanHref);
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-[240px] fixed left-0 top-0 z-50 bg-sidebar border-r border-border flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-border-subtle">
          <Link href="/discover" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center shadow-lg shadow-accent/15">
              <span className="material-symbols-outlined text-bg text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-accent-light leading-none tracking-tight">Sanctuary</h1>
              <p className="text-[9px] uppercase tracking-[0.15em] text-text-tertiary font-label mt-0.5">Digital Persona</p>
            </div>
          </Link>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {/* Main Nav */}
          {mainNav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                isActive(item.href)
                  ? "bg-accent/8 text-accent-light font-medium"
                  : "text-muted hover:bg-surface-high hover:text-text-primary"
              )}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="h-px bg-border-subtle my-2" />

          {/* Create Section (collapsible) */}
          <button
            onClick={() => setCreateOpen(!createOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md text-[13px] text-muted hover:bg-surface-high hover:text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              Create
            </span>
            <span className={cn("material-symbols-outlined text-[16px] transition-transform", createOpen && "rotate-180")}>
              expand_more
            </span>
          </button>
          {createOpen && (
            <div className="ml-3 space-y-0.5">
              {createItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-1.5 rounded-md text-[12px] text-text-secondary hover:bg-surface-high hover:text-text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </span>
                  {"badge" in item && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-label bg-accent/10 text-accent-light">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* My Creations Section (collapsible) */}
          <button
            onClick={() => setCreationsOpen(!creationsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md text-[13px] text-muted hover:bg-surface-high hover:text-text-primary transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">folder_special</span>
              My Creations
            </span>
            <span className={cn("material-symbols-outlined text-[16px] transition-transform", creationsOpen && "rotate-180")}>
              expand_more
            </span>
          </button>
          {creationsOpen && (
            <div className="ml-3 space-y-0.5">
              {myCreationsItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-1.5 rounded-md text-[12px] text-text-secondary hover:bg-surface-high hover:text-text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </span>
                  {"badge" in item && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-label bg-accent/10 text-accent-light">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border-subtle my-2" />

          {/* Browse */}
          {browseItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                isActive(item.href)
                  ? "bg-accent/8 text-accent-light font-medium"
                  : "text-muted hover:bg-surface-high hover:text-text-primary"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="h-px bg-border-subtle my-2" />

          {/* Phantom Messages */}
          <Link
            href="/phantom-messages"
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors",
              pathname === "/phantom-messages"
                ? "bg-accent/8 text-accent-light font-medium"
                : "text-muted hover:bg-surface-high hover:text-text-primary"
            )}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="material-symbols-outlined text-[18px]"
                style={pathname === "/phantom-messages" ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                notifications_active
              </span>
              Phantom Messages
            </span>
            {phantomUnread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-coral text-white min-w-[18px] text-center">
                {phantomUnread > 99 ? "99+" : phantomUnread}
              </span>
            )}
          </Link>

          {/* Pricing */}
          <Link
            href="/pricing"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
              pathname === "/pricing"
                ? "bg-accent/8 text-accent-light font-medium"
                : "text-muted hover:bg-surface-high hover:text-text-primary"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">diamond</span>
            Get Premium
          </Link>

          {/* Admin */}
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
              pathname === "/admin"
                ? "bg-accent/8 text-accent-light font-medium"
                : "text-muted hover:bg-surface-high hover:text-text-primary"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            Admin
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="border-t border-border-subtle px-2.5 py-2 space-y-0.5">
          {user ? (
            <div className="space-y-0.5">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                  pathname === "/settings" ? "bg-accent/8 text-accent-light" : "text-muted hover:bg-surface-high hover:text-text-primary"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </Link>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-muted hover:bg-surface-high hover:text-coral text-[13px] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="w-full py-2.5 rounded-lg border border-border bg-surface-high text-text-primary font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-surface-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              Sign In
            </Link>
          )}
        </div>

        {/* Social Links & Footer */}
        <div className="px-4 py-3 border-t border-border-subtle">
          <div className="flex items-center gap-3 mb-2">
            <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors" title="Discord">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.36-.698.772-1.362 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.12-.098.246-.198.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>
            <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors" title="X / Twitter">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors" title="Reddit">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            </a>
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-text-tertiary">
            <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Guidelines</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Support</a>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-border flex items-center justify-around py-2">
        {mainNav.map((item) => (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] transition-colors",
              isActive(item.href) ? "text-accent-light" : "text-muted"
            )}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
        <Link
          href="/library?tab=favorites"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] text-muted"
        >
          <span className="material-symbols-outlined text-[22px]">favorite</span>
          Favorites
        </Link>
        <Link
          href="/create"
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] text-accent-light"
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          Create
        </Link>
      </nav>
    </>
  );
}
