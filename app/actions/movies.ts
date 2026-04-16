"use server";

import { calculatePopularityScore } from "@/lib/algorithms/popularity";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  MovieSchema,
  MovieUpdateSchema,
  type MovieInput,
  type MovieUpdateInput,
} from "@/lib/zodSchema";

import type { MovieStatus } from "@/lib/types/movie";
import type { Movie } from "@/lib/types/movieView";

function transformMovieInput(data: MovieInput) {
  return {
    ...data,
    releaseDate: new Date(data.releaseDate),
    backdropUrl: data.backdropUrl || null,
    trailerUrl: data.trailerUrl || null,
  };
}

export async function getMovies(filters?: {
  status?: MovieStatus;
  genre?: string;
  search?: string;
  limit?: number;
}): Promise<Movie[]> {
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

    include: {
      showtimes: {
        include: {
          screen: {
            include: {
              theater: true,
            },
          },
        },
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
      },
    },

    orderBy: [
      { popularityScore: "desc" },
      { createdAt: "desc" },
    ],
    take: filters?.limit,
  });

  return movies.map((movie) => ({
  ...movie,
  status: movie.status as MovieStatus,
  backdropUrl: movie.backdropUrl ?? null, 
}));
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const movie = await db.movie.findUnique({
    where: { id },

    include: {
      showtimes: {
        where: {
          startTime: { gte: new Date() },
          status: "SCHEDULED",
        },
        orderBy: { startTime: "asc" },
        include: {
          screen: {
            include: {
              theater: true,
            },
          },
        },
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

  if (!movie) return null;

  return {
    ...movie,

    status: movie.status as MovieStatus,

    showtimes: movie.showtimes.map((st) => ({
      ...st,
      screen: {
        ...st.screen,
        theater: st.screen.theater,
      },
    })),

    reviews: movie.reviews,
  };
}

export async function createMovie(data: MovieInput) {
  const parsed = MovieSchema.parse(data);

  const movie = await db.movie.create({
    data: transformMovieInput(parsed),
  });

  revalidatePath("/admin/movies");
  revalidatePath("/");

  return movie;
}

export async function updateMovie(id: string, data: MovieUpdateInput) {
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

export async function deleteMovie(id: string) {
  await db.movie.delete({
    where: { id },
  });

  revalidatePath("/admin/movies");
  revalidatePath("/");

  return { success: true };
}

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

    const allBookings = movie.showtimes.flatMap((st) => st.bookings);

    const totalBookings = allBookings.length;

    const recentBookings = allBookings.filter(
      (b) => b.createdAt >= sevenDaysAgo
    ).length;

    const avgRating =
      movie.reviews.length > 0
        ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) /
          movie.reviews.length
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