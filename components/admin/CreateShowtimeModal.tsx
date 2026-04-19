"use client";

import { useState, FormEvent, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShowtime } from "@/app/actions/showtimes";
import { X, Loader2, Film, Calendar, Monitor, Banknote } from "lucide-react";
import { toast } from "react-toastify";
import { Theater } from "@/lib/types/cinema";
import { motion } from "framer-motion";

type Movie = {
  id: string;
  title: string;
  duration: number;
};

type Props = {
  movies: Movie[];
  theaters: Theater[];
  onClose: () => void;
};

export function CreateShowtimeModal({
  movies,
  theaters,
  onClose,
}: Props) {
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    movieId: "",
    screenId: "",
    startTime: "",
    basePrice: 200,
    premiumMultiplier: 1.5,
    vipMultiplier: 2.5,
    reclineMultiplier: 3,
  });

  const selectedTheater = theaters.find((t) => t.id === selectedTheaterId);
  const screens = selectedTheater?.screens ?? [];

  const isPastDate = (date: string) => new Date(date) < new Date();

  const getEndTime = () => {
    const movie = movies.find((m) => m.id === form.movieId);
    if (!movie || !form.startTime) return "";

    const end = new Date(
      new Date(form.startTime).getTime() + movie.duration * 60 * 1000
    );

    return end.toISOString();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isPastDate(form.startTime)) {
      toast.error("Start time cannot be in the past");
      return;
    }

    startTransition(async () => {
      try {
        const endTime = getEndTime();
        if (!endTime) throw new Error("Invalid data");

        await createShowtime({
          ...form,
          endTime,
        });

        toast.success("Showtime created 🎬");
        onClose();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create showtime";

        toast.error(message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-xl rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cinema-gold" />
            <h2 className="text-lg font-semibold tracking-wide">
              Create Showtime
            </h2>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Film className="w-4 h-4" /> Movie
            </Label>

            <select
              value={form.movieId}
              onChange={(e) =>
                setForm((p) => ({ ...p, movieId: e.target.value }))
              }
              className="w-full h-11 rounded-lg border bg-background px-3"
              required
            >
              <option value="">Select movie</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Theater</Label>
              <select
                value={selectedTheaterId}
                onChange={(e) => setSelectedTheaterId(e.target.value)}
                className="w-full h-11 rounded-lg border bg-background px-3"
                required
              >
                <option value="">Select</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Screen
              </Label>

              <select
                value={form.screenId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, screenId: e.target.value }))
                }
                className="w-full h-11 rounded-lg border bg-background px-3"
                required
              >
                <option value="">Select</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Start Time
            </Label>

            <Input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={form.startTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, startTime: e.target.value }))
              }
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Banknote className="w-4 h-4" /> Base Price
            </Label>

            <Input
              type="number"
              min="50"
              value={form.basePrice}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  basePrice: Number(e.target.value),
                }))
              }
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-yellow-600 text-black hover:opacity-90"
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Showtime
          </Button>
        </form>
      </motion.div>
    </div>
  );
}