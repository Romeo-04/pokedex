"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue , } from "@/components/ui/select";

export type SortKey = "id" | "name";

export function SearchSortBar ({
    search,
    setSearch,
    sort,
    setSort,
} : {
    search: string;
    setSearch : (s: string) => void;
    sort: SortKey;
    setSort : (s: SortKey) => void;
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
            value = {search}
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
        </div>
    );
}