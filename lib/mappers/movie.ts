import type { Movie as ViewMovie } from "@/lib/types/movieView";
import type { Movie as UIMovie, MovieStatus } from "@/lib/types/movie";

export function mapToUIMovie(movie: ViewMovie): UIMovie {
  return {
    ...movie,
    status: movie.status as MovieStatus,
    backdropUrl: movie.backdropUrl ?? null,
    trailerUrl: movie.trailerUrl ?? null, // ✅ add this
  };
}