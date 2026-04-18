import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getShowtimeWithSeats } from "@/app/actions/showtimes";
import { ShowtimeInfo } from "@/components/client/ShowtimeInfo";
import { SeatSelector } from "@/components/client/SeatSelector";
export default async function BookingPage({ params }: { params: { showtimeId: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/booking/${params.showtimeId}`);
  }

  const data = await getShowtimeWithSeats(params.showtimeId);
  if (!data) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ShowtimeInfo showtime={data} />
      <SeatSelector showtime={data} userId={session.user.id!} />
    </div>
  );
}