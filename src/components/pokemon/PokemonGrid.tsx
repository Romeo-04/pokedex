import { PokemonDetail } from "@/lib/types";
import { PokemonCard } from "./PokemonCard";
import { PokemonCardSkeleton } from "./PokemonCardSkeleton";

export function PokemonGrid ({
    items,
    loading,
    loadingMore = false,
    onFavToggle,
}: {
    items: PokemonDetail[];
    loading: boolean;
    loadingMore?: boolean;
    onFavToggle?: () => void;
}) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, idx) => (
                  <PokemonCardSkeleton key={idx} />
                ))
              : items.map((pokemon) => (
                  <PokemonCard key={pokemon.id} p={pokemon} onFavToggle={onFavToggle} />
                ))}
            {loadingMore &&
              Array.from({ length: 8 }).map((_, idx) => (
                <PokemonCardSkeleton key={`more-${idx}`} />
              ))}
        </div>
    );
}