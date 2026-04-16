"use client";

import { useState, FormEvent, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShowtime } from "@/app/actions/showtimes";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Theater } from "@/lib/types/theaterScreen";

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

  const selectedTheater = theaters.find(
    (t) => t.id === selectedTheaterId
  );

  const screens = selectedTheater?.screens ?? [];

  const isPastDate = (date: string) => {
    return new Date(date) < new Date();
  };

  const getEndTime = () => {
    const movie = movies.find((m) => m.id === form.movieId);
    if (!movie || !form.startTime) return "";

    const end = new Date(
      new Date(form.startTime).getTime() +
        movie.duration * 60 * 1000
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
          err instanceof Error
            ? err.message
            : "Failed to create showtime";

        toast.error(message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Create Showtime
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Movie</Label>
            <select
              value={form.movieId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  movieId: e.target.value,
                }))
              }
              className="w-full border rounded-md h-10 px-3"
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
            <div>
              <Label>Theater</Label>
              <select
                value={selectedTheaterId}
                onChange={(e) =>
                  setSelectedTheaterId(e.target.value)
                }
                className="w-full border rounded-md h-10 px-3"
                required
              >
                <option value="">Select theater</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Screen</Label>
              <select
                value={form.screenId}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    screenId: e.target.value,
                  }))
                }
                className="w-full border rounded-md h-10 px-3"
                required
              >
                <option value="">Select screen</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={form.startTime}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  startTime: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <Label>Base Price</Label>
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
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="animate-spin mr-2" />
            )}
            Create Showtime
          </Button>
        </form>
      </div>
    </div>
  );
}