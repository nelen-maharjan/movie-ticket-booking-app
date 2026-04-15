"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { estimateDemandScore, recommendSeats } from "@/lib/algorithms";
import { z } from "zod";

export async function getShowtimeWithSeats(showtimeId: string) {
  const showtime = await db.showtime.findUnique({
    where: { id: showtimeId },
    include: {
      movie: true,
      screen: {
        include: {
          theater: true,
          seats: { orderBy: [{ row: "asc" }, { col: "asc" }] },
        },
      },
    },
  });
  if (!showtime) return null;

  // Get booked seat IDs
  const bookedSeatIds = await db.bookingSeat.findMany({
    where: { booking: { showtimeId, status: { in: ["CONFIRMED", "PENDING"] } } },
    select: { seatId: true },
  });
  const bookedSet = new Set(bookedSeatIds.map(b => b.seatId));

  // Get locked seat IDs (not expired)
  const lockedSeatIds = await db.seatLock.findMany({
    where: { showtimeId, expiresAt: { gt: new Date() } },
    select: { seatId: true },
  });
  const lockedSet = new Set(lockedSeatIds.map(l => l.seatId));

  const seatsWithStatus = showtime.screen.seats.map(seat => ({
    ...seat,
    isBooked: bookedSet.has(seat.id),
    isLocked: lockedSet.has(seat.id),
    isAvailable: !bookedSet.has(seat.id) && !lockedSet.has(seat.id) && seat.isActive,
  }));

  // Get seat recommendations
  const availableForRec = seatsWithStatus.filter(s => s.isAvailable).map(s => ({
    id: s.id, row: s.row, col: s.col, type: s.type, isAvailable: true,
  }));

  const recommendations = recommendSeats(
    availableForRec,
    showtime.screen.totalRows,
    showtime.screen.totalCols,
    2,
    "center"
  );

  // Update demand score
  const bookedCount = showtime.screen.seats.length - showtime.availableSeats;
  const hoursUntilShow = (showtime.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const demandScore = estimateDemandScore(bookedCount, showtime.screen.seats.length, hoursUntilShow);
  
  await db.showtime.update({ where: { id: showtimeId }, data: { demandScore } });

  return { ...showtime, seats: seatsWithStatus, recommendations };
}

const ShowtimeSchema = z.object({
  movieId: z.string(),
  screenId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  basePrice: z.number().min(0),
  premiumMultiplier: z.number().min(1),
  vipMultiplier: z.number().min(1),
  reclineMultiplier: z.number().min(1),
});

export async function createShowtime(data: z.infer<typeof ShowtimeSchema>) {
  const parsed = ShowtimeSchema.parse(data);
  const screen = await db.screen.findUnique({
    where: { id: parsed.screenId },
    include: { seats: true },
  });
  if (!screen) throw new Error("Screen not found");

  const showtime = await db.showtime.create({
    data: {
      ...parsed,
      startTime: new Date(parsed.startTime),
      endTime: new Date(parsed.endTime),
      totalSeats: screen.seats.length,
      availableSeats: screen.seats.length,
    },
  });
  revalidatePath("/admin/showtimes");
  return showtime;
}

export async function getTheaters() {
  return db.theater.findMany({ include: { screens: true } });
}

export async function createTheater(data: { name: string; location: string; city: string; address: string; phone?: string }) {
  const theater = await db.theater.create({ data });
  revalidatePath("/admin/theaters");
  return theater;
}

export async function createScreen(data: {
  theaterId: string; name: string; totalRows: number; totalCols: number; screenType: string;
}) {
  const { theaterId, name, totalRows, totalCols, screenType } = data;
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const screen = await db.$transaction(async (tx) => {
    const s = await tx.screen.create({ data: { theaterId, name, totalRows, totalCols, screenType } });
    const seats = [];
    for (let r = 0; r < totalRows; r++) {
      for (let c = 1; c <= totalCols; c++) {
        const row = rowLetters[r];
        let type = "REGULAR";
        if (r < 2) type = "RECLINER"; // front rows = recliner
        else if (r < Math.floor(totalRows * 0.4)) type = "VIP";
        else if (r < Math.floor(totalRows * 0.7)) type = "PREMIUM";
        seats.push({ screenId: s.id, row, col: c, seatNumber: `${row}${c}`, type });
      }
    }
    await tx.seat.createMany({ data: seats });
    return s;
  });

  revalidatePath("/admin/theaters");
  return screen;
}
