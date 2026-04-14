"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";

import type { MovieForm, MovieStatus } from "@/lib/types/movie";

const GENRES = [
  "Action","Comedy","Drama","Horror","Sci-Fi","Thriller",
  "Romance","Animation","Documentary","Crime","Fantasy","Adventure"
] as const;

const STATUSES: MovieStatus[] = ["NOW_SHOWING", "COMING_SOON", "ENDED"];

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
  const [castInput, setCastInput] = useState<string>("");

  const cast = form.cast;

  const addCast = (): void => {
    const value = castInput.trim();
    if (!value) return;

    if (!cast.includes(value)) {
      setForm({ ...form, cast: [...cast, value] });
    }

    setCastInput("");
  };

  const removeCast = (name: string): void => {
    setForm({
      ...form,
      cast: cast.filter((c: string) => c !== name),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex justify-center items-start p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="w-full max-w-5xl rounded-2xl border bg-background shadow-2xl overflow-hidden"
          >

            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 backdrop-blur-md px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {editing ? "Edit Movie" : "Create Movie"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage metadata, media, cast and publishing state
                </p>
              </div>

              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-10">

              {/* GRID */}
              <div className="grid grid-cols-12 gap-6">

                {/* LEFT MAIN */}
                <div className="col-span-8 space-y-6">

                  <Card title="Basic Info">
                    <Field label="Title">
                      <Input
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Director">
                      <Input
                        value={form.director}
                        onChange={(e) =>
                          setForm({ ...form, director: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Description">
                      <textarea
                        className="w-full rounded-md border bg-background p-3 text-sm min-h-25 focus:ring-2 focus:ring-primary/20"
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                      />
                    </Field>
                  </Card>

                  <Card title="Media">
                    <Field label="Poster URL">
                      <Input
                        value={form.posterUrl}
                        onChange={(e) =>
                          setForm({ ...form, posterUrl: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Backdrop URL">
                      <Input
                        value={form.backdropUrl}
                        onChange={(e) =>
                          setForm({ ...form, backdropUrl: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Trailer URL">
                      <Input
                        value={form.trailerUrl}
                        onChange={(e) =>
                          setForm({ ...form, trailerUrl: e.target.value })
                        }
                      />
                    </Field>
                  </Card>

                  <Card title="Cast">

                    <div className="flex gap-2">
                      <Input
                        value={castInput}
                        placeholder="Add actor..."
                        onChange={(e) => setCastInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCast();
                          }
                        }}
                      />
                      <Button type="button" onClick={addCast}>
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {cast.map((c: string) => (
                        <span
                          key={c}
                          className="px-3 py-1 text-sm rounded-full bg-muted flex items-center gap-2"
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() => removeCast(c)}
                            className="opacity-60 hover:opacity-100"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                  </Card>

                </div>

                {/* RIGHT SIDEBAR */}
                <div className="col-span-4 space-y-6">

                  <Card title="Details">
                    <Field label="Duration">
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
                    </Field>

                    <Field label="Rating">
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
                    </Field>

                    <Field label="Language">
                      <Input
                        value={form.language}
                        onChange={(e) =>
                          setForm({ ...form, language: e.target.value })
                        }
                      />
                    </Field>

                    <Field label="Release Date">
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
                    </Field>
                  </Card>

                  <Card title="Status">
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, status: s })
                          }
                          className={`px-3 py-1 text-xs rounded-full border transition ${
                            form.status === s
                              ? "bg-primary text-white border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {s.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card title="Genres">
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((g) => {
                        const active = form.genre.includes(g);

                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                genre: active
                                  ? form.genre.filter((x) => x !== g)
                                  : [...form.genre, g],
                              })
                            }
                            className={`px-3 py-1 text-xs rounded-full border transition ${
                              active
                                ? "bg-primary text-white border-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>

                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editing ? "Update Movie" : "Create Movie"}
                </Button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- UI building blocks ---------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 space-y-3 hover:bg-muted/30 transition">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}