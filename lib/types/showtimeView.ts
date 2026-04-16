
import type { Screen, Theater } from "./showtimeType";

export type TheaterBasic = Omit<Theater, "screens">;

export type ScreenWithTheater = Omit<Screen, never> & {
  theater: TheaterBasic;
};

export type Showtime = {
  id: string;
  startTime: string | Date;
  basePrice: number;
  availableSeats: number;
  totalSeats: number;
  screen: ScreenWithTheater;
};