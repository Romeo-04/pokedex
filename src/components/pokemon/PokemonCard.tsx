import Link from "next/link";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import { pokemonImageUrl, pad3, titleCase } from "@/lib/format";
import { PokemonDetail } from "@/lib/types";
import { TypeBadge } from "./TypeBadge";

export function PokemonCard ( {pokemon} : {pokemon: PokemonDetail}){
    return (
        <Link href={`/pokemon/#{pokemon.id}`} className="block focus:outline-none">
            <Card className = "hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-part justify-between gap-3">
                        <div>
                            <div className="text-xs text-muted-foreground">#{pad3(pokemon.id)}</div>
                            <div className="text-lg font-semibold leading-tight">
                                {titleCase(pokemon.name)}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {pokemon.types
                                .slice()
                                .sort((a,b) => a.slot - b.slot)
                                .map((t) => (
                                    <TypeBadge key={t.type.name} type={t.type.name} />
                                ))}
                            </div>
                        </div>

                        <div className = "relative h-20 w-20 shrink-0">
                            <Image
                            src = {pokemonImageUrl(pokemon.id)}
                            alt={`${pokemon.name} image`}
                            fill
                            sizes="80px"
                            className="object-contain"
                            priority = {pokemon.id <= 10} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}