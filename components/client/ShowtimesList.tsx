"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Monitor } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  format,
  isToday,
  isTomorrow,
  addDays,
  isSameDay,
} from "date-fns";

import { motion, AnimatePresence } from "framer-motion";

import type { Showtime, Theater } from "@/lib/types/showtimeView";

type ShowtimesListProps = {
  showtimes: Showtime[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
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
    const id = theater.id;

    if (!acc[id]) {
      acc[id] = { theater, showtimes: [] };
    }

    acc[id].showtimes.push(st);
    return acc;
  }, {});

  if (showtimes.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="font-display text-3xl tracking-wider mb-3">
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

      <motion.div
        className="flex gap-3 overflow-x-auto pb-3 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {dates.map((date) => {
          const count = showtimes.filter((st) =>
            isSameDay(new Date(st.startTime), date)
          ).length;

          const active = isSameDay(date, selectedDate);

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`shrink-0 px-4 py-3 rounded-xl border min-w-24 transition-all text-center ${
                active
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

              <div className="font-bold text-lg">{format(date, "d")}</div>

              <div className="text-xs text-muted-foreground">
                {format(date, "MMM")}
              </div>

              {count > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-cinema-gold mx-auto mt-1" />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredShowtimes.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground"
          >
            No showtimes on this date.
          </motion.p>
        ) : (
          <motion.div
  key="list"
  initial="hidden"
  animate="show"
  variants={containerVariants}
  className="space-y-10"
>
  {Object.values(byTheater).map(({ theater, showtimes }) => (
    <motion.section
      key={theater.id}
      variants={itemVariants}
      className="space-y-4"
    >
      {/* Theater header (premium minimal) */}
      <div className="flex items-end justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cinema-gold" />
          <div>
            <h3 className="font-medium tracking-wide">
              {theater.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {theater.city}
            </p>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          {showtimes.length} shows
        </span>
      </div>

      {/* Ticket list */}
      <div className="space-y-3">
        {showtimes.map((st) => {
          const isHot =
            st.availableSeats < st.totalSeats * 0.2;

          return (
            <motion.div
              key={st.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="shrink-0"
            >
              <Link href={`/booking/${st.id}`}>
                <div className="relative flex items-stretch rounded-xl overflow-hidden border border-border bg-background/60 hover:border-cinema-gold/50 transition-all">

                  {/* LEFT: TIME BLOCK (ticket stub) */}
                  <div className="w-28 flex flex-col items-center justify-center bg-cinema-gold/10 border-r border-dashed border-border py-4">
                    <div className="text-xl font-semibold tracking-tight">
                      {format(new Date(st.startTime), "h:mm")}
                    </div>

                    <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                      {format(new Date(st.startTime), "a")}
                    </div>
                  </div>

                  {/* perforation dots (ticket feel) */}
                  <div className="absolute left-28 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-border"
                      />
                    ))}
                  </div>

                  {/* RIGHT: DETAILS */}
                  <div className="flex-1 px-4 py-3 flex items-center justify-between">

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Monitor className="w-3 h-3 text-muted-foreground" />
                        {st.screen.name}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Standard Seating
                      </div>
                    </div>

                    {/* Price + badge */}
                    <div className="text-right">
                      <div className="text-sm font-semibold text-cinema-gold">
                        {formatCurrency(st.basePrice)}+
                      </div>

                      {isHot && (
                        <div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-cinema-gold/10 text-cinema-gold">
                          Filling fast
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  ))}
</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}