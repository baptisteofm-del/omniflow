'use client'
import { Clock, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export interface ScheduledPost {
  id: string
  contentName: string
  caption: string
  platforms: string[]
  scheduledAt: string
  status: 'pending' | 'posted' | 'failed'
  error?: string
}

interface PostCardProps {
  post: ScheduledPost
  onDelete?: (id: string) => void
}

const platformEmojis: { [key: string]: string } = {
  instagram: '📷',
  tiktok: '🎵',
  telegram: '📱',
  twitter: '𝕏',
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const handleDelete = () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post programmé?')) return

    toast.promise(
      Promise.resolve(),
      {
        loading: 'Suppression...',
        success: 'Post supprimé',
        error: 'Erreur lors de la suppression',
      }
    )

    if (onDelete) {
      onDelete(post.id)
    }
  }

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    posted: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    failed: <AlertCircle className="w-4 h-4 text-red-400" />,
  }

  const statusLabels = {
    pending: 'En attente',
    posted: 'Posté',
    failed: 'Erreur',
  }

  const isOverdue = new Date(post.scheduledAt) < new Date() && post.status === 'pending'

  return (
    <div className={`glass rounded-xl p-4 border transition-all ${
      isOverdue ? 'border-yellow-500/50' : 'border-white/5'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium truncate">{post.contentName}</p>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{post.caption}</p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {statusIcons[post.status]}
          <span className="text-xs font-medium">{statusLabels[post.status]}</span>
        </div>
      </div>

      {/* Platforms */}
      <div className="flex items-center gap-2 mb-3">
        {post.platforms.map((platform) => (
          <span
            key={platform}
            className="px-2 py-1 rounded-full bg-white/5 text-xs font-medium"
            title={platform}
          >
            {platformEmojis[platform] || platform.slice(0, 1).toUpperCase()}
          </span>
        ))}
      </div>

      {/* Time */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(post.scheduledAt).toLocaleDateString('fr-FR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {post.status === 'pending' && (
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Error */}
      {post.error && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-xs text-red-300">{post.error}</p>
        </div>
      )}
    </div>
  )
}
