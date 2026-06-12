export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  watched: boolean;
  created_at: string;
}

export interface MovieInput {
  title: string;
  genre: string;
  rating: number;
  watched: boolean;
}

export type WatchedFilter = "all" | "watched" | "unwatched";
