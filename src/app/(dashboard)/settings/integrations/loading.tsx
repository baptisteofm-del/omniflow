export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Search skeleton */}
      <div className="mb-6">
        <div className="h-10 bg-white/5 rounded-lg w-full max-w-md" />
      </div>

      {/* Integration cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-lg" />
                <div>
                  <div className="h-5 bg-white/5 rounded w-40 mb-1" />
                  <div className="h-3 bg-white/5 rounded w-56" />
                </div>
              </div>
              <div className="h-9 bg-white/5 rounded-lg w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
