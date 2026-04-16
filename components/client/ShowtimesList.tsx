"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Monitor } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  format,
  isToday,
  isTomorrow,
  addDays,
  isSameDay,
} from "date-fns";

import type { Showtime, Theater } from "@/lib/types/showtimeView";

type ShowtimesListProps = {
  showtimes: Showtime[];
};

export function ShowtimesList({ showtimes }: ShowtimesListProps) {
  const today = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => addDays(today, i));
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);

  const filteredShowtimes = showtimes.filter((st) =>
    isSameDay(new Date(st.startTime), selectedDate)
  );

  const byTheater = filteredShowtimes.reduce<
    Record<string, { theater: Theater; showtimes: Showtime[] }>
  >((acc, st) => {
    const theater = st.screen.theater;
    const theaterId = theater.id;

    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater,
        showtimes: [],
      };
    }

    acc[theaterId].showtimes.push(st);
    return acc;
  }, {});

  if (showtimes.length === 0) {
    return (
      <div>
        <h2 className="font-display text-3xl tracking-wider mb-6">
          BOOK TICKETS
        </h2>
        <p className="text-muted-foreground">
          No upcoming showtimes available.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wider mb-6">
        BOOK TICKETS
      </h2>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {dates.map((date) => {
          const count = showtimes.filter((st) =>
            isSameDay(new Date(st.startTime), date)
          ).length;

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`shrink-0 px-4 py-3 rounded-xl border text-center transition-all min-w-20 ${
                isSameDay(date, selectedDate)
                  ? "border-cinema-gold bg-cinema-gold/10 text-cinema-gold"
                  : "border-border hover:border-cinema-gold/40"
              }`}
            >
              <div className="text-xs text-muted-foreground">
                {isToday(date)
                  ? "Today"
                  : isTomorrow(date)
                  ? "Tomorrow"
                  : format(date, "EEE")}
              </div>
              <div className="font-bold text-lg">
                {format(date, "d")}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(date, "MMM")}
              </div>

              {count > 0 && (
                <div className="w-1 h-1 rounded-full bg-cinema-gold mx-auto mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {filteredShowtimes.length === 0 ? (
        <p className="text-muted-foreground">
          No showtimes on this date.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.values(byTheater).map(({ theater, showtimes: sts }) => (
            <div key={theater.id} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-cinema-gold" />
                <span className="font-semibold">{theater.name}</span>
                <span className="text-muted-foreground text-sm">
                  — {theater.city}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {sts.map((st) => (
                  <Link key={st.id} href={`/booking/${st.id}`}>
                    <div className="group border border-border rounded-lg px-4 py-3 hover:border-cinema-gold/50 hover:bg-cinema-gold/5 transition-all cursor-pointer">
                      <div className="font-bold text-sm">
                        {format(new Date(st.startTime), "h:mm a")}
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Monitor className="w-3 h-3" />
                        {st.screen.name}
                      </div>

                      <div className="text-xs text-cinema-gold mt-1 flex items-center gap-1">
                        {formatCurrency(st.basePrice)}+

                        {(st.availableSeats ?? 0) <
                          (st.totalSeats ?? 0) * 0.2 && (
                          <Badge variant="cinema" className="text-xs py-0">
                            Fast filling
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}