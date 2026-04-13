"use server";

import { calculatePopularityScore } from "@/lib/algorithms/popularity";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";


const MovieStatusEnum = z.enum([
  "NOW_SHOWING",
  "COMING_SOON",
  "ENDED",
]);

export const MovieSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  genre: z.array(z.string()).min(1),

  duration: z.number().min(1),
  language: z.string(),
  releaseDate: z.string(),

  posterUrl: z.string().url(),
  backdropUrl: z.string().url().optional().or(z.literal("")),
  trailerUrl: z.string().optional().or(z.literal("")),

  cast: z.array(z.string()),
  director: z.string(),

  status: MovieStatusEnum,
  rating: z.number().min(0).max(10),
});

const MovieUpdateSchema = MovieSchema.partial();

/* =========================
   HELPERS
========================= */

function transformMovieInput(data: z.infer<typeof MovieSchema>) {
  return {
    ...data,
    releaseDate: new Date(data.releaseDate),
    backdropUrl: data.backdropUrl || null,
    trailerUrl: data.trailerUrl || null,
  };
}

/* =========================
   GET ALL MOVIES
========================= */

export async function getMovies(filters?: {
  status?: string;
  genre?: string;
  search?: string;
  limit?: number;
}) {
  const movies = await db.movie.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.genre && { genre: { has: filters.genre } }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { director: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ popularityScore: "desc" }, { createdAt: "desc" }],
    take: filters?.limit,
  });

  return movies as unknown as import("@/lib/types/movie").Movie[];
}
export async function getMovieById(id: string) {
  return db.movie.findUnique({
    where: { id },
    include: {
      showtimes: {
        where: {
          startTime: { gte: new Date() },
          status: "SCHEDULED",
        },
        include: {
          screen: {
            include: { theater: true },
          },
        },
        orderBy: { startTime: "asc" },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/* =========================
   CREATE MOVIE
========================= */

export async function createMovie(data: z.infer<typeof MovieSchema>) {
  const parsed = MovieSchema.parse(data);

  const movie = await db.movie.create({
    data: transformMovieInput(parsed),
  });

  revalidatePath("/admin/movies");
  revalidatePath("/");

  return movie;
}

/* =========================
   UPDATE MOVIE
========================= */

export async function updateMovie(
  id: string,
  data: z.infer<typeof MovieUpdateSchema>
) {
  const parsed = MovieUpdateSchema.parse(data);

  const movie = await db.movie.update({
    where: { id },
    data: {
      ...parsed,

      ...(parsed.releaseDate && {
        releaseDate: new Date(parsed.releaseDate),
      }),

      ...(parsed.backdropUrl !== undefined && {
        backdropUrl: parsed.backdropUrl || null,
      }),

      ...(parsed.trailerUrl !== undefined && {
        trailerUrl: parsed.trailerUrl || null,
      }),
    },
  });

  revalidatePath("/admin/movies");
  revalidatePath(`/movies/${id}`);

  return movie;
}

/* =========================
   DELETE MOVIE
========================= */

export async function deleteMovie(id: string) {
  await db.movie.delete({
    where: { id },
  });

  revalidatePath("/admin/movies");
  revalidatePath("/");

  return { success: true };
}

/* =========================
   POPULARITY SCORE REFRESH
========================= */

export async function refreshPopularityScores() {
  const movies = await db.movie.findMany({
    include: {
      reviews: { select: { rating: true } },
      showtimes: {
        include: {
          bookings: true,
        },
      },
    },
  });

  for (const movie of movies) {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    // Flatten all bookings through showtimes
    const allBookings = movie.showtimes.flatMap(
      (st) => st.bookings
    );

    const totalBookings = allBookings.length;

    const recentBookings = allBookings.filter(
      (b) => b.createdAt >= sevenDaysAgo
    ).length;

    const avgRating =
      movie.reviews.length > 0
        ? movie.reviews.reduce(
            (sum: number, r: { rating: number }) =>
              sum + r.rating,
            0
          ) / movie.reviews.length
        : 0;

    const score = calculatePopularityScore({
      totalBookings,
      recentBookings,
      avgRating,
      reviewCount: movie.reviews.length,
      releaseDate: movie.releaseDate,
    });

    await db.movie.update({
      where: { id: movie.id },
      data: {
        popularityScore: score,
        totalBookings,
      },
    });
  }
}