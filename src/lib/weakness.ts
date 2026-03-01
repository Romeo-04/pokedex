type TypeDamageRelations = {
  double_damage_from: { name: string }[];
  half_damage_from: { name: string }[];
  no_damage_from: { name: string }[];
};

type TypeResponse = {
  name: string;
  damage_relations: TypeDamageRelations;
};

const API_BASE = "https://pokeapi.co/api/v2";

/**
 * Computes a multiplier map: { fire: 2, grass: 0.5, ghost: 0, ... }
 * for a Pokemon with 1 or 2 types.
 */
export async function computeTypeMultipliers(typeNames: string[]) {
  const unique = Array.from(new Set(typeNames)).slice(0, 2);

  // Start at 1x for all types and multiply as we go
  const mult = new Map<string, number>();

  async function fetchType(t: string): Promise<TypeResponse> {
    const res = await fetch(`${API_BASE}/type/${t}`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to fetch type: ${t}`);
    return (await res.json()) as TypeResponse;
  }

  const typeData = await Promise.all(unique.map(fetchType));

  // Apply each defending type's relations
  for (const td of typeData) {
    for (const x of td.damage_relations.double_damage_from) {
      mult.set(x.name, (mult.get(x.name) ?? 1) * 2);
    }
    for (const x of td.damage_relations.half_damage_from) {
      mult.set(x.name, (mult.get(x.name) ?? 1) * 0.5);
    }
    for (const x of td.damage_relations.no_damage_from) {
      // immunity overrides to 0 no matter what
      mult.set(x.name, 0);
    }
  }

  return mult;
}

export function splitMultipliers(mult: Map<string, number>) {
  const entries = Array.from(mult.entries());

  const weak = entries
    .filter(([, m]) => m > 1)
    .sort((a, b) => b[1] - a[1]);

  const resist = entries
    .filter(([, m]) => m < 1 && m > 0)
    .sort((a, b) => a[1] - b[1]);

  const immune = entries.filter(([, m]) => m === 0).sort((a, b) => a[0].localeCompare(b[0]));

  return { weak, resist, immune };
}