"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import CharacterCard from "@/components/CharacterCard";
import { mockCharacters, heroCharacter } from "@/lib/mock-data";
import type { Character } from "@/types";

const categories = ["All Personas", "Cyberpunk", "Historical", "Fantasy", "Slice of Life", "Supernatural"];
const traits = ["Romantic", "Mysterious", "Aggressive", "Cheerful", "Loyal"];

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState("All Personas");
  const [activeTraits, setActiveTraits] = useState<string[]>([]);
  const [characters, setCharacters] = useState<Character[]>(mockCharacters);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCharacters = useCallback(async (resetPage = false, explicitPage?: number) => {
    setLoading(true);
    const currentPage = explicitPage ?? (resetPage ? 1 : page);
    if (resetPage) setPage(1);

    try {
      const params = new URLSearchParams();
      if (activeCategory !== "All Personas") {
        params.set("category", activeCategory.toLowerCase().replace(/ /g, "-"));
      }
      if (activeTraits.length > 0) {
        params.set("trait", activeTraits[0]);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      params.set("page", String(currentPage));
      params.set("limit", "20");

      const res = await fetch(`/api/characters?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.characters?.length > 0) {
          setCharacters(prev => resetPage ? data.characters : [...prev, ...data.characters]);
          setHasMore(data.hasMore ?? false);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to mock data
    }

    // Fallback: filter mock data client-side
    let filtered = [...mockCharacters];
    if (activeCategory !== "All Personas") {
      const cat = activeCategory.toLowerCase().replace(/ /g, "-");
      filtered = filtered.filter((c) => c.category === cat);
    }
    if (activeTraits.length > 0) {
      filtered = filtered.filter((c) =>
        activeTraits.some((t) => c.traits.includes(t))
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q)
      );
    }
    setCharacters(filtered);
    setHasMore(false);
    setLoading(false);
  }, [activeCategory, activeTraits, searchQuery, page]);

  useEffect(() => {
    const load = async () => {
      await fetchCharacters(true);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeTraits, searchQuery]);

  function toggleTrait(trait: string) {
    setActiveTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCharacters(false, nextPage);
  }

  return (
    <div className="bg-bg">
      {/* Hero Banner */}
      <section className="px-4 md:px-6 pt-6">
        <div className="relative h-[280px] md:h-[360px] w-full rounded-xl overflow-hidden group border border-border-subtle">
          <Image
            src={heroCharacter.avatar_url}
            alt="Hero banner"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 max-w-xl">
            <span className="text-coral font-label font-bold text-[10px] uppercase tracking-[0.25em] mb-3">Featured Persona</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-text-primary mb-3 leading-tight tracking-tight">
              Meet the Architect of <span className="text-gradient">Neo-Tokyo</span>
            </h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed max-w-md hidden md:block">
              Engage in deep, meaningful conversations with Akira, a high-intelligence AI designed to guide you through the digital sprawl.
            </p>
            <div className="flex gap-3">
              <Link
                href={`/chat/${heroCharacter.id}`}
                className="px-6 py-2.5 cta-gradient text-bg font-semibold text-[13px] rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-accent/15"
              >
                Start Chatting <span className="material-symbols-outlined text-[16px]">chat</span>
              </Link>
              <Link
                href={`/character/${heroCharacter.id}`}
                className="px-6 py-2.5 bg-surface-high/60 backdrop-blur-md border border-border text-text-primary font-semibold text-[13px] rounded-lg hover:bg-surface-highest transition-all"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Feed */}
      <div className="flex flex-col md:flex-row px-4 md:px-6 py-8 gap-6">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-52 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-[12px] text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-accent text-[16px]">filter_list</span>Categories
            </h3>
            <div className="flex md:flex-col flex-wrap gap-1 md:space-y-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-2 rounded-md font-label text-[13px] transition-colors ${
                    activeCategory === cat
                      ? "bg-accent/8 text-accent-light font-semibold"
                      : "text-text-secondary hover:bg-surface-high hover:text-text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[12px] text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-accent text-[16px]">psychology</span>Traits
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {traits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => toggleTrait(trait)}
                  className={`px-2.5 py-1 rounded-md border font-label text-[10px] cursor-pointer transition-colors ${
                    activeTraits.includes(trait)
                      ? "bg-accent/15 border-accent text-accent-light"
                      : "bg-surface border-border text-text-secondary hover:border-accent hover:text-accent-light"
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Trending Characters</h3>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-md bg-surface-highest text-text-primary border border-border">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button className="p-1.5 rounded-md text-text-tertiary hover:bg-surface-high border border-transparent">
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>
          </div>

          {loading && characters.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[280px] rounded-xl bg-surface-highest animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {characters.map((char) => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          )}

          {!loading && characters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-[48px] text-text-tertiary mb-4">search_off</span>
              <p className="text-text-secondary text-[14px] mb-2">No characters found</p>
              <p className="text-text-tertiary text-[12px]">Try adjusting your filters</p>
            </div>
          )}

          {characters.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-2.5 bg-surface-highest border border-border rounded-lg text-text-secondary text-[13px] font-medium hover:bg-surface-high hover:text-text-primary transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
