import { notFound } from "next/navigation";
import Image from "next/image";
import { getMovieById } from "@/app/actions/movies";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Globe } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ShowtimesList } from "@/components/client/ShowtimesList";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params; 

  const movie = await getMovieById(id);
  if (!movie) return notFound();

  const avgRating =
    movie.reviews.length > 0
      ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) /
        movie.reviews.length
      : movie.rating;

  return (
    <div>
      <div className="relative h-80 overflow-hidden">
        <Image
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cinema-dark/50 to-cinema-dark" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 shrink-0">
            <div className="rounded-xl overflow-hidden border border-border shadow">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={192}
                height={288}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex-1 pt-32 md:pt-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genre.map((g) => (
                <Badge key={g} variant="gold">
                  {g}
                </Badge>
              ))}

              <Badge
                variant={movie.status === "NOW_SHOWING" ? "cinema" : "secondary"}
              >
                {movie.status === "NOW_SHOWING"
                  ? "Now Showing"
                  : "Coming Soon"}
              </Badge>
            </div>

            <h1 className="font-display text-5xl tracking-widest mb-4">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                <span className="text-foreground font-bold text-lg">
                  {avgRating.toFixed(1)}
                </span>
                <span>/10 ({movie.reviews.length} reviews)</span>
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(movie.duration)}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(movie.releaseDate).getFullYear()}
              </span>

              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {movie.language}
              </span>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              {movie.description}
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <ShowtimesList showtimes={movie.showtimes} />

        <Separator className="my-8" />
      </div>
    </div>
  );
}