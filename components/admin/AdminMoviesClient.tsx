"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { createMovie, updateMovie, deleteMovie } from "@/app/actions/movies";
import { formatDuration } from "@/lib/utils";

import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Film,
} from "lucide-react";

import type { Movie, MovieForm, MovieStatus } from "@/lib/types/movie";

import { motion, AnimatePresence } from "framer-motion";

const GENRES = [
  "Action","Comedy","Drama","Horror","Sci-Fi","Thriller",
  "Romance","Animation","Documentary","Crime","Fantasy","Adventure"
] as const;

const STATUSES: MovieStatus[] = [
  "NOW_SHOWING",
  "COMING_SOON",
  "ENDED",
];

const emptyForm: MovieForm = {
  title: "",
  description: "",
  genre: [],
  duration: 120,
  language: "English",
  releaseDate: "",
  posterUrl: "",
  backdropUrl: "",
  trailerUrl: "",
  cast: "",
  director: "",
  status: "NOW_SHOWING",
  rating: 7.0,
};

function movieToForm(m: Movie): MovieForm {
  return {
    title: m.title,
    description: m.description,
    genre: m.genre,
    duration: m.duration,
    language: m.language,
    releaseDate: new Date(m.releaseDate).toISOString().split("T")[0],

    posterUrl: m.posterUrl,
    backdropUrl: m.backdropUrl ?? "",
    trailerUrl: m.trailerUrl ?? "",

    cast: m.cast.join(", "),
    director: m.director,
    status: m.status as MovieStatus,
    rating: m.rating,
  };
}

export function AdminMoviesClient({ movies }: { movies: Movie[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [form, setForm] = useState<MovieForm>(emptyForm);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (m: Movie) => {
    setForm(movieToForm(m));
    setEditing(m);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
  ...form,
  duration: Number(form.duration),
  rating: Number(form.rating),

    cast: Array.isArray(form.cast)
    ? form.cast
    : form.cast
        .split(",")
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0),
};

        if (editing) {
          await updateMovie(editing.id, payload);
        } else {
          await createMovie(payload);
        }

        toast({
          title: editing ? "Movie updated" : "Movie created",
        });

        setShowForm(false);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this movie?")) return;

    startTransition(async () => {
      try {
        await deleteMovie(id);
        toast({ title: "Movie deleted" });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-widest">
            MOVIES
          </h1>
          <p className="text-muted-foreground text-sm">
            {movies.length} movies in catalog
          </p>
        </div>

        <Button variant="gold" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Movie
        </Button>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id} className="border-b">
                <td className="p-3">{movie.title}</td>
                <td className="p-3">
                  {formatDuration(movie.duration)}
                </td>
                <td className="p-3">
                  {movie.rating.toFixed(1)}
                </td>
                <td className="p-3 flex gap-2">
                  <Button
                    size="icon"
                    onClick={() => openEdit(movie)}
                  >
                    <Pencil />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => handleDelete(movie.id)}
                  >
                    <Trash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Film className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No movies yet
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
  {showForm && (
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
          <h2 className="text-2xl font-semibold tracking-tight">
            {editing ? "Edit Movie" : "Add Movie"}
          </h2>
          <Button
            variant="ghost"
            onClick={() => setShowForm(false)}
            className="hover:rotate-90 transition"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                className="focus:ring-2 focus:ring-primary/50 transition"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label>Director</Label>
              <Input
                className="focus:ring-2 focus:ring-primary/50 transition"
                value={form.director}
                onChange={(e) =>
                  setForm({ ...form, director: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <textarea
                className="w-full rounded-md border bg-background p-2 text-sm focus:ring-2 focus:ring-primary/50 transition"
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
            <div className="space-y-1">
              <Label>Duration</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: Number(e.target.value) })
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
                  setForm({ ...form, rating: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Release Date</Label>
              <Input
                type="date"
                value={form.releaseDate}
                onChange={(e) =>
                  setForm({ ...form, releaseDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* IMAGE PREVIEW 🔥 */}
          {form.posterUrl && (
            <motion.img
              key={form.posterUrl}
              src={form.posterUrl}
              alt="poster preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-48 object-cover rounded-lg border"
            />
          )}

          {/* MEDIA */}
          <div className="space-y-3">
            <Input
              placeholder="Poster URL"
              value={form.posterUrl}
              onChange={(e) =>
                setForm({ ...form, posterUrl: e.target.value })
              }
            />

            <Input
              placeholder="Backdrop URL"
              value={form.backdropUrl}
              onChange={(e) =>
                setForm({ ...form, backdropUrl: e.target.value })
              }
            />

            <Input
              placeholder="Trailer URL"
              value={form.trailerUrl}
              onChange={(e) =>
                setForm({ ...form, trailerUrl: e.target.value })
              }
            />
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
                    className={`px-3 py-1 rounded-full text-sm border transition
                      ${active
                        ? "bg-primary text-white border-primary shadow"
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
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
</div>
  );
}