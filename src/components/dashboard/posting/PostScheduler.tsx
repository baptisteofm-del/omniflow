'use client'
import { useState } from 'react'
import { Calendar, Clock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostSchedulerProps {
  onPostScheduled?: () => void
}

export function PostScheduler({ onPostScheduled }: PostSchedulerProps) {
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('12:00')
  const [caption, setCaption] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedContent, setSelectedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'telegram', label: 'Telegram', icon: '📱' },
  ]

  const mockContent = [
    { id: '1', name: 'Video_spoofed_2024.mp4', type: 'video' },
    { id: '2', name: 'Gen_AI_abstract_neon.mp4', type: 'video' },
    { id: '3', name: 'Trending_clip.mp4', type: 'video' },
  ]

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!scheduledDate || !caption || selectedPlatforms.length === 0 || !selectedContent) {
      toast.error('Remplissez tous les champs requis')
      return
    }

    setIsLoading(true)

    try {
      const scheduledDateTime = new Date(
        `${scheduledDate}T${scheduledTime}`
      ).toISOString()

      const response = await fetch('/api/posting/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: selectedContent,
          platforms: selectedPlatforms,
          caption: caption,
          scheduledAt: scheduledDateTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Scheduling failed')
      }

      toast.success('Post programmé avec succès!')
      setScheduledDate('')
      setScheduledTime('12:00')
      setCaption('')
      setSelectedPlatforms([])
      setSelectedContent('')

      if (onPostScheduled) {
        onPostScheduled()
      }
    } catch (error) {
      console.error('Scheduling error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la programmation'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      {/* Content selection */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Contenu à poster
        </label>
        <select
          value={selectedContent}
          onChange={(e) => setSelectedContent(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm text-white"
        >
          <option value="">-- Sélectionnez un contenu --</option>
          {mockContent.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Description du post
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Écrivez une description attrayante..."
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm resize-none h-20"
          maxLength={2200}
        />
        <p className="text-xs text-gray-500 mt-1">{caption.length}/2200</p>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Date
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Heure
          </label>
          <div className="relative">
            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Plateformes
        </label>
        <div className="grid grid-cols-3 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`p-3 rounded-lg transition-all text-center ${
                selectedPlatforms.includes(platform.id)
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-xl mb-1">{platform.icon}</div>
              <p className="text-xs font-medium">{platform.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
      >
        {isLoading ? (
          'Programmation...'
        ) : (
          <>
            <Sparkles size={18} />
            Programmer le post
          </>
        )}
      </button>
    </form>
  )
}
