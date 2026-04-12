/**
 * ADVANCED ALGORITHMS FOR MOVIE TICKET BOOKING
 * 
 * 1. Dynamic Pricing Algorithm - surge pricing based on demand/time
 * 2. Seat Recommendation Algorithm - optimal seat suggestions  
 * 3. Popularity Score Algorithm - movie engagement ranking
 * 4. Collaborative Filtering - personalized recommendations
 */

// ─── 1. DYNAMIC PRICING ALGORITHM ───────────────────────────────────────────
export interface DynamicPricingInput {
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  startTime: Date;
  demandScore: number;
  seatType: "REGULAR" | "PREMIUM" | "VIP" | "RECLINER";
  premiumMultiplier: number;
  vipMultiplier: number;
  reclineMultiplier: number;
}

export function calculateDynamicPrice(input: DynamicPricingInput): number {
  const {
    basePrice, totalSeats, availableSeats, startTime,
    demandScore, seatType, premiumMultiplier, vipMultiplier, reclineMultiplier
  } = input;

  // Occupancy factor: more full = higher price (0.8x to 2.0x)
  const occupancyRate = 1 - availableSeats / totalSeats;
  const occupancyMultiplier = 0.8 + Math.pow(occupancyRate, 1.5) * 1.2;

  // Time factor: shows in next 2 hours get surge pricing (up to 1.4x)
  const hoursUntilShow = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  let timeFactor = 1.0;
  if (hoursUntilShow < 0) timeFactor = 0.7;        // Past show
  else if (hoursUntilShow < 1) timeFactor = 1.35;  // Last minute surge
  else if (hoursUntilShow < 2) timeFactor = 1.2;   // 1-2 hours
  else if (hoursUntilShow < 6) timeFactor = 1.1;   // 2-6 hours
  else if (hoursUntilShow > 72) timeFactor = 0.9;  // Early bird discount

  // Weekend/holiday factor (simplified)
  const day = startTime.getDay();
  const weekendFactor = (day === 0 || day === 6) ? 1.15 : 1.0;

  // Demand score factor (0.0 to 1.0 → 1.0x to 1.3x)
  const demandFactor = 1.0 + demandScore * 0.3;

  // Seat type multiplier
  const seatMultiplier =
    seatType === "PREMIUM" ? premiumMultiplier :
    seatType === "VIP" ? vipMultiplier :
    seatType === "RECLINER" ? reclineMultiplier : 1.0;

  const finalPrice = basePrice * seatMultiplier * occupancyMultiplier * timeFactor * weekendFactor * demandFactor;
  return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
}

// ─── 2. SEAT RECOMMENDATION ALGORITHM ───────────────────────────────────────
export interface SeatInfo {
  id: string;
  row: string;
  col: number;
  type: string;
  isAvailable: boolean;
}

export interface SeatRecommendation {
  seats: SeatInfo[];
  score: number;
  reason: string;
}

