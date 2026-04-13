import { PopularityInput } from "../types/popularity";

export function calculatePopularityScore(input: PopularityInput): number {
  const {
    totalBookings,
    recentBookings,
    avgRating,
    reviewCount,
    releaseDate,
  } = input;

  const daysSinceRelease =
    (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);

  const recencyBoost = Math.exp(-daysSinceRelease / 30);

  const velocity = Math.log10(recentBookings + 1) * 0.3;
  const volumeScore = Math.log10(totalBookings + 1) * 0.2;

  const ratingScore =
    (avgRating / 10) * Math.log10(reviewCount + 1) * 0.3;

  const rawScore =
    velocity + volumeScore + ratingScore + recencyBoost * 0.2;

  return Math.min(100, Math.round(rawScore * 50));
}