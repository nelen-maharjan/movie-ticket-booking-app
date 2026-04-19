"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
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
  const router = useRouter();
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

  const handleNavigate = () => {
    router.push(`/bookings/${booking.id}`);
  };

  return (
    <motion.div
      onClick={handleNavigate}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-2xl border p-5 backdrop-blur-xl 
      bg-white/5 shadow-lg transition-all duration-300 cursor-pointer
      ${
        booking.status === "CANCELLED"
          ? "opacity-60"
          : "hover:shadow-cinema-gold/10 hover:border-cinema-gold/30"
      }`}
    >
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-cinema-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition" />

      <div className="flex gap-5 relative z-10">
        <div className="relative w-17.5 h-25 shrink-0">
          <Image
            src={booking.showtime.movie.posterUrl}
            alt={booking.showtime.movie.title}
            fill
            className="rounded-xl object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-display text-xl tracking-wide truncate group-hover:text-cinema-gold transition">
              {booking.showtime.movie.title}
            </h3>

            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                STATUS_STYLES[booking.status] || STATUS_STYLES.EXPIRED
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cinema-gold" />
              {formatDateTime(booking.showtime.startTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cinema-gold" />
              {booking.showtime.screen.theater.name}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Ticket className="w-4 h-4 text-cinema-gold" />
            {booking.bookingSeats.map((bs) => (
              <motion.div key={bs.id} whileHover={{ scale: 1.1 }}>
                <Badge className="text-xs font-mono bg-white/10">
                  {bs.seat.seatNumber}
                </Badge>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">
                Total Paid
              </span>
              <p className="font-bold text-lg text-cinema-gold">
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono tracking-wider">
                {booking.bookingRef.slice(0, 10).toUpperCase()}
              </span>

              {booking.status === "CONFIRMED" && isUpcoming && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={(e) => e.stopPropagation()}
                      variant="outline"
                      size="sm"
                      className="border-cinema-red/40 text-cinema-red"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border border-white/10"
                  >
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Cancel booking?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. Seats will be released.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        Keep Booking
                      </AlertDialogCancel>

                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Yes, Cancel"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}