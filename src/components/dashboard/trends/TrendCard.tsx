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
    borderColor: 'border-black/50',
    icon: '▶',
    engagementColor: 'text-white',
  },
  instagram: {
    color: 'from-pink-600/30 via-purple-600/20 to-orange-500/20',
    badgeColor: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    icon: '📷',
    engagementColor: 'text-pink-300',
  },
  twitter: {
    color: 'from-blue-600/30 to-cyan-600/20',
    badgeColor: 'bg-blue-500 text-white',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    icon: '𝕏',
    engagementColor: 'text-blue-300',
  },
  reddit: {
    color: 'from-orange-600/30 to-red-600/20',
    badgeColor: 'bg-orange-600 text-white',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    icon: '🔥',
    engagementColor: 'text-orange-300',
  },
}

function formatEngagement(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getEngagementBarColor(platform: string): string {
  const colors: Record<string, string> = {
    tiktok: 'bg-white',
    instagram: 'bg-pink-400',
    twitter: 'bg-blue-400',
    reddit: 'bg-orange-400',
  }
  return colors[platform] || 'bg-purple-400'
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
    <div 
      className={cn(
        'group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
        'border border-white/10 hover:border-purple-500/50 bg-white/5 backdrop-blur-md',
        isTopTrend && 'ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/20'
      )}
      data-tutorial="trend-card"
    >
      {/* Gradient border animation for top trends */}
      {isTopTrend && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-2xl p-0.5 -z-10 opacity-75 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(45deg, #a78bfa, #06b6d4, #ec4899)',
          }}
        ></div>
      )}

      {/* Thumbnail/Preview */}
      <div className={cn(
        'aspect-video bg-gradient-to-br relative overflow-hidden flex items-center justify-center',
        `${config.color}`,
        'group-hover:brightness-110 transition-all duration-300'
      )}>
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-white/60 transition-colors">
            <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{config.icon}</span>
            <span className="text-xs uppercase tracking-wider opacity-70">Trend</span>
          </div>
        )}

        {/* Platform badge */}
        <div className={cn(
          'absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold',
          config.badgeColor,
          'backdrop-blur-md shadow-lg'
        )}>
          {platform.toUpperCase()}
        </div>

        {/* Top trend badge */}
        {isTopTrend && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
            🔥 TRENDING
          </div>
        )}

        {/* Overlay hover actions */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/25 backdrop-blur-md rounded-full hover:bg-white/40 transition-all shadow-lg"
            title="View source"
          >
            <ExternalLink size={20} className="text-white" />
          </a>
          <Link 
            href={generateLink}
            className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg"
            title="Generate with AI"
            data-tutorial="trend-ai-generate"
          >
            <Sparkles size={20} className="text-white" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-semibold line-clamp-2 text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        {/* Engagement bar */}
        <div className="space-y-1.5">
          <div className={cn(
            'inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm',
            config.engagementColor
          )}>
            📊 {formatEngagement(engagement)}
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all duration-500',
                getEngagementBarColor(platform)
              )}
              style={{ width: `${Math.min((engagement / 6000000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Category tag */}
        <div>
          <span className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 border transition-all',
            config.borderColor,
            'text-gray-300 group-hover:text-white'
          )}>
            #{category}
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
            👁 Voir
          </a>
          <Link 
            href={generateLink}
            className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white transition-all flex items-center justify-center gap-1 shadow-md"
          >
            ✨ Générer
          </Link>
        </div>
      </div>
    </div>
  )
}
