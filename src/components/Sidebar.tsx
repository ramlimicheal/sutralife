"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/discover", label: "Discover", icon: "explore" },
  { href: "/library", label: "Library", icon: "auto_stories" },
  { href: "/chat/5", label: "Messages", icon: "chat_bubble" },
  { href: "/character/1", label: "Characters", icon: "group" },
];

const bottomLinks = [
  { href: "#", label: "Discord", icon: "group_add" },
  { href: "#", label: "Twitter", icon: "campaign" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/discover") return pathname === "/discover";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-[240px] fixed left-0 top-0 z-50 bg-sidebar border-r border-border flex-col">
        <div className="h-14 flex items-center px-5 border-b border-border-subtle">
          <Link href="/discover" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center shadow-lg shadow-accent/15">
              <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-accent-light leading-none tracking-tight">Sanctuary</h1>
              <p className="text-[9px] uppercase tracking-[0.15em] text-text-tertiary font-label mt-0.5">Digital Persona</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                isActive(item.href)
                  ? "bg-accent/8 text-accent-light font-medium border-r-2 border-accent"
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
        </nav>

        <div className="px-3 pb-3">
          <Link
            href="/create"
            className="w-full py-2.5 rounded-lg cta-gradient text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-lg shadow-accent/10 hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create Character
          </Link>
        </div>

        <div className="border-t border-border-subtle px-2.5 py-2 space-y-0.5">
          {bottomLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-muted hover:bg-surface-high hover:text-text-primary text-[13px] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-border flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
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
