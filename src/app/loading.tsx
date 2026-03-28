export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-green-900 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="w-[120px] h-[120px] rounded-full bg-green-800 animate-pulse mx-auto" />
          <div className="h-10 bg-green-800 rounded-xl w-72 mx-auto animate-pulse" />
          <div className="h-5 bg-green-800 rounded w-48 mx-auto animate-pulse" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
