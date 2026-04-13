import { Prisma } from "../generated/prisma/client";

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    user: { select: { name: true; email: true } };
    showtime: {
      include: {
        movie: { select: { title: true } };
        screen: {
          include: {
            theater: { select: { name: true } };
          };
        };
      };
    };
    bookingSeats: true;
  };
}>;