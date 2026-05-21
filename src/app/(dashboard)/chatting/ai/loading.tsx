export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 bg-white/5 rounded-xl w-64 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-full max-w-2xl" />
      </div>

      {/* Section title */}
      <div className="h-7 bg-white/5 rounded-lg w-56 mb-6" />

      {/* Models configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-5 bg-white/5 rounded w-40 mb-2" />
                <div className="h-4 bg-white/5 rounded w-28" />
              </div>
              <div className="h-9 w-24 bg-white/5 rounded-lg ml-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Scripts section */}
      <div className="mb-12">
        <div className="h-7 bg-white/5 rounded-lg w-32 mb-6" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="h-5 bg-white/5 rounded w-48 mb-2" />
              <div className="h-4 bg-white/5 rounded w-full mb-2" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats section */}
      <div className="mb-12">
        <div className="h-7 bg-white/5 rounded-lg w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="h-4 bg-white/5 rounded w-32 mb-2" />
              <div className="h-8 bg-white/5 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
