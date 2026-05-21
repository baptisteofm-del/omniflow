export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-64 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Input form skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <div className="h-5 bg-white/5 rounded w-32 mb-4" />
        <div className="space-y-3 mb-6">
          <div className="h-10 bg-white/5 rounded-lg" />
          <div className="h-24 bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 bg-white/5 rounded-lg w-32" />
      </div>

      {/* Generated content skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 bg-white/5 rounded w-32" />
              <div className="h-8 w-20 bg-white/5 rounded-lg" />
            </div>
            <div className="h-4 bg-white/5 rounded w-full mb-2" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
