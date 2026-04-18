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

const normalizedData = {
  ...data,
  recommendations: data.recommendations?.map((rec) => ({
    ...rec,
    seats: rec.seats.map((s) => {
      const fullSeat = data.seats.find((fs) => fs.id === s.id);
      if (!fullSeat) throw new Error("Seat mismatch");
      return fullSeat;
    }),
  })),
};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ShowtimeInfo showtime={data} />
      <SeatSelector showtime={normalizedData} userId={session.user.id} />
    </div>
  );
}