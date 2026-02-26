import { PokemonDetail, PokemonListResponse } from "./types";

const API_BASE_URL = "https://pokeapi.co/api/v2";

async function apiGet <T> (path: string, init?: RequestInit): Promise <T> {
    const res = await fetch(`${API_BASE_URL}${path}`,{
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },

            cache: "no-store",
        
    });

    if (!res.ok){
        throw new Error(`API error ${res.status} for ${path}`);

    }
    return res.json() as Promise <T>;
}

export async function fetchPokemonPage (limit: number, offset:number){
    return apiGet<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
}

export async function fetchPokemonDetailByName(name: string){
    return apiGet <PokemonDetail> (`/pokemon/${name}`);
}

export async function fetchPokemonDetailById(id :number){
    return apiGet <PokemonDetail> (`/pokemon/${id}`);
}

async function mapLimit <T,R> (
    items: T[],
    limit: number,
    fn: (item: T) => Promise <R>
): Promise <R[]> {
    const results: R[] = [];
    let idx = 0;

    const workers = Array.from ({ length: Math.min(limit, items.length)}, async () => {
        while (idx < items.length){
            const current = idx++;
            results[current] =await fn(items[current]);
        }
    });

    await Promise.all(workers);
    return results;
}

export async function fetchDetailsForPage(names: string[], concurrency = 6){
    return mapLimit(names, concurrency, (n)=> fetchPokemonDetailByName(n));
}

