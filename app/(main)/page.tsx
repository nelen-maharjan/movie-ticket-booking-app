import { getMovies } from "@/app/actions/movies";
import { HeroSection } from "@/components/client/HeroSection";
import { MovieFilters } from "@/components/client/MovieFilters";
import { MovieGrid } from "@/components/client/MovieGrid";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { genre?: string; search?: string; status?: string };
}) {
  const movies = await getMovies({
    status: searchParams.status || "NOW_SHOWING",
    genre: searchParams.genre,
    search: searchParams.search,
  });

  const featuredMovies = await getMovies({ status: "NOW_SHOWING", limit: 3 });

  return (
    <div>
      <HeroSection movies={featuredMovies} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <MovieFilters currentFilters={searchParams} />
        <MovieGrid movies={movies} />
      </div>
    </div>
  );
}
