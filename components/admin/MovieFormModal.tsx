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
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-start p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="w-full max-w-3xl bg-background rounded-2xl shadow-2xl border p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                {editing ? "Edit Movie" : "Add Movie"}
              </h2>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">

              {/* BASIC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Director</Label>
                  <Input
                    value={form.director}
                    onChange={(e) =>
                      setForm({ ...form, director: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full rounded-md border p-2"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  placeholder="Duration"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: Number(e.target.value) })
                  }
                />

                <Input
                  type="number"
                  step="0.1"
                  placeholder="Rating"
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: Number(e.target.value) })
                  }
                />

                <Input
                  placeholder="Language"
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                />
              </div>

              {/* STATUS ✅ FIXED */}
              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-2">
                  {STATUSES.map((s) => {
                    const active = form.status === s;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        key={s}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, status: s })
                        }
                        className={`px-3 py-1 rounded-md text-sm border
                          ${active
                            ? "bg-primary text-white"
                            : "hover:bg-muted"
                          }`}
                      >
                        {s.replace("_", " ")}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* GENRES */}
              <div>
                <Label>Genres</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GENRES.map((g) => {
                    const active = form.genre.includes(g);
                    return (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        key={g}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            genre: active
                              ? p.genre.filter((x) => x !== g)
                              : [...p.genre, g],
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-sm border
                          ${active
                            ? "bg-primary text-white"
                            : "hover:bg-muted"
                          }`}
                      >
                        {g}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>

                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 animate-spin" />
                  )}
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}