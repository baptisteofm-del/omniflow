export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-xl w-48 mb-4" />
        <div className="h-5 bg-white/5 rounded-lg w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="h-4 bg-white/5 rounded w-32 mb-2" />
            <div className="h-8 bg-white/5 rounded w-24 mb-1" />
            <div className="h-3 bg-white/5 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Referral link section skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <div className="h-5 bg-white/5 rounded w-40 mb-4" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-white/5 rounded-lg" />
          <div className="h-10 w-32 bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* Referrals list skeleton */}
      <div>
        <div className="h-5 bg-white/5 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-white/5 rounded w-48 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-32" />
                </div>
                <div className="h-6 bg-white/5 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
