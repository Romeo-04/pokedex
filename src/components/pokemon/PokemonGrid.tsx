import { PokemonDetail } from "@/lib/types";
import { PokemonCard } from "./PokemonCard";
import { PokemonCardSkeleton } from "./PokemonCardSkeleton";

export function PokemonGrid ({
    items,
    loading,
}: {
    items: PokemonDetail[];
    loading: boolean;
}) {
    return (
        <div className="grid grid-cols-2 lg:grid=cols-3 xl:grid-cols-4">
            {items.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />

            ))}
            {loading && 
            Array.from ({length : 10}).map((_,idx) => <PokemonCardSkeleton key = {idx} />)}
        </div>
    );
}