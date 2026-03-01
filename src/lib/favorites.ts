const KEY = "pokedex:favorites";

export function getFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => Number.isFinite(x)) : [];
  } catch {
    return [];
  }
}

export function setFavorites(ids: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids)).sort((a,b)=>a-b)));
}

export function toggleFavorite(id: number) {
  const favs = getFavorites();
  if (favs.includes(id)) {
    setFavorites(favs.filter((x) => x !== id));
  } else {
    setFavorites([...favs, id]);
  }
}