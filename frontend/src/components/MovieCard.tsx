"use client";

import Link from "next/link";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  onToggleWatched: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
}

export default function MovieCard({ movie, onToggleWatched, onDelete }: MovieCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-semibold text-gray-900">{movie.title}</h2>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              movie.watched
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {movie.watched ? "Watched" : "Not watched"}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {movie.genre} · Rating: {movie.rating}/10
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onToggleWatched(movie)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {movie.watched ? "Mark unwatched" : "Mark watched"}
        </button>
        <Link
          href={`/movies/${movie.id}/edit`}
          className="rounded-md border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(movie)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
