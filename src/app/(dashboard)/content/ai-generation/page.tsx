'use client'
import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Play, Download, Clock, CheckCircle2, XCircle, Loader2, Zap, Film } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'
import { generatePromptFromTrend } from '@/lib/trends/fetcher'
import { useUsage } from '@/lib/hooks/useUsage'
import { FeatureGate } from '@/components/ui/FeatureGate'

interface Generation {
  taskId: string
  status: 'submitted' | 'processing' | 'succeed' | 'failed'
  videoUrl?: string
  coverUrl?: string
  prompt: string
  createdAt: number
}

const styles = [
  { id: 'realistic', label: 'Réaliste', desc: 'Photo-réaliste, qualité cinéma' },
  { id: 'cinematic', label: 'Cinématique', desc: 'Style film professionnel' },
  { id: 'aesthetic', label: 'Aesthetic', desc: 'Tendance IG/TikTok' },
  { id: 'glamour', label: 'Glamour', desc: 'Style luxe et élégance' },
]

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string; spin?: boolean }> = {
  submitted: { icon: Clock, color: 'text-yellow-400', label: 'En file...' },
  processing: { icon: Loader2, color: 'text-blue-400', label: 'Génération...', spin: true },
  succeed: { icon: CheckCircle2, color: 'text-green-400', label: 'Prête' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Échouée' },
}

export default function AIGenerationPage() {
  const { planId, loading: planLoading } = useUsage()
  const searchParams = useSearchParams()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)
  const [trendSource, setTrendSource] = useState<{ title: string; platform: string; category: string } | null>(null)
  const [form, setForm] = useState({
    prompt: '',
    negativePrompt: '',
    duration: '5',
    aspectRatio: '9:16',
    model: 'kling-v1-5',
  })

  // Pré-remplir depuis un trend si les params sont présents
  useEffect(() => {
    const trendTitle = searchParams?.get('trend')
    const platform = searchParams?.get('platform')
    const category = searchParams?.get('category')

    if (trendTitle && platform && category) {
      setTrendSource({ title: trendTitle, platform, category })
      
      // Générer un prompt basé sur le trend
      const categoryPrompts: Record<string, string> = {
        fitness: 'showing an effective workout or body transformation moment',
        beauty: 'showcasing a makeup transformation or skincare routine',
        lifestyle: 'depicting a luxurious or aspirational lifestyle moment',
        fashion: 'displaying high-end fashion styling or a clothing haul',
        wellness: 'capturing a peaceful wellness or meditation moment',
        glamour: 'presenting a glamorous and elegant styled moment',
        dance: 'choreography and dancing in a trendy style',
        travel: 'showcasing a beautiful travel destination',
        music: 'creating content around trending music',
        motivation: 'inspiring and motivational personal development content',
      }

      const specific = categoryPrompts[category] || 'creating engaging trending content'
      const generatedPrompt = `Inspired by the trend "${trendTitle}" on ${platform}, ${specific}. Professional quality, trending aesthetics, high engagement potential, cinematic lighting.`
      
      setForm(f => ({ ...f, prompt: generatedPrompt }))
    }
  }, [searchParams])

  // Polling des générations en cours
  const pollGenerations = useCallback(async () => {
    const pending = generations.filter(g => g.status === 'submitted' || g.status === 'processing')
    for (const gen of pending) {
      const res = await fetch(`/api/ai/status/${gen.taskId}`)
      if (res.ok) {
        const updated = await res.json()
        setGenerations(prev => prev.map(g => g.taskId === gen.taskId ? { ...g, ...updated } : g))
      }
    }
  }, [generations])

  useEffect(() => {
    const hasPending = generations.some(g => g.status === 'submitted' || g.status === 'processing')
    if (!hasPending) return
    const interval = setInterval(pollGenerations, 5000)
    return () => clearInterval(interval)
  }, [generations, pollGenerations])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.prompt.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur génération')
      const { taskId } = await res.json()
      setGenerations(prev => [{
        taskId,
        status: 'submitted',
        prompt: form.prompt,
        createdAt: Date.now(),
      }, ...prev])
      toast.success('Génération lancée ! ~2-3 min')
      setForm(f => ({ ...f, prompt: '' }))
    } catch {
      toast.error('Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FeatureGate feature="ai_generation" planId={planId} loading={planLoading}>
      <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} className="text-purple-400" />
          Génération IA
        </h1>
        <p className="text-gray-400 mt-1">Crée des vidéos avec Kling AI — le meilleur modèle vidéo du marché</p>
        {trendSource && (
          <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-300">
            Inspiré du trend <strong>\"{trendSource.title}\"</strong> sur {trendSource.platform} ({trendSource.category})
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-1">
          <form onSubmit={handleGenerate} className="glass rounded-2xl p-6 space-y-5 sticky top-8">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              Nouvelle génération
            </h2>

            {/* Prompt */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Prompt <span className="text-red-400">*</span></label>
              <textarea
                required
                rows={4}
                value={form.prompt}
                onChange={e => setForm({...form, prompt: e.target.value})}
                placeholder="Ex: Beautiful woman walking on a beach at sunset, golden hour, cinematic..."
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 resize-none text-sm"
              />
            </div>

            {/* Negative prompt */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Prompt négatif</label>
              <input
                value={form.negativePrompt}
                onChange={e => setForm({...form, negativePrompt: e.target.value})}
                placeholder="blurry, ugly, watermark..."
                className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 text-sm"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Durée</label>
                <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white text-sm focus:outline-none">
                  <option value="5">5 secondes</option>
                  <option value="10">10 secondes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Format</label>
                <select value={form.aspectRatio} onChange={e => setForm({...form, aspectRatio: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white text-sm focus:outline-none">
                  <option value="9:16">9:16 (Vertical)</option>
                  <option value="16:9">16:9 (Horizontal)</option>
                  <option value="1:1">1:1 (Carré)</option>
                </select>
              </div>
            </div>

            {/* Modèle */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Modèle Kling</label>
              <select value={form.model} onChange={e => setForm({...form, model: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white text-sm focus:outline-none">
                <option value="kling-v1">Kling v1 (Rapide)</option>
                <option value="kling-v1-5">Kling v1.5 (Recommandé)</option>
                <option value="kling-v2">Kling v2 (Meilleur)</option>
              </select>
            </div>

            <button type="submit" disabled={loading || !form.prompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Lancement...</> : <><Sparkles size={18} /> Générer la vidéo</>}
            </button>

            <p className="text-xs text-gray-600 text-center">~2-4 minutes par génération</p>
          </form>
        </div>

        {/* Galerie */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Film size={16} className="text-cyan-400" />
            Mes générations ({generations.length})
          </h2>

          {generations.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center text-gray-500">
              <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">Aucune génération</p>
              <p className="text-sm mt-1">Lance ta première vidéo IA !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generations.map(gen => {
                const status = statusConfig[gen.status]
                return (
                  <div key={gen.taskId} className="glass rounded-2xl overflow-hidden group">
                    {/* Preview */}
                    <div className="aspect-video bg-black/40 relative flex items-center justify-center">
                      {gen.status === 'succeed' && gen.videoUrl ? (
                        <video
                          src={gen.videoUrl}
                          poster={gen.coverUrl}
                          className="w-full h-full object-cover"
                          controls
                          loop
                          muted
                        />
                      ) : gen.coverUrl ? (
                        <img src={gen.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-600">
                          <status.icon size={32} className={cn(status.color, status.spin && 'animate-spin')} />
                          <span className="text-sm">{status.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">{gen.prompt}</p>
                      <div className="flex items-center justify-between">
                        <div className={cn('flex items-center gap-1.5 text-xs font-medium', status.color)}>
                          <status.icon size={13} className={cn(status.spin && 'animate-spin')} />
                          {status.label}
                        </div>
                        {gen.status === 'succeed' && gen.videoUrl && (
                          <a href={gen.videoUrl} download target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 glass rounded-lg hover:border-purple-500/40 transition-all">
                            <Download size={13} />
                            Télécharger
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </FeatureGate>
  )
}
