export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Current plan skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <div className="h-6 bg-white/5 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-white/5 rounded w-48" />
              <div className="h-4 bg-white/5 rounded w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Plans comparison skeleton */}
      <div className="mb-8">
        <div className="h-6 bg-white/5 rounded w-40 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="h-5 bg-white/5 rounded w-24 mb-2" />
              <div className="h-8 bg-white/5 rounded w-20 mb-4" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-3 bg-white/5 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="h-6 bg-white/5 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
