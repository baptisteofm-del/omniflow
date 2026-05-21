export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="h-4 bg-white/5 rounded w-32 mb-3" />
            <div className="h-8 bg-white/5 rounded w-24 mb-2" />
            <div className="h-3 bg-white/5 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="h-64 bg-white/5 border border-white/10 rounded-lg" />
        <div className="h-64 bg-white/5 border border-white/10 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="h-5 bg-white/5 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
