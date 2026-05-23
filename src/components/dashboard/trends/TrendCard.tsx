'use client'
import { ExternalLink, Sparkles, Play, TrendingUp, Image as ImageIcon, FileText, Film, Music, Layers } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TrendCardProps {
  id: string
  platform: string
  title: string
  engagement: number
  category: string
  url: string
  thumbnailUrl?: string
  authorUsername?: string
  authorUrl?: string
  contentType: string
  capturedAt: Date | string
  isTopTrend?: boolean
}

const PLATFORM_CONFIG: Record<string, { label: string; gradient: string; badge: string; text: string; border: string }> = {
  tiktok: {
    label: 'TikTok',
    gradient: 'from-gray-900 to-black',
    badge: 'bg-white text-black',
    text: 'text-white',
    border: 'border-white/10',
  },
  instagram: {
    label: 'Instagram',
    gradient: 'from-purple-900/40 via-pink-900/30 to-orange-900/20',
    badge: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    text: 'text-pink-400',
    border: 'border-pink-500/20',
  },
  reddit: {
    label: 'Reddit',
    gradient: 'from-orange-900/30 to-red-900/20',
    badge: 'bg-orange-600 text-white',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
  },
  youtube: {
    label: 'YouTube',
    gradient: 'from-red-900/30 to-red-950/20',
    badge: 'bg-red-600 text-white',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
}

const CONTENT_TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  video:    { icon: Film,      label: 'Vidéo',    color: 'bg-blue-500/80' },
  reel:     { icon: Film,      label: 'Reel',     color: 'bg-purple-500/80' },
  photo:    { icon: ImageIcon, label: 'Photo',    color: 'bg-cyan-500/80' },
  carousel: { icon: Layers,    label: 'Carousel', color: 'bg-indigo-500/80' },
  text:     { icon: FileText,  label: 'Texte',    color: 'bg-gray-500/80' },
}

function formatEngagement(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return '—'
  const diffMs = Date.now() - date.getTime()
  const mins  = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days  = Math.floor(diffMs / 86400000)
  if (mins  < 60) return `il y a ${mins}min`
  if (hours < 24) return `il y a ${hours}h`
  if (days  < 7)  return `il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
}

export function TrendCard({ id, platform, title, engagement, category, url, thumbnailUrl, authorUsername, authorUrl, contentType, capturedAt, isTopTrend = false }: TrendCardProps) {
  const config = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.tiktok
  const ctConfig = CONTENT_TYPE_CONFIG[contentType] ?? CONTENT_TYPE_CONFIG.video
  const CtIcon = ctConfig.icon
  const isMedia = contentType !== 'text'
  const generateLink = `/content/ai-generation?trend=${encodeURIComponent(title ?? '')}&platform=${platform}&category=${category}`

  return (
    <div className={cn(
      'group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border bg-gradient-to-br backdrop-blur-md',
      isTopTrend
        ? 'ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/20 border-purple-500/30 from-purple-950/40 to-black/50'
        : `${config.border} from-gray-950/60 to-black/60`
    )}>

      {/* Thumbnail */}
      <div className={cn('aspect-video relative overflow-hidden bg-gradient-to-br', config.gradient)}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
            <Film size={32} />
            <span className="text-xs font-medium uppercase tracking-widest opacity-60">{config.label}</span>
          </div>
        )}

        {/* Play overlay */}
        {isMedia && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={24} className="text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={cn('px-2 py-1 rounded-md text-xs font-bold tracking-wide', config.badge)}>
            {config.label.toUpperCase()}
          </span>
          <span className={cn('px-2 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1', ctConfig.color)}>
            <CtIcon size={10} />
            {ctConfig.label}
          </span>
        </div>

        {isTopTrend && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-md text-xs font-bold flex items-center gap-1">
            <TrendingUp size={10} />
            TOP
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 gap-2">
          <a href={url || '#'} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors">
            <ExternalLink size={13} />Voir
          </a>
          {isMedia && (
            <Link href={generateLink}
              className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
              <Sparkles size={13} />Générer
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Author */}
        {authorUsername ? (
          <a href={authorUrl || '#'} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {authorUsername.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-cyan-400 truncate">@{authorUsername}</span>
          </a>
        ) : (
          <div className="h-7" />
        )}

        {/* Title */}
        <h3 className="text-xs font-semibold line-clamp-2 text-white leading-snug group-hover:text-cyan-100 transition-colors">
          {title || 'Sans titre'}
        </h3>

        {/* Engagement + Date */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/8 text-gray-300">
            {formatEngagement(engagement || 0)} vues
          </span>
          <span className="text-xs text-gray-600">{formatDate(capturedAt)}</span>
        </div>

        {/* Category + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500 capitalize">#{category}</span>
          <div className="flex gap-1.5">
            <a href={url || '#'} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors">
              <ExternalLink size={12} className="text-gray-400" />
            </a>
            {isMedia && (
              <Link href={generateLink}
                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 transition-colors">
                <Sparkles size={12} className="text-purple-400" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
