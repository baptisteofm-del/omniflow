'use client'
import { cn } from '@/lib/utils/cn'

interface TrendFiltersProps {
  platforms: ('tiktok' | 'instagram' | 'twitter' | 'youtube' | 'reddit' | 'all')[]
  selectedPlatform: 'tiktok' | 'instagram' | 'twitter' | 'youtube' | 'reddit' | 'all'
  onPlatformChange: (platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube' | 'reddit' | 'all') => void
  
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

const platformLabels: Record<string, string> = {
  all: 'Tous',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  twitter: 'Twitter/X',
  youtube: 'YouTube',
  reddit: 'Reddit',
}

const platformColors: Record<string, string> = {
  all: 'bg-gray-700 hover:bg-gray-600',
  tiktok: 'bg-black hover:bg-gray-900 border-white/20',
  instagram: 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 border-pink-500/30',
  twitter: 'bg-blue-600/30 hover:bg-blue-600/50 border-blue-500/30',
  youtube: 'bg-red-600/30 hover:bg-red-600/50 border-red-500/30',
  reddit: 'bg-orange-600/30 hover:bg-orange-600/50 border-orange-500/30',
}

export function TrendFilters({
  platforms,
  selectedPlatform,
  onPlatformChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: TrendFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Platform filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Plateforme
        </h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => (
            <button
              key={platform}
              onClick={() => onPlatformChange(platform)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                selectedPlatform === platform
                  ? 'ring-2 ring-purple-500/80 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 text-gray-400 hover:text-white',
                platformColors[platform] || 'bg-gray-700 hover:bg-gray-600'
              )}
            >
              {platformLabels[platform] || platform}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Catégorie
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* All categories button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
              selectedCategory === null
                ? 'ring-2 ring-purple-500/80 shadow-lg shadow-purple-500/20 bg-gray-700'
                : 'border-white/10 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700'
            )}
          >
            Tous
          </button>

          {/* Individual categories */}
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(selectedCategory === category ? null : category)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border capitalize',
                selectedCategory === category
                  ? 'ring-2 ring-cyan-500/80 shadow-lg shadow-cyan-500/20 bg-cyan-600/30'
                  : 'border-white/10 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
