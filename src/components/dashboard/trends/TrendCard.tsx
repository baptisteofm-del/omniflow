'use client'
import { ExternalLink, Sparkles, Play, Film, Image as ImageIcon, FileText, Layers, Heart, Eye, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

interface TrendCardProps {
  id: string
  platform: string
  title: string
  engagement: number
  likes?: number
  postDate?: string
  category: string
  url: string
  thumbnailUrl?: string
  authorUsername?: string
  authorUrl?: string
  contentType: string
  capturedAt: Date | string
  isTopTrend?: boolean
  userFeedback?: 'like' | 'dislike' | null
  onFeedback?: (id: string, feedback: 'like' | 'dislike' | null) => void
}

const PLATFORM_CONFIG: Record<string, { label: string; gradient: string; badge: string; border: string }> = {
  instagram: {
    label: 'Instagram',
    gradient: 'from-purple-900/40 via-pink-900/30 to-orange-900/20',
    badge: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    border: 'border-pink-500/20',
  },
  // Fallback
  tiktok:    { label: 'TikTok',    gradient: 'from-gray-900 to-black',          badge: 'bg-white text-black',     border: 'border-white/10' },
  reddit:    { label: 'Reddit',    gradient: 'from-orange-900/30 to-red-900/20', badge: 'bg-orange-600 text-white', border: 'border-orange-500/20' },
}

const CONTENT_TYPE_CONFIG: Record<string, { icon: any; label: string; color: string; isVideo: boolean }> = {
  video:    { icon: Film,      label: 'Vidéo',    color: 'bg-blue-500/80',   isVideo: true  },
  reel:     { icon: Film,      label: 'Reel',     color: 'bg-purple-500/80', isVideo: true  },
  photo:    { icon: ImageIcon, label: 'Photo',    color: 'bg-cyan-500/80',   isVideo: false },
  carousel: { icon: Layers,    label: 'Carousel', color: 'bg-indigo-500/80', isVideo: false },
  text:     { icon: FileText,  label: 'Texte',    color: 'bg-gray-500/80',   isVideo: false },
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function fmtRelative(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 60) return `il y a ${mins}min`
  if (hours < 24) return `il y a ${hours}h`
  if (days  < 7)  return `il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
}

function fmtDate(d?: string): string {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function TrendCard({
  id, platform, title, engagement, likes, postDate, category,
  url, thumbnailUrl, authorUsername, authorUrl, contentType,
  capturedAt, isTopTrend = false,
  userFeedback: initialFeedback = null,
  onFeedback,
}: TrendCardProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(initialFeedback)
  const [submitting, setSubmitting] = useState(false)

  const config   = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.instagram
  const ctConfig = CONTENT_TYPE_CONFIG[contentType] ?? CONTENT_TYPE_CONFIG.photo
  const CtIcon   = ctConfig.icon
  const isMedia  = contentType !== 'text'
  const isVideoContent = ctConfig.isVideo
  const generateLink = `/content/ai-generation?trend=${encodeURIComponent(title ?? '')}&platform=${platform}&category=${category}`

  const handleFeedback = useCallback(async (newFeedback: 'like' | 'dislike') => {
    if (submitting) return

    // Toggle : si déjà le même feedback, on annule
    const next = feedback === newFeedback ? null : newFeedback
    const prev = feedback
    setFeedback(next)
    setSubmitting(true)

    try {
      const res = await fetch('/api/trends/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendId: id, feedback: next }),
      })
      if (!res.ok) throw new Error()

      onFeedback?.(id, next)

      if (next === 'like') toast.success('Trend aimé — vos suggestions s\'adaptent 👍')
      else if (next === 'dislike') toast.success('Trend ignoré — compris 👎')
    } catch {
      // Rollback
      setFeedback(prev)
      toast.error('Erreur lors de l\'enregistrement du feedback')
    } finally {
      setSubmitting(false)
    }
  }, [id, feedback, submitting, onFeedback])

  return (
    <div className={cn(
      'group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border bg-gradient-to-br backdrop-blur-md',
      isTopTrend
        ? 'ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/20 border-purple-500/30 from-purple-950/40 to-black/50'
        : `${config.border} from-gray-950/60 to-black/60`,
      feedback === 'like'    && 'ring-1 ring-green-500/40',
      feedback === 'dislike' && 'opacity-70',
    )}>

      {/* Thumbnail */}
      <div className={cn('aspect-video relative overflow-hidden bg-gradient-to-br', config.gradient)}>
        {thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).parentElement?.classList.add('img-failed') }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="hidden [.img-failed_&]:flex w-full h-full items-center justify-center flex-col gap-2 text-gray-700 absolute inset-0">
              {isVideoContent ? <Film size={28} className="text-gray-600" /> : <ImageIcon size={28} className="text-gray-600" />}
              <span className="text-xs text-gray-600 uppercase tracking-widest">Instagram</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {isVideoContent
              ? <Film size={32} className="text-gray-600" />
              : <ImageIcon size={32} className="text-gray-600" />}
            <span className="text-xs text-gray-700 uppercase tracking-widest font-medium">Instagram</span>
          </div>
        )}

        {/* Play indicator */}
        {isVideoContent && thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-60 group-hover:opacity-0 transition-opacity">
              <Play size={16} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Play overlay hover */}
        {isMedia && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <Play size={20} className="text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={cn('px-2 py-1 rounded-md text-xs font-bold tracking-wide', config.badge)}>
            INSTAGRAM
          </span>
          <span className={cn('px-2 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1', ctConfig.color)}>
            <CtIcon size={10} />{ctConfig.label}
          </span>
        </div>

        {isTopTrend && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-md text-xs font-bold">
            TOP
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 gap-2">
          <a href={url || '#'} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors">
            <ExternalLink size={12} />Voir
          </a>
          {isMedia && (
            <Link href={generateLink}
              className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90">
              <Sparkles size={12} />Générer
            </Link>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-3.5 space-y-2.5">
        {/* Author */}
        {authorUsername ? (
          <a href={authorUrl || '#'} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {authorUsername.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-pink-400 truncate">@{authorUsername}</span>
          </a>
        ) : <div className="h-6" />}

        {/* Title */}
        <h3 className="text-xs font-semibold line-clamp-2 text-white leading-snug">{title || 'Sans titre'}</h3>

        {/* Metrics */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Eye size={11} className="text-gray-600" />
            <span className="text-gray-300 font-medium">{fmtNum(engagement || 0)}</span>
          </span>
          {likes !== undefined && likes > 0 && (
            <span className="flex items-center gap-1">
              <Heart size={11} className="text-pink-600" />
              <span className="text-gray-300 font-medium">{fmtNum(likes)}</span>
            </span>
          )}
          {postDate && (
            <span className="flex items-center gap-1 ml-auto">
              <Calendar size={10} className="text-gray-600" />
              <span className="text-gray-600">{fmtDate(postDate)}</span>
            </span>
          )}
        </div>

        {/* Footer : catégorie + date + feedback */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 capitalize">#{category}</span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-xs text-gray-700">{fmtRelative(capturedAt)}</span>
          </div>

          {/* Feedback like/dislike */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback('like')}
              disabled={submitting}
              title="J'aime ce type de contenu"
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                feedback === 'like'
                  ? 'bg-green-500/30 text-green-400'
                  : 'bg-white/5 text-gray-500 hover:bg-green-500/20 hover:text-green-400',
                submitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ThumbsUp size={11} />
            </button>
            <button
              onClick={() => handleFeedback('dislike')}
              disabled={submitting}
              title="Moins de ce type de contenu"
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                feedback === 'dislike'
                  ? 'bg-red-500/30 text-red-400'
                  : 'bg-white/5 text-gray-500 hover:bg-red-500/20 hover:text-red-400',
                submitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ThumbsDown size={11} />
            </button>
            <a href={url || '#'} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-colors">
              <ExternalLink size={11} className="text-gray-400" />
            </a>
            {isMedia && (
              <Link href={generateLink}
                className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 transition-colors">
                <Sparkles size={11} className="text-purple-400" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
