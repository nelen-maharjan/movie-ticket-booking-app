import { notFound } from "next/navigation";
import { getMovieById } from "@/app/actions/movies";
import MovieClient from "@/components/client/MovieClient";
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;

  const movie = await getMovieById(id);
  if (!movie) return notFound();

  return <MovieClient movie={movie} />;
}