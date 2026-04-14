"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { createMovie, updateMovie, deleteMovie } from "@/app/actions/movies";
import { formatDuration } from "@/lib/utils";
import { MovieClientSchema } from "@/lib/zodSchema";

import {
  Plus,
  Pencil,
  Trash2,
  Film,
} from "lucide-react";

import type { Movie, MovieForm, MovieStatus } from "@/lib/types/movie";

import { MovieFormModal } from "./MovieFormModal";
import { toast } from "react-toastify";

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

  const payload = {
    ...form,
    duration: Number(form.duration),
    rating: Number(form.rating),
    cast: Array.isArray(form.cast)
      ? form.cast
      : form.cast
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
  };

  // ✅ CLIENT VALIDATION (safe)
  const result = MovieClientSchema.safeParse(payload);

  if (!result.success) {
    result.error.issues.forEach((err) => {
  toast.error(err.message);
});
    return;
  }

  startTransition(async () => {
    try {
      if (editing) {
        await updateMovie(editing.id, result.data);
        toast.success("Movie updated 🎬");
      } else {
        await createMovie(result.data);
        toast.success("Movie created 🎉");
      }

      setShowForm(false);
    } catch (err) {
      console.log(err)
      toast.error("Something went wrong on server");
    }
  });
};

  const handleDelete = (id: string) => {
  if (!confirm("Delete this movie?")) return;

  startTransition(async () => {
    try {
      await deleteMovie(id);
      toast.success("Movie deleted 🗑️");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete movie");
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
      <MovieFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        isPending={isPending}
        editing={!!editing}
      />
    </div>
  );
}