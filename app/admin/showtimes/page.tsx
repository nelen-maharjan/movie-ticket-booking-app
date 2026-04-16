import { AdminShowtimesClient } from "@/components/admin/AdminShowtimesClient";
import { db } from "@/lib/db";


export default async function AdminShowtimesPage() {
  const [showtimes, movies, theaters] = await Promise.all([
    db.showtime.findMany({
      include: { movie: true, screen: { include: { theater: true } } },
      orderBy: { startTime: "desc" },
      take: 50,
    }),
    db.movie.findMany({ orderBy: { title: "asc" } }),
    db.theater.findMany({ include: { screens: true } }),
  ]);
  return <AdminShowtimesClient showtimes={showtimes} movies={movies} theaters={theaters} />;
}
