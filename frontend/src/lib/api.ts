import type { Movie, MovieInput } from "@/types/movie";

// Falls back to relative URLs so the app also works behind an ingress
// that routes /api to the backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export function getMovies(watched?: boolean): Promise<Movie[]> {
  const query = watched === undefined ? "" : `?watched=${watched}`;
  return request<Movie[]>(`/api/movies${query}`);
}

export function getMovie(id: number): Promise<Movie> {
  return request<Movie>(`/api/movies/${id}`);
}

export function createMovie(data: MovieInput): Promise<Movie> {
  return request<Movie>("/api/movies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMovie(id: number, data: MovieInput): Promise<Movie> {
  return request<Movie>(`/api/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMovie(id: number): Promise<void> {
  return request<void>(`/api/movies/${id}`, { method: "DELETE" });
}
