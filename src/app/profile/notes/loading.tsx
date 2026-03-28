export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-56 mb-6" />
      <div className="bg-white rounded-2xl shadow p-5 mb-8">
        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-24 bg-gray-100 rounded-xl mb-3" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow p-5 border-r-4 border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-24 mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
