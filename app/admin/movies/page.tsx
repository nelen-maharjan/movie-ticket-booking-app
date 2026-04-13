import { getMovies } from "@/app/actions/movies";
import { AdminMoviesClient } from "@/components/admin/movies-client";

export default async function AdminMoviesPage() {
  const movies = await getMovies({});
  return <AdminMoviesClient movies={movies} />;
}
