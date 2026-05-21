'use client'
import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { VideoEditor } from '@/components/dashboard/editor/VideoEditor'

interface ContentLibraryItem {
  id: string
  name: string
  size: string
  type: 'video' | 'image'
  spoofed: boolean
  savedAt: string
  url: string
}

export default function EditorPage() {
  const [savedContent, setSavedContent] = useState<ContentLibraryItem[]>([])
  const [isUploadingToDb, setIsUploadingToDb] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')

  // Mock models data
  const models = [
    { id: '1', name: 'Leelou' },
    { id: '2', name: 'Victoria' },
    { id: '3', name: 'Sophie' },
  ]

  const handleProcessingComplete = async (file: Blob, filename: string) => {
    setIsUploadingToDb(true)

    try {
      const formData = new FormData()
      formData.append('file', file, filename)
      formData.append('type', filename.includes('video') ? 'video' : 'image')
      formData.append('platform', selectedPlatform)
      formData.append('spoofed', 'true')
      if (selectedModel) {
        formData.append('modelId', selectedModel)
      }

      const response = await fetch('/api/content/process', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Add to saved content
      const newItem: ContentLibraryItem = {
        id: data.data.id,
        name: data.data.fileName,
        size: `${(data.data.size / 1024 / 1024).toFixed(1)} MB`,
        type: filename.includes('video') ? 'video' : 'image',
        spoofed: true,
        savedAt: new Date().toLocaleString('fr-FR'),
        url: data.data.url,
      }

      setSavedContent((prev) => [newItem, ...prev])
      toast.success('Contenu sauvegardé avec succès!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setIsUploadingToDb(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-3xl font-bold">Éditeur vidéo & Spoof</h1>
      </div>

      {/* Settings section */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Paramètres</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Modèle (optionnel)
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
            >
              <option value="">-- Tous les modèles --</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Plateforme
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter/X</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="mb-8">
        <VideoEditor onProcessingComplete={handleProcessingComplete} />
      </div>

      {/* Saved content */}
      {savedContent.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Contenu traité ({savedContent.length})</h2>
          <div className="space-y-2">
            {savedContent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.spoofed && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-xs font-medium text-green-300">
                        <Check size={12} /> Spoofé
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{item.savedAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{item.size}</p>
                  <p className="text-xs text-gray-600">{item.type.toUpperCase()}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-3 py-2 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors"
                >
                  Aperçu
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
