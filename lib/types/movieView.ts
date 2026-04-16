export type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED";

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  user: {
    name: string;
    avatar?: string | null;
  };
};

export type Screen = {
  id: string;
  name: string;
  screenType: string;
  totalRows: number;
  totalCols: number;
  theater: Theater;
};

export type Theater = {
  id: string;
  name: string;
  location: string;
  city: string;
  address: string;
  phone: string | null;
};

export type Showtime = {
  id: string;
  startTime: string | Date;
  basePrice: number;
  availableSeats: number;
  totalSeats: number;
  screen: Screen;
};

export type Movie = {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  rating: number;
  language: string;
  releaseDate: string | Date;
  posterUrl: string;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  status: MovieStatus; 
  director: string;
  cast: string[];
  popularityScore: number;
  showtimes: Showtime[];
  reviews: Review[];
};