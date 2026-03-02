import { PokemonDetail, PokemonListResponse } from "./types";

const API_BASE_URL = "https://pokeapi.co/api/v2";

/** Extracts the numeric ID from a PokéAPI resource URL like .../pokemon/25/ */
function idFromUrl(url: string): number {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? Number(match[1]) : 0;
}

/** Main-series Pokémon only — excludes alternate forms (IDs >= 10000). */
function isMainSeries(url: string): boolean {
    return idFromUrl(url) < 10000;
}

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

export async function fetchPokemonPage(limit: number, offset: number) {
    // Fetch a larger window so we always return `limit` main-series Pokémon
    // even if some slots are occupied by form entries.
    const raw = await apiGet<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
    const filtered = raw.results.filter((r) => isMainSeries(r.url));
    return {
        ...raw,
        results: filtered,
        // Cap count to main-series only (forms start at 10001)
        count: Math.min(raw.count, 10000),
    };
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

/** Lightweight call that returns every Pokémon name + URL (no details). */
export async function fetchAllPokemonNames() {
    const raw = await apiGet<PokemonListResponse>(`/pokemon?limit=100000&offset=0`);
    const filtered = raw.results.filter((r) => isMainSeries(r.url));
    return { ...raw, results: filtered, count: filtered.length };
}

/** Returns all Pokémon names belonging to a single type (main-series only). Uses force-cache since type data rarely changes. */
export async function fetchPokemonNamesByType(type: string): Promise<string[]> {
    const res = await fetch(`${API_BASE_URL}/type/${type}`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`API error ${res.status} for /type/${type}`);
    const data = (await res.json()) as {
        pokemon: { pokemon: { name: string; url: string } }[];
    };
    // Filter out alternate forms (IDs >= 10000)
    return data.pokemon
        .filter((e) => isMainSeries(e.pokemon.url))
        .map((e) => e.pokemon.name);
}

