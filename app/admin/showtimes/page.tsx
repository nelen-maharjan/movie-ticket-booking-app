import { AdminShowtimesClient } from "@/components/admin/AdminShowtimesClient";
import { db } from "@/lib/db";
import type { Theater } from "@/lib/types/cinema";

export default async function AdminShowtimesPage() {
  const [showtimes, movies, theaters] = await Promise.all([
    db.showtime.findMany({
      include: {
        movie: true,
        screen: {
          include: {
            theater: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 50,
    }),

    db.movie.findMany({
      orderBy: { title: "asc" },
    }),

    db.theater.findMany({
      include: {
        screens: {
          select: {
            id: true,
            name: true,
            screenType: true,
            totalRows: true,
            totalCols: true,
          },
        },
      },
    }),
  ]);

  const typedTheaters: Theater[] = theaters.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    city: t.city,
    address: t.address,
    phone: t.phone,
    screens: t.screens.map((s) => ({
      id: s.id,
      name: s.name,
      screenType: s.screenType,
      totalRows: s.totalRows,
      totalCols: s.totalCols,
    })),
  }));

  return (
    <AdminShowtimesClient
      showtimes={showtimes}
      movies={movies}
      theaters={typedTheaters}
    />
  );
}