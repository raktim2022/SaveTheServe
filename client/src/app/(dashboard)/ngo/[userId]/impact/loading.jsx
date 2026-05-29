export default function NGOImpactLoading() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-3">
            <div className="h-9 w-9 bg-gray-200 rounded-lg" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-xl p-5 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="flex justify-between">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-3 w-6 bg-gray-200 rounded" />)}
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-5 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-2 w-full bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl p-5 space-y-3">
        <div className="h-5 w-44 bg-gray-200 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
