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
];

const STATUSES: MovieStatus[] = ["NOW_SHOWING","COMING_SOON","ENDED"];

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

type FieldConfig = {
  id: keyof MovieForm;
  label: string;
  span?: number;
  textarea?: boolean;
  type?: string;
  step?: number;
  min?: number;
  max?: number;
};

const fields: FieldConfig[] = [
  { id: "title", label: "Title", span: 2 },
  { id: "description", label: "Description", span: 2, textarea: true },
  { id: "director", label: "Director" },
  { id: "duration", label: "Duration (min)", type: "number" },
  { id: "language", label: "Language" },
  { id: "rating", label: "Rating (0-10)", type: "number", step: 0.1, min: 0, max: 10 },
  { id: "releaseDate", label: "Release Date", type: "date" },
  { id: "posterUrl", label: "Poster URL" },
  { id: "backdropUrl", label: "Backdrop URL" },
  { id: "trailerUrl", label: "Trailer URL" },
  { id: "cast", label: "Cast (comma separated)", span: 2 },
];

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
  setForm({
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
    status: m.status,
    rating: m.rating,
  });

  setEditing(m);
  setShowForm(true);
};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const data = {
          ...form,
          duration: Number(form.duration),
          rating: Number(form.rating),
          cast:
            typeof form.cast === "string"
              ? form.cast.split(",").map((c: string) => c.trim())
              : form.cast,
        };

        if (editing) await updateMovie(editing.id, data);
        else await createMovie(data);

        toast({ title: editing ? "Movie updated" : "Movie created" });
        setShowForm(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";

        toast({
          title: "Error",
          description: message,
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
        const message =
          error instanceof Error ? error.message : "Something went wrong";

        toast({
          title: "Error",
          description: message,
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
          <h1 className="font-display text-4xl tracking-widest">MOVIES</h1>
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
              <tr key={movie.id}>
                <td>{movie.title}</td>
                <td>{formatDuration(movie.duration)}</td>
                <td>{movie.rating.toFixed(1)}</td>
                <td>
                  <Button onClick={() => openEdit(movie)}>
                    <Pencil />
                  </Button>
                  <Button onClick={() => handleDelete(movie.id)}>
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
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center p-4">
          <div className="w-full max-w-2xl bg-background p-6 rounded-xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.id} className={f.span === 2 ? "col-span-2" : ""}>
                  <Label>{f.label}</Label>

                  {f.textarea ? (
                    <textarea
                      value={String(form[f.id] ?? "")}
                      onChange={(e) =>
                        setForm((prev: MovieForm) => ({
                          ...prev,
                          [f.id]: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      type={f.type || "text"}
                      value={String(form[f.id] ?? "")}
                      onChange={(e) =>
                        setForm((prev: MovieForm) => ({
                          ...prev,
                          [f.id]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}

              {/* Genres */}
              <div className="col-span-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setForm((p: MovieForm) => ({
                        ...p,
                        genre: p.genre.includes(g)
                          ? p.genre.filter((x: string) => x !== g)
                          : [...p.genre, g],
                      }))
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Status */}
              <div className="col-span-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setForm((p: MovieForm) => ({
                        ...p,
                        status: s,
                      }))
                    }
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin mr-2" />}
                {editing ? "Update" : "Create"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}