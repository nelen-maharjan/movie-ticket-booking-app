"use client";
import Image from "next/image";
import {  useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingWithRelations, cancelBooking } from "@/app/actions/bookings";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Ticket, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  EXPIRED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function BookingCard({ booking }: { booking: BookingWithRelations }) {
  const [isPending, startTransition] = useTransition();
  const isUpcoming = new Date(booking.showtime.startTime) > new Date();

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelBooking(booking.id);
        toast.success("Booking cancelled");
      } catch (e: unknown) {
            const message =
            e instanceof Error ? e.message : "Something went wrong";

            toast.error("Cannot cancel booking: " + message);
      }
    });
  };

  return (
    <div className={`glass rounded-xl p-5 border transition-all ${
      booking.status === "CANCELLED" ? "opacity-60" : "hover:border-cinema-gold/20"
    }`}>
      <div className="flex gap-4">
        <Image
          src={booking.showtime.movie.posterUrl}
          alt={booking.showtime.movie.title}
          width={64}
          height={96}
          className="rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-xl tracking-wider truncate">{booking.showtime.movie.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_STYLES[booking.status] || STATUS_STYLES.EXPIRED}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
              {formatDateTime(booking.showtime.startTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cinema-gold" />
              {booking.showtime.screen.theater.name}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Ticket className="w-4 h-4 text-cinema-gold" />
            {booking.bookingSeats.map((bs) => (
  <Badge key={bs.id} variant="secondary" className="text-xs font-mono">
    {bs.seat.seatNumber}
  </Badge>
))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-muted-foreground text-xs">Total Paid</span>
              <p className="font-bold text-cinema-gold">{formatCurrency(booking.totalAmount)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{booking.bookingRef.slice(0, 12).toUpperCase()}</span>
              {booking.status === "CONFIRMED" && isUpcoming && (
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}
                  className="text-cinema-red border-cinema-red/30 hover:bg-cinema-red/10">
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3 mr-1" />}
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
