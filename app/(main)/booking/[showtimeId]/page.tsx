import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getShowtimeWithSeats } from "@/app/actions/showtimes";
import { SeatSelector } from "@/components/booking/seat-selector";
import { ShowtimeInfo } from "@/components/booking/showtime-info";

export default async function BookingPage({ params }: { params: { showtimeId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?callbackUrl=/booking/${params.showtimeId}`);

  const data = await getShowtimeWithSeats(params.showtimeId);
  if (!data) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ShowtimeInfo showtime={data} />
      <SeatSelector showtime={data} userId={session.user.id!} />
    </div>
  );
}
