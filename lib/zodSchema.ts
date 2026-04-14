import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const MovieStatusEnum = z.enum([
  "NOW_SHOWING",
  "COMING_SOON",
  "ENDED",
]);

export const MovieSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  genre: z.array(z.string()).min(1),

  duration: z.number().min(1),
  language: z.string(),
  releaseDate: z.string(),

  posterUrl: z.string().url(),
  backdropUrl: z.string().url().optional().or(z.literal("")),
  trailerUrl: z.string().optional().or(z.literal("")),

  cast: z.array(z.string()),
  director: z.string(),

  status: MovieStatusEnum,
  rating: z.number().min(0).max(10),
});

export const MovieUpdateSchema = MovieSchema.partial();

export type MovieInput = z.infer<typeof MovieSchema>;
export type MovieUpdateInput = z.infer<typeof MovieUpdateSchema>;