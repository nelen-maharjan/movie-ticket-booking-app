import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";
import { db } from "@/lib/db";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      showtime: {
        include: {
          movie: { select: { title: true } },
          screen: {
            include: {
              theater: { select: { name: true } },
            },
          },
        },
      },
      bookingSeats: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-display tracking-widest">
          BOOKINGS
        </h1>
        <p className="text-muted-foreground text-sm">
          {bookings.length} total bookings
        </p>
      </div>

      <AdminBookingsTable data={bookings} />
    </div>
  );
}