'use client'
import { Download, AlertCircle, Loader, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export interface Generation {
  id: string
  prompt: string
  style?: string
  duration?: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  videoUrl?: string
  thumbnail?: string
  error?: string
  createdAt: string
}

interface GenerationCardProps {
  generation: Generation
  onStatusUpdated?: (id: string, status: string) => void
}

export function GenerationCard({
  generation,
  onStatusUpdated,
}: GenerationCardProps) {
  const handleDownload = async () => {
    if (!generation.videoUrl) {
      toast.error('Video URL not available')
      return
    }

    try {
      const response = await fetch(generation.videoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generation_${generation.id}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Téléchargement démarré')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const statusColors = {
    pending: 'text-gray-400 bg-gray-500/10',
    processing: 'text-blue-400 bg-blue-500/10',
    completed: 'text-green-400 bg-green-500/10',
    error: 'text-red-400 bg-red-500/10',
  }

  const statusLabels = {
    pending: 'En attente',
    processing: 'Traitement...',
    completed: 'Terminée',
    error: 'Erreur',
  }

  const statusIcons = {
    pending: <Loader size={14} className="animate-spin" />,
    processing: <Loader size={14} className="animate-spin" />,
    completed: <CheckCircle2 size={14} />,
    error: <AlertCircle size={14} />,
  }

  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/50 overflow-hidden">
        {generation.thumbnail ? (
          <img
            src={generation.thumbnail}
            alt={generation.prompt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {generation.status === 'completed' ? (
              <CheckCircle2 className="text-green-400" size={32} />
            ) : generation.status === 'error' ? (
              <AlertCircle className="text-red-400" size={32} />
            ) : (
              <Loader className="text-blue-400 animate-spin" size={32} />
            )}
          </div>
        )}

        {/* Status badge */}
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-medium ${statusColors[generation.status]} flex items-center gap-1`}
        >
          {statusIcons[generation.status]}
          {statusLabels[generation.status]}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Prompt */}
        <div>
          <p className="text-sm font-medium line-clamp-2 text-white">
            {generation.prompt}
          </p>
          {generation.style && (
            <p className="text-xs text-gray-500 mt-1">Style: {generation.style}</p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {generation.duration || 5}s video
          </span>
          <span>
            {new Date(generation.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Error message */}
        {generation.error && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-xs text-red-300">{generation.error}</p>
          </div>
        )}

        {/* Actions */}
        {generation.status === 'completed' && generation.videoUrl && (
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-sm font-medium"
          >
            <Download size={14} />
            Télécharger
          </button>
        )}
      </div>
    </div>
  )
}
