"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";
import { SearchSortBar, SortKey } from "@/components/pokemon/SearchSortBar";
import { fetchDetailsForPage, fetchPokemonPage } from "@/lib/pokeapi";
import { PokemonDetail } from "@/lib/types";

const PAGE_SIZE = 10;

export default function HomePage() {
  const [all, setAll] = useState <PokemonDetail[]>([]);
  const [offset, setOffset ] = useState(0);
  const [count, setCount] = useState(0);
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState <SortKey> ("id");

  const [loading, setLoading] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  const detailCache = useRef <Map <number, PokemonDetail>> (new Map());
  
  async function loadPage (nextOffset: number){
    setLoading(true);
    setLoadMoreError("");

    try {
      const page = await fetchPokemonPage(PAGE_SIZE, nextOffset);
      setCount(page.count);

      const names = page.results.map((r) => r.name);
      const details = await fetchDetailsForPage(names, 6);

      const merged = [...all];
      for (const p of details) {
        detailCache.current.set(p.id, p);
        if (!merged.some((x) => x.id === p.id)) {
          merged.push(p);
        }
      }
      setAll(merged);
    } catch (error) {
      setLoadMoreError("Failed to load more Pokémon.");
    } finally {
      setLoading(false);
    }
  }

  useEffect (() => {
    void loadPage(0);
  },[]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    let out = all;

    if(q.length) {
      const isNum = /^\d+$/.test(q);

      out = out.filter((p) => {
        isNum ? p.id === Number(q) : p.name.toLowerCase().includes(q);
      });
    }
    return out.sort((a, b) => {
      if (sort === "id") {
        return a.id - b.id;
      } else if (sort === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [all, search, sort]);

  const loadMore = count === null ? false : all.length < count;

  return (
    <main className = "mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className = "space-y-1">
        <h1 className = "text-3xl font-bold"> CyberDex </h1>
        <p className = "text-muted-foreground"> Browse, search, and explore Pokemon Details </p>
      </header>
      <SearchSortBar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      {loadMoreError && (
        <div className = "rounded-md border p-3 text-sm">
          <div className = "text-red-500"> Couldn't load Data</div>
          <div className = "text-muted-foreground"> {loadMoreError} </div>
          <div className = "mt-2">
            <Button variant = "secondary" onClick={() => loadPage(offset)}>
              Retry
            </Button>
          </div>
        </div>
      )}
      <PokemonGrid items={filteredSorted} loading = {loading && all.length === 0}/>

      <div className = "flex justify-center py-4">
        <Button
          onClick = {() => loadPage(offset + PAGE_SIZE)}
          disabled = {!loadMore || loading }
        >
          {loading? "Loading ..." : loadMore? "Load More" : "No more Pokemon"}
        </Button>
      </div>
    </main>
  )
}