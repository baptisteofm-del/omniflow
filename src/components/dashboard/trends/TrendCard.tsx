'use client'

import {
  ExternalLink, Sparkles, Play, Film, Heart, Eye,
  ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck,
  TrendingUp, Zap, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrendCardProps {
  id: string
  platform: string
  title: string
  engagement: number
  likes?: number
  postDate?: string
  category: string
  url: string
  thumbnailUrl?: string
  videoUrl?: string
  authorUsername?: string
  authorUrl?: string
  contentType: string
  capturedAt: Date | string
  isTopTrend?: boolean
  userFeedback?: 'like' | 'dislike' | null
  onFeedback?: (id: string, feedback: 'like' | 'dislike' | null) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

/** Virality score 0-100 based on engagement */
function viralScore(engagement: number): number {
  if (engagement >= 10_000_000) return 100
  if (engagement >= 5_000_000)  return 90
  if (engagement >= 1_000_000)  return 75
  if (engagement >= 500_000)    return 60
  if (engagement >= 100_000)    return 45
  if (engagement >= 10_000)     return 30
  return 15
}

/** Static viral insight based on engagement + category */
function getViralInsight(engagement: number, category: string, contentType: string): string {
  const isReel = contentType === 'reel' || contentType === 'video'
  if (engagement > 5_000_000)  return "Contenu ultra-viral — storytelling émotionnel + partages massifs"
  if (engagement > 1_000_000)  return "Fort engagement — format accrocheur et message universel"
  const insights: Record<string, string> = {
    fitness:    isReel ? "Transformation physique en Reel — format le plus partagé en fitness" : "Résultat visible → forte identification et partage",
    beauty:     isReel ? "Tutoriel beauté étape par étape — très recherché et sauvegardé" : "Résultat maquillage — fort taux de sauvegarde",
    lifestyle:  "Mode de vie aspirationnel — contenu que l'audience veut s'approprier",
    fashion:    "Outfit reveal ou haul — très fort taux de sauvegarde",
    wellness:   "Contenu bien-être calme — partagé comme conseil de vie",
    travel:     "Destination de rêve — engendre curiosité et jalousie constructive",
    dance:      "Chorégraphie tendance — forte invitation à reproduire",
    glamour:    "Esthétique premium — aspiration + fascination = fort engagement",
    motivation: "Message fort court — partagé massivement comme inspiration",
  }
  return insights[category] || (isReel ? "Format Reel performant — format privilégié par l'algorithme Instagram" : "Contenu visuel fort — performance naturelle dans le feed")
}

function isVideoContent(contentType: string): boolean {
  return ['reel', 'video'].includes(contentType?.toLowerCase())
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrendCard({
  id, platform, title, engagement, likes, category,
  url, thumbnailUrl, videoUrl, authorUsername, authorUrl, contentType,
  capturedAt, isTopTrend = false,
  userFeedback: initialFeedback = null,
  onFeedback,
}: TrendCardProps) {
  const [feedback, setFeedback]       = useState<'like' | 'dislike' | null>(initialFeedback)
  const [saved, setSaved]             = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [videoError, setVideoError]   = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isVideo   = isVideoContent(contentType)
  const score     = viralScore(engagement)
  const insight   = getViralInsight(engagement, category, contentType)
  const genLink   = `/content/ai-generation?trend=${encodeURIComponent(title ?? '')}&category=${category}`

  // ── Feedback ──────────────────────────────────────────────────────────────
  const handleFeedback = useCallback(async (next: 'like' | 'dislike') => {
    if (submitting) return
    const newFeedback = feedback === next ? null : next
    const prev = feedback
    setFeedback(newFeedback)
    setSubmitting(true)
    try {
      await fetch('/api/trends/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendId: id, feedback: newFeedback }),
      })
      onFeedback?.(id, newFeedback)
      if (newFeedback === 'like') toast.success('Trend aimé 👍')
      else if (newFeedback === 'dislike') toast('Trend ignoré 👎')
    } catch {
      setFeedback(prev)
      toast.error('Erreur feedback')
    } finally {
      setSubmitting(false)
    }
  }, [id, feedback, submitting, onFeedback])

  // ── Video play toggle ─────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => setVideoError(true))
      setVideoPlaying(true)
    } else {
      videoRef.current.pause()
      setVideoPlaying(false)
    }
  }, [])

  // ── Virality bar color ────────────────────────────────────────────────────
  const barColor =
    score >= 80 ? 'from-red-500 to-orange-400' :
    score >= 60 ? 'from-orange-400 to-yellow-400' :
    score >= 40 ? 'from-yellow-400 to-green-400' :
    'from-blue-400 to-cyan-400'

  return (
    <div className={cn(
      'group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl bg-[#13131f]',
      isTopTrend ? 'border-pink-500/30 shadow-lg shadow-pink-500/10' : 'border-white/8',
      feedback === 'like' && 'border-green-500/30',
      feedback === 'dislike' && 'opacity-60',
    )}>

      {/* ── Media area ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d0d18] flex-shrink-0">

        {/* Video player */}
        {isVideo && videoUrl && !videoError ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumbnailUrl}
              preload="metadata"
              playsInline
              muted
              loop
              onError={() => setVideoError(true)}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              className="w-full h-full object-cover"
            />
            {/* Play/pause overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center group/play"
              aria-label={videoPlaying ? 'Pause' : 'Play'}
            >
              <div className={cn(
                'w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all',
                videoPlaying
                  ? 'opacity-0 group-hover/play:opacity-100 scale-90'
                  : 'opacity-80 group-hover/play:opacity-100 group-hover/play:scale-105'
              )}>
                {videoPlaying
                  ? <div className="flex gap-1"><div className="w-1 h-4 bg-white rounded-full" /><div className="w-1 h-4 bg-white rounded-full" /></div>
                  : <Play size={20} className="text-white fill-white ml-1" />
                }
              </div>
            </button>
          </>
        ) : (
          /* Thumbnail / fallback */
          <>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                loading="lazy"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
                <Film size={32} className="text-gray-600" />
                <span className="text-xs text-gray-600 uppercase tracking-widest">Reel Instagram</span>
              </div>
            )}
            {/* Play overlay → opens Instagram */}
            {isVideo && (
              <a
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center group/play"
                title="Voir sur Instagram"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-70 group-hover/play:opacity-100 group-hover/play:scale-110 transition-all">
                  <Play size={20} className="text-white fill-white ml-1" />
                </div>
              </a>
            )}
          </>
        )}

        {/* ── Badges ─────────────────────────────────────────────────────── */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 pointer-events-none">
          {/* Content type badge */}
          <span className={cn(
            'px-2 py-0.5 rounded-md text-xs font-bold tracking-wide flex items-center gap-1',
            isVideo ? 'bg-pink-500/90 text-white' : 'bg-white/20 backdrop-blur-sm text-white'
          )}>
            <Film size={9} />
            {contentType?.toUpperCase() === 'REEL' ? 'REEL' : contentType?.toUpperCase() || 'REEL'}
          </span>
          {/* Viral score badge */}
          {score >= 75 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-400 rounded-md text-xs font-bold text-white flex items-center gap-1">
              <Zap size={9} />
              VIRAL
            </span>
          )}
        </div>

        {isTopTrend && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-md text-xs font-bold pointer-events-none">
            🔥 TOP
          </div>
        )}

        {/* ── Hover action bar ────────────────────────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <a href={url || '#'} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/25 transition-colors">
            <ExternalLink size={11} />Voir sur Instagram
          </a>
          <Link href={genLink}
            className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
            <Sparkles size={11} />Créer similaire
          </Link>
        </div>
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Author */}
        {authorUsername && (
          <a href={authorUrl || `https://instagram.com/${authorUsername}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity w-fit">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {authorUsername.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-pink-400 truncate">@{authorUsername.replace('@', '')}</span>
          </a>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-white leading-snug line-clamp-2 flex-1">
          {title || 'Sans titre'}
        </p>

        {/* ── Virality section ─────────────────────────────────────────── */}
        <div className="space-y-2 py-2 border-t border-b border-white/5">
          {/* Score bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <TrendingUp size={10} /> Score viral
              </span>
              <span className="text-xs font-bold text-white">{score}%</span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r transition-all', barColor)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={11} className="text-gray-600" />
              <span className="text-gray-300 font-semibold">{fmtNum(engagement)}</span>
              <span className="text-gray-600">vues</span>
            </span>
            {likes && likes > 0 && (
              <span className="flex items-center gap-1">
                <Heart size={10} className="text-pink-600 fill-pink-600" />
                <span className="text-gray-300 font-semibold">{fmtNum(likes)}</span>
              </span>
            )}
          </div>

          {/* Viral insight */}
          <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-white/4 border border-white/6">
            <AlertCircle size={11} className="text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">{insight}</p>
          </div>
        </div>

        {/* ── Action footer ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          {/* Save */}
          <button
            onClick={() => { setSaved(s => !s); if (!saved) toast.success('Trend sauvegardée') }}
            title={saved ? 'Sauvegardée' : 'Sauvegarder'}
            className={cn(
              'p-2 rounded-xl transition-all',
              saved
                ? 'bg-purple-500/30 text-purple-300'
                : 'bg-white/5 text-gray-500 hover:bg-purple-500/20 hover:text-purple-300'
            )}
          >
            {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>

          {/* Feedback like */}
          <button
            onClick={() => handleFeedback('like')}
            disabled={submitting}
            title="Pertinent"
            className={cn(
              'p-2 rounded-xl transition-all',
              feedback === 'like'
                ? 'bg-green-500/25 text-green-400'
                : 'bg-white/5 text-gray-500 hover:bg-green-500/15 hover:text-green-400'
            )}
          >
            <ThumbsUp size={13} />
          </button>

          {/* Feedback dislike */}
          <button
            onClick={() => handleFeedback('dislike')}
            disabled={submitting}
            title="Pas pertinent"
            className={cn(
              'p-2 rounded-xl transition-all',
              feedback === 'dislike'
                ? 'bg-red-500/25 text-red-400'
                : 'bg-white/5 text-gray-500 hover:bg-red-500/15 hover:text-red-400'
            )}
          >
            <ThumbsDown size={13} />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Open Instagram */}
          <a href={url || '#'} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/12 transition-colors text-gray-400 hover:text-white"
            title="Voir sur Instagram"
          >
            <ExternalLink size={13} />
          </a>

          {/* Generate */}
          <Link href={genLink}
            className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 transition-colors text-purple-400"
            title="Utiliser comme inspiration"
          >
            <Sparkles size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
