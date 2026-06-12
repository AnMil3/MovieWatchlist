import MovieList from "@/components/MovieList";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My movies</h1>
      <MovieList />
    </div>
  );
}
