export type SeatType = "REGULAR" | "PREMIUM" | "VIP" | "RECLINER";

export type Seat = {
  id: string;
  row: string;
  col: number;
  seatNumber: string;
  type: SeatType;
  isAvailable: boolean;
  isBooked: boolean;
  isLocked: boolean;
};

export type Recommendation = {
  seats: Seat[];
  reason: string;
};

export type Showtime = {
  id: string;
  seats: Seat[];
  recommendations?: Recommendation[];
};

export type Booking = {
  bookingRef: string;
  totalAmount: number;
  bookingSeats: { seatId: string }[];
};