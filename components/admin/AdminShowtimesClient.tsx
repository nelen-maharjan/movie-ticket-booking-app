"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { CreateShowtimeModal } from "./CreateShowtimeModal";
import { Theater } from "@/lib/types/cinema";

/* ---------- TYPES ---------- */

type Showtime = {
  id: string;
  startTime: string | Date;
  status: string;
  basePrice: number;
  demandScore: number;
  totalSeats: number;
  availableSeats: number;
  movie: { title: string; language: string };
  screen: { name: string; theater: { name: string } };
};

type Movie = {
  id: string;
  title: string;
  duration: number;
};

export function AdminShowtimesClient({
  showtimes,
  movies,
  theaters,
}: {
  showtimes: Showtime[];
  movies: Movie[];
  theaters: Theater[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Showtimes</h1>
          <p className="text-sm text-muted-foreground">
            {showtimes.length} scheduled
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Showtime
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Movie</th>
              <th className="p-3">Time</th>
              <th className="p-3">Price</th>
              <th className="p-3">Seats</th>
            </tr>
          </thead>

          <tbody>
            {showtimes.map((st) => (
              <tr key={st.id} className="border-t">
                <td className="p-3">
                  {st.movie.title}
                </td>

                <td className="p-3">
                  {format(new Date(st.startTime), "PPp")}
                  <br />
                  <Badge>{st.status}</Badge>
                </td>

                <td className="p-3">
                  {formatCurrency(st.basePrice)}
                  <div className="text-xs flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {(st.demandScore * 100).toFixed(0)}%
                  </div>
                </td>

                <td className="p-3">
                  {st.availableSeats}/{st.totalSeats}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <CreateShowtimeModal
          movies={movies}
          theaters={theaters}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}