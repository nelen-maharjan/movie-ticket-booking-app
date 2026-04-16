import { Film } from "lucide-react";
import type { Movie } from "@/lib/types/movie";
import { MovieCard } from "./MovieCard";

type MovieGridProps = {
  movies: Movie[];
};

export function MovieGrid({ movies }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-24">
        <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
        <p className="text-muted-foreground text-lg">No movies found</p>
        <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        {movies.length} movie{movies.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}