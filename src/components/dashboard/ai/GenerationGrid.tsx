'use client'
import { useEffect, useState } from 'react'
import { GenerationCard, Generation } from './GenerationCard'
import { Loader } from 'lucide-react'

interface GenerationGridProps {
  refreshTrigger?: number
}

export function GenerationGrid({ refreshTrigger }: GenerationGridProps) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate fetching generations (in real app, this would be an API call)
  const loadGenerations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock data - in production this would come from /api/ai/generations
      const mockGenerations: Generation[] = [
        {
          id: '1',
          prompt: 'A girl dancing on a beach at sunset',
          style: 'cinematic',
          duration: 5,
          status: 'completed',
          videoUrl: 'https://example.com/video1.mp4',
          thumbnail: undefined,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          prompt: 'Abstract neon lights pattern',
          style: 'neon',
          duration: 10,
          status: 'processing',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]

      setGenerations(mockGenerations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generations')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGenerations()
  }, [refreshTrigger])

  // Poll for status updates on processing videos
  useEffect(() => {
    const processingVideos = generations.filter((g) => g.status === 'processing')

    if (processingVideos.length === 0) return

    const interval = setInterval(async () => {
      for (const video of processingVideos) {
        try {
          const response = await fetch(`/api/ai/status/${video.id}`)
          const data = await response.json()

          if (data.success) {
            setGenerations((prev) =>
              prev.map((g) =>
                g.id === video.id
                  ? {
                      ...g,
                      status: data.data.status as Generation['status'],
                      videoUrl: data.data.videoUrl || g.videoUrl,
                      thumbnail: data.data.thumbnail || g.thumbnail,
                      error: data.data.error || undefined,
                    }
                  : g
              )
            )
          }
        } catch (err) {
          console.error('Status check error:', err)
        }
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [generations])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <p className="text-sm text-red-300">{error}</p>
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Aucune génération pour le moment</p>
        <p className="text-sm text-gray-600 mt-2">
          Créez votre première génération avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {generations.map((generation) => (
        <GenerationCard
          key={generation.id}
          generation={generation}
          onStatusUpdated={(id, status) => {
            setGenerations((prev) =>
              prev.map((g) =>
                g.id === id ? { ...g, status: status as Generation['status'] } : g
              )
            )
          }}
        />
      ))}
    </div>
  )
}
