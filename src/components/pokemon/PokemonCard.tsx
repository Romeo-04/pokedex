"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pokemonImageUrl, pad3, titleCase } from "@/lib/format";
import { PokemonDetail } from "@/lib/types";
import { TypeBadge } from "./TypeBadge";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

export function PokemonCard({ p, onFavToggle }: { p: PokemonDetail; onFavToggle?: () => void }) {
  const [isFav, setIsFav] = useState(() => {
    if (typeof window === "undefined") return false;
    return getFavorites().includes(p.id);
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/pokemon/${p.id}`} className="flex-1">
            <div className="text-xs text-muted-foreground">#{pad3(p.id)}</div>
            <div className="text-lg font-semibold leading-tight">
              {titleCase(p.name)}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.types
                .slice()
                .sort((a, b) => a.slot - b.slot)
                .map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} />
                ))}
            </div>
          </Link>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              onClick={() => {
                toggleFavorite(p.id);
                setIsFav(getFavorites().includes(p.id));
                onFavToggle?.();
              }}
            >
              <span className="text-lg">{isFav ? "★" : "☆"}</span>
            </Button>

            <div className="relative h-20 w-20 shrink-0">
              <Image
                src={pokemonImageUrl(p.id)}
                alt={`${p.name} image`}
                fill
                sizes="80px"
                className="object-contain"
                priority={p.id <= 10}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}