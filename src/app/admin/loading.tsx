export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
