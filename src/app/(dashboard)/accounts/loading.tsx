export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Add button + filters skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg w-32" />
          ))}
        </div>
        <div className="h-10 bg-white/5 rounded-lg w-40" />
      </div>

      {/* Accounts grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-full" />
                <div>
                  <div className="h-5 bg-white/5 rounded w-40 mb-2" />
                  <div className="h-4 bg-white/5 rounded w-32" />
                </div>
              </div>
              <div className="h-8 w-8 bg-white/5 rounded-lg" />
            </div>
            <div className="space-y-2 mb-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-3 bg-white/5 rounded w-full" />
              ))}
            </div>
            <div className="h-8 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
