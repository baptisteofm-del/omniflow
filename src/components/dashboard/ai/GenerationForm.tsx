'use client'
import { useState } from 'react'
import { Sparkles, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface GenerationFormProps {
  onGenerationStart?: (id: string) => void
  selectedModelId?: string
  selectedTrendId?: string
}

export function GenerationForm({
  onGenerationStart,
  selectedModelId,
  selectedTrendId,
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [duration, setDuration] = useState('5')
  const [isLoading, setIsLoading] = useState(false)

  const styles = [
    { id: 'realistic', label: 'Réaliste' },
    { id: 'anime', label: 'Anime' },
    { id: 'cartoon', label: 'Cartoon' },
    { id: 'neon', label: 'Néon' },
    { id: 'cinematic', label: 'Cinématique' },
    { id: 'abstract', label: 'Abstrait' },
  ]

  const durations = [
    { value: '3', label: '3 secondes' },
    { value: '5', label: '5 secondes' },
    { value: '10', label: '10 secondes' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      toast.error('Entrez un prompt')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: style,
          duration: parseInt(duration),
          modelId: selectedModelId || null,
          trendId: selectedTrendId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      toast.success('Génération lancée!')
      setPrompt('')
      setStyle('realistic')
      setDuration('5')

      if (onGenerationStart) {
        onGenerationStart(data.data.id)
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la génération'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décrivez la vidéo que vous souhaitez générer..."
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm resize-none h-24"
        />
        <p className="text-xs text-gray-500 mt-1">
          {prompt.length}/500 caractères
        </p>
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {styles.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                style === s.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Durée
        </label>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                duration === d.value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {d.label}
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
          <>
            <Loader size={18} className="animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Générer une vidéo
          </>
        )}
      </button>
    </form>
  )
}