export function recommendSeats(
  seats: SeatInfo[],
  totalRows: number,
  totalCols: number,
  count: number = 2,
  preference: "center" | "front" | "back" | "aisle" = "center"
): SeatRecommendation[] {
  const availableSeats = seats.filter(s => s.isAvailable);
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Score each available seat
  const scoredSeats = availableSeats.map(seat => {
    const rowIndex = rowLetters.indexOf(seat.row);
    const normalizedRow = rowIndex / (totalRows - 1); // 0=front, 1=back
    const normalizedCol = (seat.col - 1) / (totalCols - 1); // 0=left, 1=right
    const centerColDist = Math.abs(normalizedCol - 0.5) * 2; // 0=center, 1=edge

    let score = 0;

    if (preference === "center") {
      // Prefer middle rows (0.4-0.6) and center columns
      score = (1 - Math.abs(normalizedRow - 0.5) * 2) * 0.5 +
              (1 - centerColDist) * 0.5;
    } else if (preference === "front") {
      score = (1 - normalizedRow) * 0.7 + (1 - centerColDist) * 0.3;
    } else if (preference === "back") {
      score = normalizedRow * 0.7 + (1 - centerColDist) * 0.3;
    } else if (preference === "aisle") {
      // Prefer seats near aisle (col 1, last col, or near center aisle)
      const aisleScore = Math.min(
        1 / seat.col,
        1 / (totalCols - seat.col + 1),
        1 - Math.abs(normalizedCol - 0.5) * 0.5
      );
      score = aisleScore * 0.6 + (1 - Math.abs(normalizedRow - 0.5) * 2) * 0.4;
    }

    return { seat, score };
  });

  // Find consecutive seat groups
  const recommendations: SeatRecommendation[] = [];
  const rowGroups = new Map<string, typeof scoredSeats>();
  
  for (const item of scoredSeats) {
    const row = item.seat.row;
    if (!rowGroups.has(row)) rowGroups.set(row, []);
    rowGroups.get(row)!.push(item);
  }

  for (const [row, rowSeats] of rowGroups) {
    rowSeats.sort((a, b) => a.seat.col - b.seat.col);
    
    // Find consecutive groups of `count` seats
    for (let i = 0; i <= rowSeats.length - count; i++) {
      let isConsecutive = true;
      for (let j = 1; j < count; j++) {
        if (rowSeats[i + j].seat.col !== rowSeats[i + j - 1].seat.col + 1) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) {
        const group = rowSeats.slice(i, i + count);
        const avgScore = group.reduce((sum, s) => sum + s.score, 0) / count;
        const firstSeat = group[0].seat;
        const lastSeat = group[count - 1].seat;
        
        let reason = "";
        if (preference === "center") reason = `Row ${row}, center section — optimal viewing angle`;
        else if (preference === "front") reason = `Row ${row}, front section — immersive experience`;
        else if (preference === "back") reason = `Row ${row}, back section — full screen view`;
        else reason = `Row ${row}, aisle access — easy entry/exit`;

        recommendations.push({
          seats: group.map(g => g.seat),
          score: avgScore,
          reason,
        });
      }
    }
  }

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ─── 3. POPULARITY SCORE ALGORITHM ──────────────────────────────────────────
export interface PopularityInput {
  totalBookings: number;
  recentBookings: number; // last 7 days
  avgRating: number;      // 0-10
  reviewCount: number;
  releaseDate: Date;
}

export function calculatePopularityScore(input: PopularityInput): number {
  const { totalBookings, recentBookings, avgRating, reviewCount, releaseDate } = input;
  
  // Recency decay: newer movies get a boost
  const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.exp(-daysSinceRelease / 30); // half-life of 30 days
  
  // Booking velocity (recent bookings momentum)
  const velocity = Math.log10(recentBookings + 1) * 0.3;
  
  // Overall booking volume (logarithmic scale)
  const volumeScore = Math.log10(totalBookings + 1) * 0.2;
  
  // Rating score (normalized 0-1, weighted by review count confidence)
  const ratingScore = (avgRating / 10) * Math.log10(reviewCount + 1) * 0.3;
  
  // Combine scores
  const rawScore = velocity + volumeScore + ratingScore + recencyBoost * 0.2;
  
  // Normalize to 0-100
  return Math.min(100, Math.round(rawScore * 50));
}

// ─── 4. OPTIMAL SEAT LOCK STRATEGY (Concurrent Booking Safety) ──────────────
export function calculateLockExpiry(minutesFromNow: number = 10): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

// ─── 5. SHOW DEMAND ESTIMATOR ────────────────────────────────────────────────
export function estimateDemandScore(
  totalBookings: number,
  capacity: number,
  hoursUntilShow: number
): number {
  const fillRate = totalBookings / capacity;
  // High fill rate + show soon = high demand
  const urgency = Math.max(0, 1 - hoursUntilShow / 48);
  return Math.min(1, fillRate * 0.7 + urgency * 0.3);
}

// ─── 6. REVENUE ANALYTICS ────────────────────────────────────────────────────
export function calculateRevenueMetrics(bookings: { totalAmount: number; createdAt: Date }[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const monthlyRevenue = bookings
    .filter(b => b.createdAt >= thirtyDaysAgo)
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const weeklyRevenue = bookings
    .filter(b => b.createdAt >= sevenDaysAgo)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Daily breakdown for chart
  const dailyMap = new Map<string, number>();
  bookings.filter(b => b.createdAt >= thirtyDaysAgo).forEach(b => {
    const dateKey = b.createdAt.toISOString().split("T")[0];
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + b.totalAmount);
  });

  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));

  return { totalRevenue, monthlyRevenue, weeklyRevenue, dailyRevenue };
}
