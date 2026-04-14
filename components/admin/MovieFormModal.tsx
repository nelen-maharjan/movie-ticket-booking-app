"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import type { MovieForm, MovieStatus } from "@/lib/types/movie";

const GENRES = [
  "Action","Comedy","Drama","Horror","Sci-Fi","Thriller",
  "Romance","Animation","Documentary","Crime","Fantasy","Adventure"
] as const;

const STATUSES: MovieStatus[] = [
  "NOW_SHOWING",
  "COMING_SOON",
  "ENDED",
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  form: MovieForm;
  setForm: React.Dispatch<React.SetStateAction<MovieForm>>;
  isPending: boolean;
  editing: boolean;
};

export function MovieFormModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isPending,
  editing,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-center items-start p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="w-full max-w-3xl rounded-2xl border bg-background/95 backdrop-blur-xl shadow-[0_20px_100px_rgba(0,0,0,0.65)] p-6"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {editing ? "Edit Movie" : "Add Movie"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage movie details, metadata and publishing state
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={onClose}
                className="hover:rotate-90 transition"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">

              {/* BASIC INFO */}
              <motion.section className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Basic Info
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Director</Label>
                    <Input
                      value={form.director}
                      onChange={(e) =>
                        setForm({ ...form, director: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Label>Description</Label>
                    <textarea
                      className="w-full rounded-md border bg-background p-3 text-sm resize-none"
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </motion.section>

              <div className="h-px bg-border" />

              {/* DETAILS */}
              <motion.section className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Details
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Duration</Label>
                    <Input
                      type="number"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          duration: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Rating</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rating: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Language</Label>
                    <Input
                      value={form.language}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          language: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Release Date</Label>
                    <Input
                      type="date"
                      value={form.releaseDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          releaseDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </motion.section>

              <div className="h-px bg-border" />

              {/* MEDIA */}
              <motion.section className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Media
                </h3>

                <div className="space-y-3">
                  <div>
                    <Label>Poster URL</Label>
                    <Input
                      value={form.posterUrl}
                      onChange={(e) =>
                        setForm({ ...form, posterUrl: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Backdrop URL</Label>
                    <Input
                      value={form.backdropUrl}
                      onChange={(e) =>
                        setForm({ ...form, backdropUrl: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Trailer URL</Label>
                    <Input
                      value={form.trailerUrl}
                      onChange={(e) =>
                        setForm({ ...form, trailerUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
              </motion.section>

              <div className="h-px bg-border" />

              {/* CAST */}
              <motion.section className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Cast
                </h3>

                <div>
                  <Label>Cast (comma separated)</Label>
                  <Input
                    value={form.cast.join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cast: e.target.value
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </motion.section>

              <div className="h-px bg-border" />

              {/* STATUS */}
              <motion.section className="space-y-3">
                <Label>Status</Label>

                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => {
                    const active = form.status === s;

                    return (
                      <motion.button
                        key={s}
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          setForm({ ...form, status: s })
                        }
                        className={`px-4 py-2 rounded-full text-sm border ${
                          active
                            ? "bg-primary text-white border-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>

              {/* GENRES */}
              <motion.section className="space-y-3">
                <Label>Genres</Label>

                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => {
                    const active = form.genre.includes(g);

                    return (
                      <motion.button
                        key={g}
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            genre: active
                              ? p.genre.filter((x) => x !== g)
                              : [...p.genre, g],
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-sm border ${
                          active
                            ? "bg-primary text-white border-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {g}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>

              {/* ACTIONS */}
              <div className="sticky bottom-0 pt-4 border-t bg-background/80 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button type="submit" disabled={isPending}>
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editing ? "Update Movie" : "Create Movie"}
                  </Button>
                </motion.div>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}