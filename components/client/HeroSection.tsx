"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Ticket, Star, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export function HeroSection({ movies }: { movies: any[] }) {
  const [current, setCurrent] = useState(0);
  const movie = movies[current];

  useEffect(() => {
    if (movies.length < 2) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % movies.length), 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (!movie) return null;

  return (
    <div className="relative h-[70vh] min-h-125 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Image
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover scale-105"
          style={{ transition: "opacity 0.7s ease" }}
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-cinema-dark via-cinema-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-cinema-dark via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-xl animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              {movie.genre?.slice(0, 3).map((g: string) => (
                <Badge key={g} variant="gold" className="text-xs">{g}</Badge>
              ))}
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-widest mb-3 leading-none">
              {movie.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                <span className="text-foreground font-semibold">{movie.rating.toFixed(1)}</span>/10
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />{formatDuration(movie.duration)}
              </span>
              <span>{movie.language}</span>
            </div>
            <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed max-w-sm">
              {movie.description}
            </p>
            <div className="flex gap-3">
              <Button variant="gold" size="lg" asChild>
                <Link href={`/movies/${movie.id}`}>
                  <Ticket className="w-5 h-5 mr-2" />Book Tickets
                </Link>
              </Button>
              {movie.trailerUrl && (
                <Button variant="outline" size="lg" asChild>
                  <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="w-5 h-5 mr-2" />Trailer
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all ${i === current ? "w-8 bg-cinema-gold" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
