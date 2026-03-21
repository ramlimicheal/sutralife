import { NextResponse } from "next/server";
import { mockCharacters } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const trait = searchParams.get("trait");
  const search = searchParams.get("search");

  let characters = [...mockCharacters];

  if (category && category !== "all") {
    characters = characters.filter((c) => c.category === category);
  }

  if (trait) {
    characters = characters.filter((c) =>
      c.traits.some((t) => t.toLowerCase() === trait.toLowerCase())
    );
  }

  if (search) {
    const q = search.toLowerCase();
    characters = characters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.traits.some((t) => t.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ characters });
}
