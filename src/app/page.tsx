"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";
import { SearchSortBar, SortKey } from "@/components/pokemon/SearchSortBar";
import {
  fetchAllPokemonNames,
  fetchDetailsForPage,
  fetchPokemonDetailById,
  fetchPokemonPage,
} from "@/lib/pokeapi";
import { PokemonDetail, PokemonListItem } from "@/lib/types";
import { getFavorites } from "@/lib/favorites";

const PAGE_SIZE = 20;

function parseTypes(raw: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

export default function HomePage() {
  const router = useRouter();
  const sp = useSearchParams();

  // URL-backed filter state
  const [search, setSearch] = useState(sp.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>(
    (sp.get("sort") as SortKey) ?? "id"
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    parseTypes(sp.get("types"))
  );
  const [favoritesOnly, setFavoritesOnly] = useState(sp.get("fav") === "1");

  // Loaded Pokemon details (paginated)
  const [all, setAll] = useState<PokemonDetail[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Full name directory (lightweight list loaded once for async search)
  const [allNames, setAllNames] = useState<PokemonListItem[]>([]);

  // Async search results
  const [searchResults, setSearchResults] = useState<PokemonDetail[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // Refs for stable callbacks / intersection observer
  const detailCache = useRef<Map<number, PokemonDetail>>(new Map());
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ------------------------------------------------------------------ */
  /*  Sync state -> URL (shareable)                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (sort !== "id") params.set("sort", sort);
    if (selectedTypes.length) params.set("types", selectedTypes.join(","));
    if (favoritesOnly) params.set("fav", "1");

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [search, sort, selectedTypes, favoritesOnly, router]);

  /* ------------------------------------------------------------------ */
  /*  Load a page of Pokemon details                                    */
  /* ------------------------------------------------------------------ */
  const loadPage = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadMoreError(null);

    try {
      const page = await fetchPokemonPage(PAGE_SIZE, offsetRef.current);
      setTotalCount(page.count);

      const names = page.results.map((r) => r.name);
      const details = await fetchDetailsForPage(names, 6);

      setAll((prev) => {
        const merged = [...prev];
        for (const p of details) {
          detailCache.current.set(p.id, p);
          if (!merged.some((x) => x.id === p.id)) merged.push(p);
        }
        return merged;
      });
      offsetRef.current += PAGE_SIZE;
    } catch (e: unknown) {
      setLoadMoreError(
        e instanceof Error ? e.message : "Failed to load Pokemon."
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Initialise: full name directory + first page                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    async function init() {
      const namesPromise = fetchAllPokemonNames()
        .then((res) => {
          setAllNames(res.results);
          setTotalCount(res.count);
        })
        .catch(() => {
          /* name directory optional - paginated loading still works */
        });

      await Promise.all([namesPromise, loadPage()]);
    }
    init();
  }, [loadPage]);

  /* ------------------------------------------------------------------ */
  /*  Async search - fetches Pokemon not yet in cache on-demand         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const q = search.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const isNum = /^\d+$/.test(q);

        if (isNum) {
          const id = Number(q);
          if (detailCache.current.has(id)) {
            setSearchResults([detailCache.current.get(id)!]);
          } else {
            try {
              const detail = await fetchPokemonDetailById(id);
              detailCache.current.set(detail.id, detail);
              setSearchResults([detail]);
            } catch {
              setSearchResults([]);
            }
          }
        } else {
          // Filter the lightweight name directory, then fetch missing details
          const matches = allNames
            .filter((item) => item.name.includes(q))
            .slice(0, 20);

          const cachedNames = new Set(
            [...detailCache.current.values()].map((c) => c.name)
          );
          const needsFetch = matches.filter((m) => !cachedNames.has(m.name));

          if (needsFetch.length > 0) {
            const details = await fetchDetailsForPage(
              needsFetch.map((m) => m.name),
              6
            );
            for (const p of details) {
              detailCache.current.set(p.id, p);
            }
          }

          const allCached = [...detailCache.current.values()];
          const results = matches
            .map((m) => allCached.find((c) => c.name === m.name))
            .filter((p): p is PokemonDetail => p !== undefined);

          setSearchResults(results);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search, allNames]);

  /* ------------------------------------------------------------------ */
  /*  Infinite scroll via IntersectionObserver                          */
  /* ------------------------------------------------------------------ */
  const canLoadMore = totalCount !== null && all.length < totalCount;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadPage();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadPage, totalCount, all.length]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                           */
  /* ------------------------------------------------------------------ */
  function toggleType(t: string) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function clearTypes() {
    setSelectedTypes([]);
  }

  /* ------------------------------------------------------------------ */
  /*  Filter + sort the display list                                    */
  /* ------------------------------------------------------------------ */
  const isSearching = search.trim().length > 0;
  const baseItems = isSearching ? searchResults : all;

  const filteredSorted = useMemo(() => {
    const favs = favoritesOnly ? new Set(getFavorites()) : null;
    let out = baseItems;

    if (favs) out = out.filter((p) => favs.has(p.id));

    if (selectedTypes.length) {
      out = out.filter((p) => {
        const types = p.types.map((t) => t.type.name);
        return selectedTypes.some((t) => types.includes(t));
      });
    }

    out = out.slice().sort((a, b) => {
      if (sort === "id") return a.id - b.id;
      return a.name.localeCompare(b.name);
    });

    return out;
  }, [baseItems, sort, selectedTypes, favoritesOnly]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Pokedex</h1>
        <p className="text-muted-foreground">
          Shareable filters, favorites, and type matchups.
        </p>
      </header>

      <SearchSortBar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        selectedTypes={selectedTypes}
        toggleType={toggleType}
        clearTypes={clearTypes}
        favoritesOnly={favoritesOnly}
        setFavoritesOnly={setFavoritesOnly}
      />

      {loadMoreError && (
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium">Could not load data</div>
          <div className="text-muted-foreground">{loadMoreError}</div>
          <div className="mt-2">
            <Button variant="secondary" onClick={() => loadPage()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {isSearching && searchLoading && filteredSorted.length === 0 ? (
        <PokemonGrid items={[]} loading={true} loadingMore={false} />
      ) : filteredSorted.length === 0 && !loading && !searchLoading ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No Pokemon match your filters yet. Try a different search or clear
          filters.
        </div>
      ) : (
        <PokemonGrid
          items={filteredSorted}
          loading={initialLoading}
          loadingMore={loading && all.length > 0 && !isSearching}
        />
      )}

      {/* Infinite-scroll sentinel */}
      {canLoadMore && !isSearching && (
        <div ref={sentinelRef} className="h-1" />
      )}

      {/* Fallback manual button */}
      {!isSearching && (
        <div className="flex justify-center py-4">
          <Button
            onClick={() => loadPage()}
            disabled={!canLoadMore || loading}
          >
            {loading
              ? "Loading..."
              : canLoadMore
                ? "Load More"
                : `All ${totalCount ?? 0} Pokemon loaded`}
          </Button>
        </div>
      )}
    </main>
  );
}
