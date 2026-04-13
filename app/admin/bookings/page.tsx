import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      showtime: { include: { movie: { select: { title: true } }, screen: { include: { theater: { select: { name: true } } } } } },
      bookingSeats: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const STATUS_STYLES: Record<string, string> = {
    CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-4xl tracking-widest">BOOKINGS</h1>
        <p className="text-muted-foreground text-sm">{bookings.length} recent bookings</p>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Booking Ref</th>
              <th className="p-4 hidden md:table-cell">User</th>
              <th className="p-4">Movie</th>
              <th className="p-4 hidden lg:table-cell">Show Time</th>
              <th className="p-4 hidden lg:table-cell">Seats</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-mono text-xs text-cinema-gold">{b.bookingRef.slice(0,12).toUpperCase()}</td>
                <td className="p-4 hidden md:table-cell">
                  <p className="text-sm font-medium">{b.user.name}</p>
                  <p className="text-xs text-muted-foreground">{b.user.email}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">{b.showtime.movie.title}</p>
                  <p className="text-xs text-muted-foreground">{b.showtime.screen.theater.name}</p>
                </td>
                <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(b.showtime.startTime)}</td>
                <td className="p-4 hidden lg:table-cell">
                  <span className="text-sm">{b.bookingSeats.length} seat{b.bookingSeats.length > 1 ? "s" : ""}</span>
                </td>
                <td className="p-4 text-cinema-gold font-semibold text-sm">{formatCurrency(b.totalAmount)}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[b.status] || ""}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
