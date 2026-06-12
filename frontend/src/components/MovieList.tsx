"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteMovie, getMovies, updateMovie } from "@/lib/api";
import type { Movie, WatchedFilter } from "@/types/movie";
import FilterTabs from "./FilterTabs";
import MovieCard from "./MovieCard";

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filter, setFilter] = useState<WatchedFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async (activeFilter: WatchedFilter) => {
    setLoading(true);
    setError(null);
    try {
      const watched = activeFilter === "all" ? undefined : activeFilter === "watched";
      setMovies(await getMovies(watched));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies(filter);
  }, [filter, loadMovies]);

  async function handleToggleWatched(movie: Movie) {
    try {
      const updated = await updateMovie(movie.id, {
        title: movie.title,
        genre: movie.genre,
        rating: movie.rating,
        watched: !movie.watched,
      });
      // Refetch keeps the list consistent with the active filter.
      if (filter === "all") {
        setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        setMovies((prev) => prev.filter((m) => m.id !== updated.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie");
    }
  }

  async function handleDelete(movie: Movie) {
    if (!window.confirm(`Delete "${movie.title}"?`)) {
      return;
    }
    try {
      await deleteMovie(movie.id);
      setMovies((prev) => prev.filter((m) => m.id !== movie.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete movie");
    }
  }

  return (
    <div className="space-y-4">
      <FilterTabs active={filter} onChange={setFilter} />

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading movies…</p>
      ) : movies.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No movies found. Add one to get started!
        </p>
      ) : (
        <div className="space-y-3">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onToggleWatched={handleToggleWatched}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
