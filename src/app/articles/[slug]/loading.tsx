export default function ArticleLoading() {
  return (
    <div>
      <div className="bg-green-900 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="h-4 bg-green-800 rounded w-32 animate-pulse mb-4" />
          <div className="h-10 bg-green-800 rounded w-3/4 animate-pulse" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    </div>
  );
}
