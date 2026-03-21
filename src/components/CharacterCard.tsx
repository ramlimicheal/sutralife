"use client";

import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/types";
import { formatViewCount } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link href={`/character/${character.id}`} className="group">
      <div className="bg-surface rounded-xl overflow-hidden hover:bg-surface-high transition-all duration-200 border border-border hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={character.avatar_url}
            alt={character.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-label font-bold text-accent-light flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              {formatViewCount(character.view_count)}
            </span>
          </div>
          {character.is_premium && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-md bg-accent/80 backdrop-blur-md text-[10px] font-label font-bold text-white">
                PRO
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-[14px] text-text-primary mb-1 group-hover:text-accent-light transition-colors">
            {character.name}
          </h4>
          <p className="text-text-secondary text-[11px] line-clamp-2 mb-3 leading-relaxed">
            {character.tagline}
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            {character.traits.map((trait) => (
              <span
                key={trait}
                className="px-2 py-0.5 rounded-md bg-surface-highest text-[10px] font-label text-text-secondary border border-border"
              >
                {trait}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-coral">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-[11px] font-bold font-label">{character.rating}</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/chat/${character.id}`;
              }}
              className="w-7 h-7 rounded-lg bg-accent/10 text-accent-light flex items-center justify-center hover:bg-accent hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">chat</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
