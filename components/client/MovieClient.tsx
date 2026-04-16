"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Globe, Ticket } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ShowtimesList } from "@/components/client/ShowtimesList";
import type { Movie } from "@/lib/types/movieView";

export default function MovieClient({ movie }: { movie: Movie }) {
  const reviews = movie.reviews ?? [];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : movie.rating;

  return (
    <div className="min-h-screen bg-background">

      {/* BACKDROP */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover scale-105"
        />

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10">

        <div className="grid md:grid-cols-[280px_1fr] gap-10">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl overflow-hidden border shadow-xl">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={280}
                height={420}
                className="w-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >

            <div className="flex flex-wrap gap-2">
              {(movie.genre ?? []).map((g: string) => (
                <motion.div
                  key={g}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge variant="gold">{g}</Badge>
                </motion.div>
              ))}

              <Badge variant={movie.status === "NOW_SHOWING" ? "cinema" : "secondary"}>
                {movie.status === "NOW_SHOWING" ? "Now Showing" : "Coming Soon"}
              </Badge>
            </div>

            <h1 className="font-display text-4xl md:text-6xl">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-cinema-gold fill-cinema-gold" />
                <span className="font-bold text-foreground">
                  {avgRating.toFixed(1)}
                </span>
                /10
              </span>

              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(movie.duration)}
              </span>

              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(movie.releaseDate).getFullYear()}
              </span>

              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {movie.language}
              </span>
            </div>

            <p className="text-muted-foreground max-w-2xl">
              {movie.description}
            </p>

            {movie.status === "NOW_SHOWING" && (
              <div className="text-cinema-gold text-sm flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Choose a showtime below
              </div>
            )}
          </motion.div>
        </div>

        <Separator className="my-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShowtimesList showtimes={movie.showtimes ?? []} />
        </motion.div>

        <Separator className="my-10" />
      </div>
    </div>
  );
}