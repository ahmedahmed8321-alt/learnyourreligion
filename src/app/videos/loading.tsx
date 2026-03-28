export default function VideosLoading() {
  return (
    <div>
      <div className="bg-green-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-green-800 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-green-800 rounded w-64 animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
