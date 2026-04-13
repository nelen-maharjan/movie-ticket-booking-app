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

/* ---------------------------
   SAFE MAPPER (IMPORTANT FIX)
----------------------------*/
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
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-background p-6 rounded-xl">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4"
            >
              {Object.keys(emptyForm).map((key) => (
                <div key={key} className="col-span-2">
                  <Label>{key}</Label>

                  <Input
                    value={String((form as never)[key] ?? "")}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}

              {/* Genres */}
              <div className="col-span-2 flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        genre: p.genre.includes(g)
                          ? p.genre.filter((x) => x !== g)
                          : [...p.genre, g],
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="col-span-2 flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        status: s,
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 animate-spin" />
                )}
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}