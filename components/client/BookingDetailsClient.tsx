"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Ticket, Clock } from "lucide-react";
import QRCode from "react-qr-code";
import { BookingWithRelations } from "@/app/actions/bookings";
import { useEffect, useState } from "react";

export default function BookingDetailsClient({
  booking,
}: {
  booking: BookingWithRelations;
}) {
  const seats = booking.bookingSeats.map((bs) => bs.seat.seatNumber);

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff =
        new Date(booking.showtime.startTime).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Started");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${h}h ${m}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.showtime.startTime]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      <div className="absolute inset-0 bg-linear-to-br from-cinema-gold/10 via-transparent to-transparent blur-3xl opacity-30" />

      <div className="max-w-5xl mx-auto px-4 py-10 relative z-10 space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-white/10"
        >
          <Image
            src={booking.showtime.movie.posterUrl}
            alt=""
            fill
            className="object-cover blur-2xl scale-110 opacity-30"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

          <div className="relative flex gap-6 p-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Image
                src={booking.showtime.movie.posterUrl}
                alt={booking.showtime.movie.title}
                width={130}
                height={190}
                className="rounded-2xl shadow-xl"
              />
            </motion.div>

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold leading-tight">
                  {booking.showtime.movie.title}
                </h1>

                <p className="text-muted-foreground mt-2">
                  {booking.showtime.screen.theater.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cinema-gold" />
                  {formatDateTime(booking.showtime.startTime)}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cinema-gold" />
                  Screen {booking.showtime.screen.name}
                </span>

                <span className="flex items-center gap-2 text-cinema-gold font-medium">
                  <Clock className="w-4 h-4" />
                  Starts in {timeLeft}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 relative rounded-3xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
          >
            
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full -ml-4" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full -mr-4" />

            <div className="absolute top-1/2 left-6 right-6 border-t border-dashed border-white/10" />

            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Ticket className="text-cinema-gold" />
              Ticket
            </h2>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Seats
              </p>

              <div className="flex flex-wrap gap-2">
                {seats.map((seat) => (
                  <motion.span
                    key={seat}
                    whileHover={{ scale: 1.1 }}
                    className="px-3 py-1 rounded-full bg-cinema-gold/20 text-cinema-gold font-mono text-sm"
                  >
                    {seat}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Booking Reference
              </p>
              <p className="text-lg font-mono tracking-widest mt-1">
                {booking.bookingRef.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-cinema-gold mt-1">
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="absolute inset-0 border border-cinema-gold/20 rounded-3xl animate-pulse" />

            <p className="text-sm text-muted-foreground mb-4">
              Scan at entry
            </p>

            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCode value={booking.bookingRef} size={150} />
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Present this code at the theater
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}