export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex gap-2 mb-6 pb-4 border-b border-white/10">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-9 w-9 bg-white/5 rounded-lg" />
        ))}
      </div>

      {/* Editor canvas skeleton */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left panel - properties */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-white/5 rounded w-24 mb-2" />
              <div className="h-8 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Center panel - canvas */}
        <div className="col-span-1 h-96 bg-white/5 border border-white/10 rounded-lg" />

        {/* Right panel - preview */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
