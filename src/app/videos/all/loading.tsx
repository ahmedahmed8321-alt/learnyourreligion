export default function AllVideosLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="h-8 bg-gray-200 rounded w-40 animate-pulse mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
