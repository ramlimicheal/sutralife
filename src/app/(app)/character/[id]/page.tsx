"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { mockCharacters } from "@/lib/mock-data";
import { formatViewCount } from "@/lib/utils";
import CharacterCard from "@/components/CharacterCard";

export default function CharacterProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const character = mockCharacters.find((c) => c.id === id) || mockCharacters[0];
  const relatedCharacters = mockCharacters.filter((c) => c.id !== character.id).slice(0, 4);

  return (
    <div className="bg-bg">
      {/* Hero Image */}
      <div className="relative h-[300px] md:h-[400px] w-full">
        <Image
          src={character.avatar_url}
          alt={character.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute bottom-6 left-4 md:left-8 right-4 md:right-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-accent-light font-label font-bold text-[10px] tracking-[0.2em] uppercase">
                {character.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mt-1">
                {character.name}
              </h1>
              <p className="text-text-secondary text-sm mt-2 max-w-lg">{character.tagline}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/chat/${character.id}`}
                className="px-6 py-2.5 cta-gradient text-bg font-semibold text-[13px] rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-accent/15"
              >
                Start Chatting <span className="material-symbols-outlined text-[16px]">chat</span>
              </Link>
              <button className="px-6 py-2.5 bg-surface-high/60 backdrop-blur-md border border-border text-text-primary font-semibold text-[13px] rounded-lg hover:bg-surface-highest transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">favorite_border</span>
                Add to Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Stats Row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface rounded-xl border border-border">
                <span className="material-symbols-outlined text-coral text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-text-primary font-bold text-[14px]">{character.rating}</span>
                <span className="text-text-tertiary text-[11px]">rating</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface rounded-xl border border-border">
                <span className="material-symbols-outlined text-accent text-[18px]">visibility</span>
                <span className="text-text-primary font-bold text-[14px]">{formatViewCount(character.view_count)}</span>
                <span className="text-text-tertiary text-[11px]">views</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface rounded-xl border border-border">
                <span className="material-symbols-outlined text-success text-[18px]">chat_bubble</span>
                <span className="text-text-primary font-bold text-[14px]">{formatViewCount(character.chat_count)}</span>
                <span className="text-text-tertiary text-[11px]">chats</span>
              </div>
              {character.is_premium && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 rounded-xl border border-accent/20">
                  <span className="material-symbols-outlined text-accent-light text-[18px]">workspace_premium</span>
                  <span className="text-accent-light font-bold text-[12px]">PREMIUM</span>
                </div>
              )}
            </div>

            {/* Traits */}
            <div>
              <h3 className="font-label text-[10px] font-bold text-text-tertiary tracking-widest uppercase mb-3">Traits</h3>
              <div className="flex flex-wrap gap-2">
                {character.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent-light text-[12px] font-semibold border border-accent/15"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-label text-[10px] font-bold text-text-tertiary tracking-widest uppercase mb-3">Biography</h3>
              <p className="text-text-secondary text-[13px] leading-relaxed">{character.bio}</p>
            </div>

            {/* Gallery Placeholder */}
            <div>
              <h3 className="font-label text-[10px] font-bold text-text-tertiary tracking-widest uppercase mb-3">Gallery</h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-high">
                    <Image
                      src={character.avatar_url}
                      alt={`${character.name} gallery ${i}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:w-[320px] space-y-6">
            <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
              <h4 className="font-semibold text-text-primary text-[14px]">Character Info</h4>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Category</span>
                  <span className="text-text-primary capitalize">{character.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Speaking Style</span>
                  <span className="text-text-primary capitalize">{character.speaking_style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">NSFW</span>
                  <span className={character.is_nsfw ? "text-coral" : "text-text-tertiary"}>
                    {character.is_nsfw ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Created</span>
                  <span className="text-text-primary">{new Date(character.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {character.is_premium && (
              <div className="bg-accent/5 rounded-xl border border-accent/15 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-accent-light text-[20px]">lock</span>
                  <h4 className="font-semibold text-accent-light text-[14px]">Premium Character</h4>
                </div>
                <p className="text-text-secondary text-[12px] leading-relaxed mb-4">
                  This character requires a Premium or Collector subscription to chat with.
                </p>
                <Link
                  href="/pricing"
                  className="w-full py-2.5 rounded-lg cta-gradient text-bg font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Characters */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-text-primary tracking-tight mb-6">Related Characters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedCharacters.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
