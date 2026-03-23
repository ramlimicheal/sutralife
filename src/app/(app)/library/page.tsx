"use client";

import { useState, useEffect } from "react";
import CharacterCard from "@/components/CharacterCard";
import { mockCharacters } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import type { Character } from "@/types";

type Tab = "recent" | "favorites" | "created";

export default function LibraryPage() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const [recentCharacters, setRecentCharacters] = useState<Character[]>(mockCharacters.slice(0, 5));
  const [favoriteCharacters, setFavoriteCharacters] = useState<Character[]>(mockCharacters.slice(2, 6));
  const [createdCharacters, setCreatedCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    const loadLibrary = async () => {
      setLoading(true);
      try {
        // Fetch recent conversations
        const convRes = await fetch("/api/conversations");
        if (convRes.ok) {
          const convData = await convRes.json();
          if (convData.conversations?.length > 0) {
            const recentChars = convData.conversations
              .filter((c: { characters: Character | null }) => c.characters)
              .map((c: { characters: Character }) => c.characters);
            if (recentChars.length > 0) setRecentCharacters(recentChars);
          }
        }

        // Fetch favorites
        const favRes = await fetch("/api/favorites");
        if (favRes.ok) {
          const favData = await favRes.json();
          if (favData.favorites?.length > 0) {
            const favChars = favData.favorites
              .filter((f: { characters: Character | null }) => f.characters)
              .map((f: { characters: Character }) => f.characters);
            if (favChars.length > 0) setFavoriteCharacters(favChars);
          }
        }

        // Fetch created characters
        const charRes = await fetch(`/api/characters?creator=${authUser.id}`);
        if (charRes.ok) {
          const charData = await charRes.json();
          if (charData.characters) setCreatedCharacters(charData.characters);
        }
      } catch {
        // Keep mock data as fallback
      }
      setLoading(false);
    };
    loadLibrary();
  }, [authUser]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "recent", label: "Recently Chatted", icon: "schedule" },
    { key: "favorites", label: "Favorites", icon: "favorite" },
    { key: "created", label: "Created by You", icon: "edit" },
  ];

  function getCharacters() {
    switch (activeTab) {
      case "recent": return recentCharacters;
      case "favorites": return favoriteCharacters;
      case "created": return createdCharacters;
    }
  }

  const characters = getCharacters();

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Library</h2>
        <p className="text-text-secondary text-sm mt-1">Your saved characters and conversations</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border border-border mb-8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-surface-highest text-text-primary shadow-sm"
                : "text-muted hover:text-text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {characters.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-text-tertiary mb-4">
            {activeTab === "created" ? "edit_note" : "bookmark_border"}
          </span>
          <p className="text-text-secondary text-[14px] mb-2">
            {activeTab === "created" ? "You haven't created any characters yet" : "Nothing here yet"}
          </p>
          <p className="text-text-tertiary text-[12px] mb-6">
            {activeTab === "created"
              ? "Create your first AI character and share it with the community"
              : "Start exploring and chatting to build your library"}
          </p>
          <a
            href={activeTab === "created" ? "/create" : "/discover"}
            className="px-6 py-2.5 cta-gradient text-bg font-semibold text-[13px] rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">
              {activeTab === "created" ? "add" : "explore"}
            </span>
            {activeTab === "created" ? "Create Character" : "Discover Characters"}
          </a>
        </div>
      )}
    </div>
  );
}
