export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Scheduling calendar skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
        <div className="h-5 bg-white/5 rounded w-40 mb-4" />
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded" />
          ))}
        </div>
      </div>

      {/* Posts list skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 bg-white/5 rounded w-48 mb-2" />
                <div className="h-4 bg-white/5 rounded w-32" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
              </div>
            </div>
            <div className="h-20 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
