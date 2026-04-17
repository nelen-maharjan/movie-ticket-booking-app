"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Ticket, Star, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { getYouTubeId } from "@/lib/utils/youtube";

type Movie = {
  id: string | number;
  title: string;
  description: string;
  backdropUrl?: string | null;
  posterUrl: string;
  genre?: string[];
  rating: number;
  duration: number;
  language: string;
  trailerUrl?: string | null;
};

type HeroSectionProps = {
  movies: Movie[];
};

export function HeroSection({ movies }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const movie = movies[current];

  useEffect(() => {
    if (movies.length < 2) return;
    if (trailerMovie) return;

    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % movies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [movies.length, trailerMovie]);

  const closeTrailer = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setTrailerMovie(null);
      setIsClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTrailer();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTrailer]);

  if (!movie) return null;

  const trailerId = trailerMovie?.trailerUrl
    ? getYouTubeId(trailerMovie.trailerUrl)
    : null;

  return (
    <div className="relative h-[70vh] min-h-125 overflow-hidden">
      <div className={`absolute inset-0 transition-all duration-300 ${
        trailerMovie ? "blur-md scale-105 brightness-50" : ""
      }`}>
        <Image
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-cinema-dark via-cinema-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-cinema-dark via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-xl animate-fade-up">

            <div className="flex items-center gap-2 mb-4">
              {movie.genre?.slice(0, 3).map((g: string) => (
                <Badge key={g} variant="cinema" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-5xl md:text-7xl tracking-widest mb-3 leading-none">
              {movie.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                <span className="text-foreground font-semibold">
                  {movie.rating.toFixed(1)}
                </span>
                /10
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(movie.duration)}
              </span>

              <span>{movie.language}</span>
            </div>

            <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed max-w-sm">
              {movie.description}
            </p>

            <div className="flex gap-3">
              <Button variant="gold" size="lg" asChild>
                <Link href={`/movies/${movie.id}`}>
                  <Ticket className="w-5 h-5 mr-2" />
                  Book Tickets
                </Link>
              </Button>

              {movie.trailerUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setTrailerMovie(movie)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all ${
                i === current ? "w-8 bg-cinema-gold" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}

      {trailerMovie && trailerId && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-200 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={closeTrailer}
        >
          <div
            className={`relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-200 ${
              isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white text-sm hover:text-cinema-gold"
              onClick={closeTrailer}
            >
              Close ✕
            </button>

            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
              title="Trailer"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}