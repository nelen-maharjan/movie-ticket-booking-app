import { notFound } from "next/navigation";
import { getBookingById } from "@/app/actions/bookings";
import BookingDetailsClient from "@/components/client/BookingDetailsClient";

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const booking = await getBookingById(bookingId);
  if (!booking) return notFound();

  return <BookingDetailsClient booking={booking} />;
}