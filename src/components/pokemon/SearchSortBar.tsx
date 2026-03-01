"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortKey = "id" | "name";

const ALL_TYPES = [
  "normal","fire","water","grass","electric","ice","fighting","poison","ground",
  "flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
];

export function SearchSortBar({
  search,
  setSearch,
  sort,
  setSort,
  selectedTypes,
  toggleType,
  clearTypes,
  favoritesOnly,
  setFavoritesOnly,
}: {
  search: string;
  setSearch: (v: string) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;

  selectedTypes: string[];
  toggleType: (t: string) => void;
  clearTypes: () => void;

  favoritesOnly: boolean;
  setFavoritesOnly: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID or name (e.g., 25 or pikachu)"
        />

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">Sort by ID</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={favoritesOnly ? "default" : "secondary"}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className="sm:whitespace-nowrap"
        >
          {favoritesOnly ? "★ Favorites: ON" : "☆ Favorites: OFF"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="text-sm text-muted-foreground mr-1">Filter types:</div>

        {ALL_TYPES.map((t) => {
          const active = (selectedTypes ?? []).includes(t);
          return (
            <Badge
              key={t}
              variant={active ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggleType(t)}
            >
              {t}
            </Badge>
          );
        })}

        {selectedTypes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearTypes}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}