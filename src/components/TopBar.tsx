"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-[240px] h-14 bg-bg/80 backdrop-blur-xl z-40 flex items-center justify-between px-4 md:px-6 border-b border-border-subtle">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px]">search</span>
          <input
            className="w-full bg-surface border border-border rounded-lg py-2 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 text-text-primary outline-none"
            placeholder="Search characters, creators, or tags..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:bg-surface-high hover:text-text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </button>
        <Link
          href="/settings"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:bg-surface-high hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </Link>
        <div className="h-6 w-px bg-border mx-1 hidden md:block" />
        <Link href="/settings" className="flex items-center gap-2.5 pl-1 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-semibold text-text-primary leading-none">Alex Mercer</p>
            <p className="text-[10px] font-label text-accent-light mt-0.5">PRO MEMBER</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-accent-surface flex items-center justify-center border border-border group-hover:border-accent transition-colors">
            <span className="material-symbols-outlined text-accent-light text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
