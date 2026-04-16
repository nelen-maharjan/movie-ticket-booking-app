export type Theater = {
  id: string;
  name: string;
  city: string;
  location: string;
  address: string;
  phone?: string | null;
};

export type Screen = {
  id: string;
  name: string;
  screenType: string;
  totalRows: number;
  totalCols: number;

  theater: Theater;
};

export type Showtime = {
  id: string;
  startTime: string | Date;
  basePrice: number;
  availableSeats: number;
  totalSeats: number;

  screen: Screen;
};