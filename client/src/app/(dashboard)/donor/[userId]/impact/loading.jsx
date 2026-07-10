export default function DonorImpactLoading() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-slate-800 rounded" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="h-9 w-9 bg-gray-200 rounded-lg" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-5 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="flex items-end gap-2 h-36">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${30 + i * 10}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-5 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-200 shrink-0" />
            <div className="space-y-2 flex-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
