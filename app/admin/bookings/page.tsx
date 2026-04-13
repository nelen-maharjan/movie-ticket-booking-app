import { db } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    take: 100,
  });

  const STATUS_VARIANTS: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    CONFIRMED: "default",
    PENDING: "secondary",
    CANCELLED: "destructive",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl tracking-widest">
          BOOKINGS
        </h1>
        <p className="text-muted-foreground text-sm">
          {bookings.length} recent bookings
        </p>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border bg-background/50 backdrop-blur supports-backdrop-filter:bg-background/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Ref</TableHead>
              <TableHead className="hidden md:table-cell">
                User
              </TableHead>
              <TableHead>Movie</TableHead>
              <TableHead className="hidden lg:table-cell">
                Show Time
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Seats
              </TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.map((b) => (
              <TableRow
                key={b.id}
                className="hover:bg-muted/40 transition-colors"
              >
                {/* Booking Ref */}
                <TableCell className="font-mono text-xs text-cinema-gold">
                  {b.bookingRef.slice(0, 12).toUpperCase()}
                </TableCell>

                {/* User */}
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {b.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {b.user.email}
                    </span>
                  </div>
                </TableCell>

                {/* Movie */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {b.showtime.movie.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {b.showtime.screen.theater.name}
                    </span>
                  </div>
                </TableCell>

                {/* Showtime */}
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDateTime(b.showtime.startTime)}
                </TableCell>

                {/* Seats */}
                <TableCell className="hidden lg:table-cell text-sm">
                  {b.bookingSeats.length} seat
                  {b.bookingSeats.length > 1 ? "s" : ""}
                </TableCell>

                {/* Amount */}
                <TableCell className="font-semibold text-cinema-gold">
                  {formatCurrency(b.totalAmount)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[b.status] || "outline"}>
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}

            {/* Empty state */}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-10"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}