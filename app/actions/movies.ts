"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculatePopularityScore } from "@/lib/algorithms";
import { z } from "zod";

const MovieSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  genre: z.array(z.string()).min(1),
  duration: z.number().min(1),
  language: z.string(),
  releaseDate: z.string(),
  posterUrl: z.string().url(),
  backdropUrl: z.string().url().optional(),
  trailerUrl: z.string().optional(),
  cast: z.array(z.string()),
  director: z.string(),
  status: z.string(),
});

export async function getMovies(filters?: {
  status?: string;
  genre?: string;
  search?: string;
  limit?: number;
}) {
  return db.movie.findMany({
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
        include: { screen: { include: { theater: true } } },
        orderBy: { startTime: "asc" },
      },
      reviews: { include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createMovie(data: z.infer<typeof MovieSchema>) {
  const parsed = MovieSchema.parse(data);
  const movie = await db.movie.create({
    data: {
      ...parsed,
      releaseDate: new Date(parsed.releaseDate),
    },
  });
  revalidatePath("/admin/movies");
  revalidatePath("/");
  return movie;
}

export async function updateMovie(id: string, data: Partial<z.infer<typeof MovieSchema>>) {
  const movie = await db.movie.update({
    where: { id },
    data: {
      ...data,
      ...(data.releaseDate && { releaseDate: new Date(data.releaseDate) }),
    },
  });
  revalidatePath("/admin/movies");
  revalidatePath(`/movies/${id}`);
  return movie;
}

export async function deleteMovie(id: string) {
  await db.movie.delete({ where: { id } });
  revalidatePath("/admin/movies");
  revalidatePath("/");
}

export async function refreshPopularityScores() {
  const movies = await db.movie.findMany({
    include: {
      reviews: { select: { rating: true } },
      _count: { select: { bookings: true } },
    },
  });

  for (const movie of movies) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentBookings = await db.booking.count({
      where: { showtime: { movieId: movie.id }, createdAt: { gte: sevenDaysAgo } },
    });
    const avgRating = movie.reviews.length > 0
      ? movie.reviews.reduce((s, r) => s + r.rating, 0) / movie.reviews.length : 0;

    const score = calculatePopularityScore({
      totalBookings: movie._count.bookings,
      recentBookings,
      avgRating,
      reviewCount: movie.reviews.length,
      releaseDate: movie.releaseDate,
    });

    await db.movie.update({ where: { id: movie.id }, data: { popularityScore: score } });
  }
}
