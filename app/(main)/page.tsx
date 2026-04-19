import { getMovies } from "@/app/actions/movies";
import { HeroSection } from "@/components/client/HeroSection";
import { MovieFilters } from "@/components/client/MovieFilters";
import { MovieGrid } from "@/components/client/MovieGrid";
import { mapToUIMovie } from "@/lib/mappers/movie";
import { MovieStatus } from "@/lib/types/movie";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    genre?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const moviesRaw = await getMovies({
    status: (params.status as MovieStatus) || "NOW_SHOWING",
    genre: params.genre,
    search: params.search,
  });

  const movies = moviesRaw.map(mapToUIMovie);

  const featuredRaw = await getMovies({
    status: "NOW_SHOWING",
    limit: 3,
  });

  const featuredMovies = featuredRaw.map(mapToUIMovie);

  return (
    <div>
      <HeroSection movies={featuredMovies} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <MovieFilters currentFilters={params} />
        <MovieGrid movies={movies} />
      </div>
    </div>
  );
}
