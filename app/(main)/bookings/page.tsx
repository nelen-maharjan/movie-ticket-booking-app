import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/app/actions/bookings";
import { Ticket } from "lucide-react";
import { BookingCard } from "@/components/client/BookingCard";

export default async function BookingsPage() {
  const session = await auth(); 

  if (!session?.user) redirect("/login");

  const bookings = await getUserBookings(session.user.id!);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl tracking-widest mb-8">MY TICKETS</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-24">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground text-lg">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}