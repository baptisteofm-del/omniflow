'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Check, Download, Trash2, Film, Copy, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { VideoEditor } from '@/components/dashboard/editor/VideoEditor'

interface ProcessedItem {
  id: string
  name: string
  size: string
  type: 'video' | 'image'
  url: string
  format: string
  processedAt: string
  duplicate: number
}

export default function EditorPage() {
  const [processed, setProcessed] = useState<ProcessedItem[]>([])

  const handleProcessingComplete = async (
    files: { blob: Blob; filename: string; duplicate: number }[],
    format: string
  ) => {
    const newItems: ProcessedItem[] = []

    for (const { blob, filename, duplicate } of files) {
      // Optionally save to media library via API
      try {
        const formData = new FormData()
        formData.append('file', blob, filename)
        formData.append('type', blob.type.startsWith('video') ? 'video' : 'image')
        formData.append('spoofed', 'true')

        const res = await fetch('/api/content/process', { method: 'POST', body: formData })
        const data = await res.json()

        if (res.ok && data.data) {
          newItems.push({
            id: data.data.id,
            name: filename,
            size: `${(blob.size / 1024 / 1024).toFixed(1)} MB`,
            type: blob.type.startsWith('video') ? 'video' : 'image',
            url: data.data.url,
            format,
            processedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            duplicate,
          })
        } else {
          throw new Error()
        }
      } catch {
        // Save locally as object URL if API fails
        const url = URL.createObjectURL(blob)
        newItems.push({
          id: `local-${Date.now()}-${duplicate}`,
          name: filename,
          size: `${(blob.size / 1024 / 1024).toFixed(1)} MB`,
          type: blob.type.startsWith('video') ? 'video' : 'image',
          url,
          format,
          processedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duplicate,
        })
      }
    }

    setProcessed((prev) => [...newItems, ...prev])
    toast.success(`${newItems.length} fichier${newItems.length > 1 ? 's' : ''} traité${newItems.length > 1 ? 's' : ''} ✅`)
  }

  const downloadItem = (item: ProcessedItem) => {
    const a = document.createElement('a')
    a.href = item.url
    a.download = item.name
    a.click()
  }

  const removeItem = (id: string) => {
    setProcessed((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">

      <PageHeader
        icon={Film}
        title="Édition & Spoof"
        subtitle="Montez vos vidéos"
        iconColor="text-pink-400"
        iconBg="bg-pink-500/10"
      />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-0.5">
          <Film className="text-purple-400" size={22} />
          Édition & Spoof
        </h1>
        <p className="text-gray-500 text-sm">
          Importez une vidéo ou image, choisissez le format et le niveau de spoof pour éviter la détection des plateformes.
        </p>
      </div>

      {/* Editor */}
      <VideoEditor onProcessingComplete={handleProcessingComplete} />

      {/* Output */}
      {processed.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Copy size={18} className="text-purple-400" />
              Fichiers traités ({processed.length})
            </h2>
            <button
              onClick={() => setProcessed([])}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Tout effacer
            </button>
          </div>

          <div className="space-y-2">
            {processed.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3.5 rounded-xl border border-white/5 hover:border-white/10 bg-black/20 transition-colors"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  {item.type === 'video' ? <Film size={15} className="text-purple-400" /> : <ImageIcon size={15} className="text-cyan-400" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
                      {item.format}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 font-medium flex items-center gap-0.5">
                      <Check size={10} /> Spoofé
                    </span>
                    {item.duplicate > 1 && (
                      <span className="text-[10px] text-gray-500">copie #{item.duplicate}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{item.size} · {item.processedAt}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => downloadItem(item)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Télécharger"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
