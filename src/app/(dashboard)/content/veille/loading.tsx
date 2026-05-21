export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 rounded-lg w-40" />
        ))}
      </div>

      {/* Content list skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-white/5 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-white/5 rounded w-2/3 mb-2" />
                <div className="h-4 bg-white/5 rounded w-full mb-2" />
                <div className="h-4 bg-white/5 rounded w-4/5 mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 bg-white/5 rounded-full w-20" />
                  <div className="h-6 bg-white/5 rounded-full w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
