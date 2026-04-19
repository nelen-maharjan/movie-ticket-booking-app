import { notFound } from "next/navigation";
import Image from "next/image";
import { getBookingById } from "@/app/actions/bookings";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Ticket } from "lucide-react";
import QRCode from "react-qr-code";

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const booking = await getBookingById(bookingId);
  if (!booking) return notFound();

  const seats = booking.bookingSeats.map((bs) => bs.seat.seatNumber);

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-zinc-900 to-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="relative rounded-3xl overflow-hidden border border-white/10">
          <div className="absolute inset-0">
            <Image
              src={booking.showtime.movie.posterUrl}
              alt={booking.showtime.movie.title}
              fill
              className="object-cover blur-xl scale-110 opacity-30"
            />
          </div>

          <div className="relative flex gap-6 p-6 backdrop-blur-xl">
            <Image
              src={booking.showtime.movie.posterUrl}
              alt={booking.showtime.movie.title}
              width={120}
              height={180}
              className="rounded-xl object-cover"
            />

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-wide">
                  {booking.showtime.movie.title}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {booking.showtime.screen.theater.name}
                </p>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground mt-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-cinema-gold" />
                  {formatDateTime(booking.showtime.startTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cinema-gold" />
                  Screen {booking.showtime.screen.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
            
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full -ml-3" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full -mr-3" />

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-cinema-gold" />
              Booking Details
            </h2>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Seats</p>
              <div className="flex flex-wrap gap-2">
                {seats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1 rounded-full bg-cinema-gold/20 text-cinema-gold text-sm font-mono"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Booking Ref</p>
              <p className="font-mono tracking-wider text-lg">
                {booking.bookingRef.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-cinema-gold">
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Scan at entry
            </p>

            <div className="bg-white p-3 rounded-xl">
              <QRCode value={booking.bookingRef} size={140} />
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Present this code at the theater
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Please arrive at least 15 minutes before showtime.
        </div>
      </div>
    </div>
  );
}