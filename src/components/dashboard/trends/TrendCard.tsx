'use client'
import { ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TrendCardProps {
  id: string
  platform: 'tiktok' | 'instagram' | 'twitter' | 'reddit'
  title: string
  engagement: number
  category: string
  url: string
  thumbnailUrl?: string
  isTopTrend?: boolean
}

const platformConfig = {
  tiktok: {
    color: 'from-black to-gray-900',
    badgeColor: 'bg-black text-white',
    accentColor: 'text-white',
    icon: '▶',
  },
  instagram: {
    color: 'from-pink-600/20 to-purple-600/20',
    badgeColor: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    accentColor: 'text-pink-400',
    icon: '📷',
  },
  twitter: {
    color: 'from-blue-600/20 to-cyan-600/20',
    badgeColor: 'bg-blue-500 text-white',
    accentColor: 'text-blue-400',
    icon: '𝕏',
  },
  reddit: {
    color: 'from-orange-600/20 to-red-600/20',
    badgeColor: 'bg-orange-600 text-white',
    accentColor: 'text-orange-400',
    icon: '🔥',
  },
}

function formatEngagement(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function TrendCard({ 
  id, 
  platform, 
  title, 
  engagement, 
  category, 
  url,
  thumbnailUrl,
  isTopTrend = false
}: TrendCardProps) {
  const config = platformConfig[platform]
  const engagementText = platform === 'reddit' ? 'upvotes' : 'views'

  const generateLink = `/content/ai-generation?trend=${encodeURIComponent(title)}&platform=${platform}&category=${category}`

  return (
    <div className={cn(
      'group relative glass rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105',
      isTopTrend && 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20'
    )}>
      {/* Animated gradient border for top trends */}
      {isTopTrend && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 rounded-2xl p-0.5 -z-10 animate-pulse"></div>
      )}

      {/* Thumbnail/Preview */}
      <div className={cn(
        'aspect-video bg-gradient-to-br relative overflow-hidden flex items-center justify-center',
        `${config.color}`
      )}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-4xl">{config.icon}</span>
            <span className="text-xs uppercase tracking-wider opacity-70">Trend</span>
          </div>
        )}

        {/* Platform badge */}
        <div className={cn(
          'absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold',
          config.badgeColor,
          'backdrop-blur-sm'
        )}>
          {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </div>

        {/* Top trend star */}
        {isTopTrend && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/80 text-white rounded-lg text-xs font-bold flex items-center gap-1">
            ⭐ Top
          </div>
        )}

        {/* Overlay hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            title="View source"
          >
            <ExternalLink size={20} className="text-white" />
          </a>
          <Link 
            href={generateLink}
            className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full hover:opacity-90 transition-all"
            title="Generate with AI"
          >
            <Sparkles size={20} className="text-white" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-semibold line-clamp-2 text-white group-hover:text-purple-300 transition-colors">
          {title}
        </h3>

        {/* Engagement metric */}
        <div className={cn(
          'inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-sm',
          config.accentColor
        )}>
          📊 {formatEngagement(engagement)} {engagementText}
        </div>

        {/* Category tag */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 capitalize">
            {category}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1"
          >
            <ExternalLink size={13} />
            Voir
          </a>
          <Link 
            href={generateLink}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-600 hover:to-cyan-600 text-white transition-all flex items-center justify-center gap-1"
          >
            <Sparkles size={13} />
            Générer
          </Link>
        </div>
      </div>
    </div>
  )
}
