"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createMovie, getMovie, updateMovie } from "@/lib/api";
import type { MovieInput } from "@/types/movie";

const EMPTY_FORM: MovieInput = { title: "", genre: "", rating: 5, watched: false };

interface MovieFormProps {
  movieId?: number;
}

export default function MovieForm({ movieId }: MovieFormProps) {
  const router = useRouter();
  const isEdit = movieId !== undefined;

  const [form, setForm] = useState<MovieInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId === undefined) {
      return;
    }
    getMovie(movieId)
      .then((movie) =>
        setForm({
          title: movie.title,
          genre: movie.genre,
          rating: movie.rating,
          watched: movie.watched,
        })
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load movie")
      )
      .finally(() => setLoading(false));
  }, [movieId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await updateMovie(movieId, form);
      } else {
        await createMovie(form);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save movie");
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="py-8 text-center text-gray-500">Loading movie…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={255}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
          placeholder="The Godfather"
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
          Genre
        </label>
        <input
          id="genre"
          type="text"
          required
          maxLength={100}
          value={form.genre}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
          placeholder="Crime"
        />
      </div>

      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          Rating (1–10)
        </label>
        <input
          id="rating"
          type="number"
          required
          min={1}
          max={10}
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          className="mt-1 w-24 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="watched"
          type="checkbox"
          checked={form.watched}
          onChange={(e) => setForm({ ...form, watched: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <label htmlFor="watched" className="text-sm font-medium text-gray-700">
          Already watched
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add movie"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
