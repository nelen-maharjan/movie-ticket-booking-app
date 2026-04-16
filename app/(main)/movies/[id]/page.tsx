import { notFound } from "next/navigation";
import Image from "next/image";
import { getMovieById } from "@/app/actions/movies";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Globe } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ShowtimesList } from "@/components/client/ShowtimesList";

export default async function MoviePage({ params }: { params: { id: string } }) {
  const movie = await getMovieById(params.id);
  if (!movie) return notFound();

  const avgRating = movie.reviews.length > 0
    ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length : movie.rating;

  return (
    <div>
      {/* Backdrop Header */}
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
          {/* Poster */}
          <div className="w-48 shrink-0">
            <div className="rounded-xl overflow-hidden border border-border shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <Image src={movie.posterUrl} alt={movie.title} width={192} height={288} className="w-full" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-32 md:pt-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genre.map(g => <Badge key={g} variant="gold">{g}</Badge>)}
              <Badge variant={movie.status === "NOW_SHOWING" ? "cinema" : "secondary"}>
                {movie.status === "NOW_SHOWING" ? "Now Showing" : "Coming Soon"}
              </Badge>
            </div>
            <h1 className="font-display text-5xl tracking-widest mb-4">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                <span className="text-foreground font-bold text-lg">{avgRating.toFixed(1)}</span>
                <span>/10 ({movie.reviews.length} reviews)</span>
              </span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(movie.duration)}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(movie.releaseDate).getFullYear()}</span>
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{movie.language}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{movie.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="text-muted-foreground">Director</span>
                <p className="font-medium mt-0.5">{movie.director}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cast</span>
                <p className="font-medium mt-0.5">{movie.cast.slice(0, 3).join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Showtimes */}
        <ShowtimesList showtimes={movie.showtimes}  />

        <Separator className="my-8" />

        {/* Reviews */}
        {movie.reviews.length > 0 && (
          <div className="pb-12">
            <h2 className="font-display text-3xl tracking-wider mb-6">AUDIENCE REVIEWS</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {movie.reviews.slice(0, 6).map(review => (
                <div key={review.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.user.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                      <span className="font-bold">{review.rating}</span>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
