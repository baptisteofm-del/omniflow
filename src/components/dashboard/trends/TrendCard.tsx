'use client'
import { ExternalLink, Sparkles, Play, ImageIcon, Type, Film } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TrendCardProps {
  id: string
  platform: 'tiktok' | 'instagram' | 'reddit' | 'youtube'
  title: string
  engagement: number
  category: string
  url: string
  thumbnailUrl?: string
  authorUsername?: string
  authorUrl?: string
  contentType: 'video' | 'photo' | 'text' | 'reel' | 'carousel'
  capturedAt: Date
  isTopTrend?: boolean
}

const platformConfig = {
  tiktok: {
    color: 'from-black to-gray-900',
    badgeColor: 'bg-gradient-to-r from-pink-500 to-white text-black',
    accentColor: 'text-white',
    borderColor: 'border-white/10',
    icon: '🎵',
    label: 'TikTok',
  },
  instagram: {
    color: 'from-purple-600/30 via-pink-600/20 to-orange-500/20',
    badgeColor: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    icon: '📷',
    label: 'Instagram',
  },
  reddit: {
    color: 'from-orange-600/30 to-red-600/20',
    badgeColor: 'bg-orange-600 text-white',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    icon: '🔥',
    label: 'Reddit',
  },
  youtube: {
    color: 'from-red-600/30 to-red-800/20',
    badgeColor: 'bg-red-600 text-white',
    accentColor: 'text-red-400',
    borderColor: 'border-red-500/20',
    icon: '▶️',
    label: 'YouTube',
  },
}

const contentTypeConfig = {
  video: { icon: '🎬', label: 'Vidéo', color: 'bg-blue-500/80' },
  reel: { icon: '🎞️', label: 'Reel', color: 'bg-purple-500/80' },
  photo: { icon: '📸', label: 'Photo', color: 'bg-cyan-500/80' },
  carousel: { icon: '📹', label: 'Carousel', color: 'bg-indigo-500/80' },
  text: { icon: '📝', label: 'Texte', color: 'bg-gray-500/80' },
}

function formatEngagement(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `il y a ${diffMins}min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays < 7) return `il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
  })
}

function shouldShowGenerateButton(contentType: string): boolean {
  return contentType !== 'text'
}

export function TrendCard({
  id,
  platform,
  title,
  engagement,
  category,
  url,
  thumbnailUrl,
  authorUsername,
  authorUrl,
  contentType,
  capturedAt,
  isTopTrend = false,
}: TrendCardProps) {
  const config = platformConfig[platform]
  const contentConfig = contentTypeConfig[contentType as keyof typeof contentTypeConfig]
  const canGenerate = shouldShowGenerateButton(contentType)

  const generateLink = `/content/ai-generation?trend=${encodeURIComponent(title)}&platform=${platform}&category=${category}`

  return (
    <div
      className={cn(
        'group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        'border bg-gradient-to-br backdrop-blur-md',
        isTopTrend
          ? 'ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/30 border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-black/40'
          : `${config.borderColor} bg-gradient-to-br from-gray-950/60 to-black/60`
      )}
      data-tutorial="trend-card"
    >
      {/* Animated border for top trends */}
      {isTopTrend && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, #a78bfa, #06b6d4, #ec4899)',
            borderRadius: '0.75rem',
            padding: '2px',
            WebKitMaskImage:
              'linear-gradient(to right, black, transparent, black)',
          }}
        />
      )}

      {/* Large Thumbnail/Preview - 16:9 aspect ratio */}
      <div
        className={cn(
          'aspect-video bg-gradient-to-br relative overflow-hidden flex items-center justify-center',
          `${config.color}`,
          'group-hover:brightness-125 transition-all duration-300'
        )}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-gray-400 transition-colors">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {config.icon}
            </span>
            <span className="text-sm uppercase tracking-wider opacity-70 font-medium">
              {config.label}
            </span>
          </div>
        )}

        {/* Overlay with play icon for videos */}
        {(contentType === 'video' || contentType === 'reel') && (
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center">
              <Play size={32} className="text-white fill-white" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {/* Platform Badge */}
          <div
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold',
              config.badgeColor,
              'backdrop-blur-md shadow-lg'
            )}
          >
            {platform.toUpperCase()}
          </div>

          {/* Content Type Badge */}
          <div
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white',
              contentConfig.color,
              'backdrop-blur-md shadow-lg'
            )}
          >
            {contentConfig.icon} {contentConfig.label}
          </div>
        </div>

        {/* Top Trend Badge */}
        {isTopTrend && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
            🔥 TRENDING
          </div>
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 mr-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all shadow-lg flex items-center justify-center gap-2 text-white font-medium text-sm"
            title="View source"
          >
            <ExternalLink size={16} />
            Voir
          </a>
          {canGenerate && (
            <Link
              href={generateLink}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2 text-white font-semibold text-sm"
              title="Generate with AI"
              data-tutorial="trend-ai-generate"
            >
              <Sparkles size={16} />
              Générer
            </Link>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Author Info */}
        {authorUsername && authorUrl ? (
          <a
            href={authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group/author hover:opacity-70 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {authorUsername.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-cyan-300 group-hover/author:text-cyan-200">
              @{authorUsername}
            </span>
          </a>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
              ?
            </div>
            <span className="text-sm text-gray-400">Unknown creator</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-bold line-clamp-2 text-white group-hover:text-cyan-200 transition-colors leading-snug">
          {title}
        </h3>

        {/* Engagement & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white">
              📊 {formatEngagement(engagement)}
            </span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(capturedAt)}</span>
        </div>

        {/* Category Tag */}
        <div>
          <span
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 border transition-all',
              config.borderColor,
              'text-gray-300 group-hover:text-white group-hover:bg-white/20'
            )}
          >
            #{category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-md"
          >
            <ExternalLink size={14} />
            Voir le post
          </a>
          {canGenerate && (
            <Link
              href={generateLink}
              className="flex-1 px-3 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white transition-all flex items-center justify-center gap-1 shadow-md"
            >
              <Sparkles size={14} />
              Générer IA
            </Link>
          )}
          {!canGenerate && (
            <div className="flex-1 px-3 py-2.5 text-xs font-semibold rounded-lg bg-gray-700/30 text-gray-500 flex items-center justify-center gap-1 cursor-not-allowed">
              <Type size={14} />
              Texte brut
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
