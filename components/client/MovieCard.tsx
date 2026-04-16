import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, TrendingUp } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Movie } from "@/lib/types/movie";

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-cinema-gold/30 hover:shadow-[0_0_30px_rgba(245,197,24,0.1)] hover:-translate-y-1">
        {/* Poster */}
        <div className="relative aspect-2/3 overflow-hidden">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-cinema-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={movie.status === "NOW_SHOWING" ? "cinema" : "gold"} className="text-xs">
              {movie.status === "NOW_SHOWING" ? "Now Showing" : "Coming Soon"}
            </Badge>
          </div>

          {/* Rating */}
          <div className="absolute top-2 right-2 glass rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-cinema-gold fill-cinema-gold" />
            <span className="text-xs font-bold">{movie.rating.toFixed(1)}</span>
          </div>

          {/* Popularity */}
          {movie.popularityScore > 60 && (
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="gold" className="text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />Trending
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display text-lg tracking-wider leading-tight mb-1 group-hover:text-cinema-gold transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatDuration(movie.duration)}
            </span>
            <span>{movie.language}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genre?.slice(0, 2).map((g: string) => (
              <span key={g} className="text-xs bg-secondary/60 rounded-full px-2 py-0.5 text-muted-foreground">{g}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
