'use client'
import { cn } from '@/lib/utils/cn'

// ⚠️ Source unique : Instagram uniquement
// TrendFilters simplifié — filtre catégorie seulement

interface TrendFiltersProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function TrendFilters({
  categories,
  selectedCategory,
  onCategoryChange,
}: TrendFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Catégorie
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
              selectedCategory === null
                ? 'ring-2 ring-purple-500/80 shadow-lg shadow-purple-500/20 bg-gray-700'
                : 'border-white/10 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700'
            )}>
            Toutes
          </button>

          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(selectedCategory === category ? null : category)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border capitalize',
                selectedCategory === category
                  ? 'ring-2 ring-pink-500/80 shadow-lg shadow-pink-500/20 bg-pink-600/30'
                  : 'border-white/10 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700'
              )}>
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
