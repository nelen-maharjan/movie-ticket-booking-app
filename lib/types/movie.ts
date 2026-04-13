export type TopMovie = {
  id: string;
  title: string;
  posterUrl: string;
  totalBookings: number;
  popularityScore: number;
};

export type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED";

export type Movie = {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  releaseDate: string | Date;
  posterUrl: string;

  backdropUrl: string | null;   
  trailerUrl: string | null;    

  cast: string[];
  director: string;
  status: MovieStatus;
  rating: number;
};

export type MovieForm = {
  title: string;
  description: string;
  genre: string[];
  duration: number;
  language: string;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  cast: string[] | string; // important (because of input)
  director: string;
  status: MovieStatus;
  rating: number;
};