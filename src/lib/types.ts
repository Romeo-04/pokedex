export type PokemonListItem = {
    name:string;
    url:string;
}

export type PokemonListResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonListItem[];
}

export type Pokemontype = {
    slot: number;
    type: { name: string; url: string;};
}

export type PokemonStat = {
    base_stat: number;
    stat: { name: string};
}

export type PokemonDetail = {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: Pokemontype[];
    stats: PokemonStat[];
    abilities: { ability: { name: string}}[];
    species: { name: string; url: string;};
}