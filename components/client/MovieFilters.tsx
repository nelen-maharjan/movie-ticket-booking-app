"use client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance", "Animation", "Documentary"];
const STATUSES = [
  { value: "NOW_SHOWING", label: "Now Showing" },
  { value: "COMING_SOON", label: "Coming Soon" },
];

export function MovieFilters({ currentFilters }: { currentFilters: Record<string, string | undefined> }) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search || "");

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams();
    if (currentFilters.status && key !== "status") params.set("status", currentFilters.status);
    if (currentFilters.genre && key !== "genre") params.set("genre", currentFilters.genre);
    if (currentFilters.search && key !== "search") params.set("search", currentFilters.search);
    if (value) params.set(key, value);
    router.push(`/?${params.toString()}`);
  }, [currentFilters, router]);

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && updateFilter("search", search || null)}
            className="pl-9"
          />
        </div>
        {/* Status filters */}
        <div className="flex gap-2">
          {STATUSES.map(s => (
            <Button
              key={s.value}
              variant={currentFilters.status === s.value || (!currentFilters.status && s.value === "NOW_SHOWING") ? "gold" : "outline"}
              size="sm"
              onClick={() => updateFilter("status", s.value)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Genre filters */}
      <div className="flex gap-2 flex-wrap">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => updateFilter("genre", currentFilters.genre === g ? null : g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentFilters.genre === g
                ? "bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/40"
                : "bg-secondary/50 text-muted-foreground border border-border hover:border-cinema-gold/30 hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
        {(currentFilters.genre || currentFilters.search) && (
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1 text-cinema-red border border-cinema-red/30 hover:bg-cinema-red/10"
          >
            <X className="w-3 h-3" />Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
