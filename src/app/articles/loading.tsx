export default function ArticlesLoading() {
  return (
    <div>
      <div className="bg-green-900 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-green-800 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-green-800 rounded w-64 animate-pulse" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
