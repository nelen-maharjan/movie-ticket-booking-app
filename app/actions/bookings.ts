"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  calculateDynamicPrice,
  calculateLockExpiry,
} from "@/lib/algorithms";
import { SeatType } from "@/lib/generated/prisma";

// Lock seats temporarily (10 min)
export async function lockSeats(showtimeId: string, seatIds: string[]) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const showtime = await db.showtime.findUnique({
    where: { id: showtimeId },
    include: { screen: { include: { seats: true } } },
  });

  if (!showtime) throw new Error("Showtime not found");

  // Already booked seats
  const takenSeats = await db.bookingSeat.findMany({
    where: {
      seatId: { in: seatIds },
      booking: {
        showtimeId,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    },
  });

  if (takenSeats.length > 0) {
    throw new Error("Some seats are already booked");
  }

  // Active locks
  const now = new Date();

  const activeLocks = await db.seatLock.findMany({
    where: {
      seatId: { in: seatIds },
      showtimeId,
      expiresAt: { gt: now },
      userId: { not: session.user.id },
    },
  });

  if (activeLocks.length > 0) {
    throw new Error("Some seats are temporarily held by another user");
  }

  const expiresAt = calculateLockExpiry(10);

  await Promise.all(
    seatIds.map((seatId) =>
      db.seatLock.upsert({
        where: {
          seatId_showtimeId: { seatId, showtimeId },
        },
        create: {
          seatId,
          showtimeId,
          userId: session.user.id,
          expiresAt,
        },
        update: {
          userId: session.user.id,
          expiresAt,
        },
      })
    )
  );

  return { success: true, expiresAt };
}

export async function getSeatPrices(
  showtimeId: string,
  seatIds: string[]
) {
  const showtime = await db.showtime.findUnique({
    where: { id: showtimeId },
  });

  if (!showtime) throw new Error("Showtime not found");

  const seats = await db.seat.findMany({
    where: { id: { in: seatIds } },
  });

  return seats.map((seat) => ({
    seatId: seat.id,
    type: seat.type,
    price: calculateDynamicPrice({
      basePrice: showtime.basePrice,
      totalSeats: showtime.totalSeats,
      availableSeats: showtime.availableSeats,
      startTime: showtime.startTime,
      demandScore: showtime.demandScore,
      seatType: seat.type as SeatType,
      premiumMultiplier: showtime.premiumMultiplier,
      vipMultiplier: showtime.vipMultiplier,
      reclineMultiplier: showtime.reclineMultiplier,
    }),
  }));
}

export async function createBooking(
  showtimeId: string,
  seatIds: string[]
) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const now = new Date();

  const locks = await db.seatLock.findMany({
    where: {
      seatId: { in: seatIds },
      showtimeId,
      userId: session.user.id,
      expiresAt: { gt: now },
    },
  });

  if (locks.length !== seatIds.length) {
    throw new Error("Seat locks expired. Please try again.");
  }

  const showtime = await db.showtime.findUnique({
    where: { id: showtimeId },
  });

  if (!showtime) throw new Error("Showtime not found");

  const seats = await db.seat.findMany({
    where: { id: { in: seatIds } },
  });

  const seatPrices: {
    seat: (typeof seats)[number];
    price: number;
  }[] = seats.map((seat) => ({
    seat,
    price: calculateDynamicPrice({
      basePrice: showtime.basePrice,
      totalSeats: showtime.totalSeats,
      availableSeats: showtime.availableSeats,
      startTime: showtime.startTime,
      demandScore: showtime.demandScore,
      seatType: seat.type as SeatType,
      premiumMultiplier: showtime.premiumMultiplier,
      vipMultiplier: showtime.vipMultiplier,
      reclineMultiplier: showtime.reclineMultiplier,
    }),
  }));

  const totalAmount = seatPrices.reduce(
    (sum, item) => sum + item.price,
    0
  );

  const booking = await db.$transaction(async (tx) => {
    const conflict = await tx.bookingSeat.findFirst({
      where: {
        seatId: { in: seatIds },
        booking: {
          showtimeId,
          status: { in: ["CONFIRMED", "PENDING"] },
        },
      },
    });

    if (conflict) {
      throw new Error(
        "Seat conflict detected. Please choose different seats."
      );
    }

    const newBooking = await tx.booking.create({
      data: {
        userId: session.user.id,
        showtimeId,
        totalAmount,
        status: "CONFIRMED",
        bookingSeats: {
          create: seatPrices.map(({ seat, price }) => ({
            seatId: seat.id,
            price,
          })),
        },
      },
      include: {
        bookingSeats: true,
        showtime: {
          include: {
            movie: true,
            screen: { include: { theater: true } },
          },
        },
      },
    });

    await tx.showtime.update({
      where: { id: showtimeId },
      data: {
        availableSeats: { decrement: seatIds.length },
      },
    });

    await tx.movie.update({
      where: { id: showtime.movieId },
      data: {
        totalBookings: { increment: 1 },
      },
    });

    await tx.seatLock.deleteMany({
      where: { seatId: { in: seatIds }, showtimeId },
    });

    return newBooking;
  });

  revalidatePath("/bookings");
  revalidatePath(`/movies/${showtime.movieId}`);

  return booking;
}

// Get user bookings
export async function getUserBookings(userId: string) {
  return db.booking.findMany({
    where: { userId },
    include: {
      bookingSeats: { include: { seat: true } },
      showtime: {
        include: {
          movie: true,
          screen: { include: { theater: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Cancel booking
export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      userId: session.user.id,
    },
    include: {
      bookingSeats: true,
      showtime: true,
    },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.showtime.startTime <= new Date()) {
    throw new Error("Cannot cancel past shows");
  }

  await db.$transaction([
    db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    }),
    db.showtime.update({
      where: { id: booking.showtimeId },
      data: {
        availableSeats: {
          increment: booking.bookingSeats.length,
        },
      },
    }),
  ]);

  revalidatePath("/bookings");
}