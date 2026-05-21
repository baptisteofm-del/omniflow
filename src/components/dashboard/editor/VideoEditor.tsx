'use client'
import { useState, useRef } from 'react'
import { Upload, Play, Pause, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  SpoofOptions,
  SpoofOptionsType,
} from './SpoofOptions'
import { ProcessingStatus } from './ProcessingStatus'
import { processVideo, cropVideo } from '@/lib/ffmpeg/processor'

interface VideoEditorProps {
  onProcessingComplete?: (file: Blob, filename: string) => void
}

export function VideoEditor({ onProcessingComplete }: VideoEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const [spoofOptions, setSpoofOptions] = useState<SpoofOptionsType>({
    stripMetadata: true,
    reEncode: true,
    changeTimestamps: true,
    cropPixels: 0,
  })

  const [cropMode, setCropMode] = useState(false)
  const [cropStart, setCropStart] = useState(0)
  const [cropEnd, setCropEnd] = useState(0)

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      toast.error('Format non supporté. Utilisez une vidéo ou image.')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
    setStatus('idle')
    setErrorMessage('')
    setProgress(0)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-cyan-500', 'bg-cyan-500/10')
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-cyan-500', 'bg-cyan-500/10')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-cyan-500', 'bg-cyan-500/10')
    }

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Process video
  const handleProcessVideo = async () => {
    if (!selectedFile) {
      toast.error('Sélectionnez une vidéo d\'abord')
      return
    }

    setIsProcessing(true)
    setStatus('processing')
    setProgress(0)
    setErrorMessage('')

    try {
      // Simulate upload progress
      setStatus('uploading')
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 50))
        setProgress(Math.min(30 + i, 50))
      }

      setStatus('processing')
      setProgress(50)

      // Process the file
      let processedBlob: Blob

      if (cropMode && cropEnd > cropStart) {
        processedBlob = await cropVideo(selectedFile, cropStart, cropEnd)
      } else {
        processedBlob = await processVideo(selectedFile, spoofOptions)
      }

      // Simulate final progress
      for (let i = 0; i < 50; i++) {
        await new Promise((r) => setTimeout(r, 20))
        setProgress(Math.min(50 + i, 99))
      }

      setProgress(100)
      setStatus('complete')

      // Create new file with modified timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const newFileName = `${selectedFile.name.replace(/\.[^.]+$/, '')}_spoofed_${timestamp}.${selectedFile.name.split('.').pop()}`

      toast.success('Vidéo traitée avec succès!')

      // Call callback if provided
      if (onProcessingComplete) {
        onProcessingComplete(processedBlob, newFileName)
      }

      // Wait a bit before resetting
      setTimeout(() => {
        setIsProcessing(false)
        setSelectedFile(null)
        setPreview('')
        setCropMode(false)
        setCropStart(0)
        setCropEnd(0)
      }, 2000)
    } catch (error) {
      console.error('Processing error:', error)
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Erreur lors du traitement'
      )
      toast.error('Erreur lors du traitement')
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview('')
    setStatus('idle')
    setProgress(0)
    setCropMode(false)
    setCropStart(0)
    setCropEnd(0)
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload section */}
      {!selectedFile ? (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="glass rounded-2xl p-12 border-2 border-dashed border-purple-500/30 hover:border-cyan-500/50 transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0])
              }
            }}
          />

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-colors">
              <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Importez votre vidéo</h3>
            <p className="text-gray-400 mb-4">Glissez-déposez ou cliquez pour sélectionner</p>
            <p className="text-xs text-gray-600">MP4, WebM, MOV ou formats image supportés</p>
          </div>
        </div>
      ) : (
        <>
          {/* Preview section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Aperçu</h3>
              <button
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Annuler"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black/50">
              <video
                ref={videoRef}
                src={preview}
                controls
                className="w-full aspect-video object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>
                <p className="text-gray-600">Fichier</p>
                <p className="truncate">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Taille</p>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
          </div>

          {/* Crop section */}
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={cropMode}
                onChange={(e) => setCropMode(e.target.checked)}
                className="rounded accent-purple-500 cursor-pointer"
              />
              <span className="text-sm font-medium">Rogner la vidéo</span>
            </label>

            {cropMode && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    Début (secondes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropStart}
                    onChange={(e) => setCropStart(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    Fin (secondes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropEnd}
                    onChange={(e) => setCropEnd(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none text-sm"
                    placeholder="10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Spoof options */}
          {!cropMode && (
            <div className="glass rounded-2xl p-6">
              <SpoofOptions
                options={spoofOptions}
                onChange={setSpoofOptions}
              />
            </div>
          )}

          {/* Processing status */}
          {isProcessing && (
            <div className="glass rounded-2xl p-6">
              <ProcessingStatus
                isProcessing={isProcessing}
                progress={progress}
                status={status}
                errorMessage={errorMessage}
              />
            </div>
          )}

          {/* Action buttons */}
          {!isProcessing && (
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleProcessVideo}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <Sparkles size={18} />
                {cropMode ? 'Rogner' : 'Traiter & Spoof'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
