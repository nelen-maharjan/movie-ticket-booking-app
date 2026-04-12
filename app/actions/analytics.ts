"use server";
import { db } from "@/lib/db";
import { calculateRevenueMetrics } from "@/lib/algorithms";

export async function getAdminAnalytics() {
  const [totalMovies, totalBookings, totalUsers, totalRevenue, recentBookings, topMovies] = await Promise.all([
    db.movie.count(),
    db.booking.count({ where: { status: "CONFIRMED" } }),
    db.user.count({ where: { role: "USER" } }),
    db.booking.aggregate({ where: { status: "CONFIRMED" }, _sum: { totalAmount: true } }),
    db.booking.findMany({
      where: { status: "CONFIRMED" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { totalAmount: true, createdAt: true },
    }),
    db.movie.findMany({
      orderBy: { totalBookings: "desc" },
      take: 5,
      select: { id: true, title: true, posterUrl: true, totalBookings: true, popularityScore: true, rating: true },
    }),
  ]);

  const metrics = calculateRevenueMetrics(recentBookings);

  return {
    stats: {
      totalMovies,
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    },
    ...metrics,
    topMovies,
  };
}
