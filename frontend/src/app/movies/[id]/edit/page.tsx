import MovieForm from "@/components/MovieForm";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit movie</h1>
      <MovieForm movieId={Number(id)} />
    </div>
  );
}
