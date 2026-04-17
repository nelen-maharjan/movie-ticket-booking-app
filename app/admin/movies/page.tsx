
import { getMovies } from "@/app/actions/movies";
import { AdminMoviesClient } from "@/components/admin/AdminMoviesClient";

export default async function AdminMoviesPage() {
  const movies = await getMovies({});

return (
 <AdminMoviesClient
  movies={movies.map((m) => ({
    ...m,
    backdropUrl: m.backdropUrl ?? null,
    trailerUrl: m.trailerUrl ?? null,
  }))}
/>
);
}