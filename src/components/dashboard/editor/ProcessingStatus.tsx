'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader } from 'lucide-react'

interface ProcessingStatusProps {
  isProcessing: boolean
  progress: number
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error'
  errorMessage?: string
}

export function ProcessingStatus({
  isProcessing,
  progress,
  status,
  errorMessage,
}: ProcessingStatusProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (status === 'complete') {
      setDisplayProgress(100)
    } else if (isProcessing) {
      setDisplayProgress(progress)
    } else {
      setDisplayProgress(0)
    }
  }, [isProcessing, progress, status])

  if (!isProcessing && status === 'idle') {
    return null
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : status === 'complete' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Loader className="w-5 h-5 text-purple-500 animate-spin" />
          )}
          <span className="text-sm font-medium">
            {status === 'uploading' && 'Upload en cours...'}
            {status === 'processing' && 'Traitement vidéo...'}
            {status === 'complete' && 'Traitement terminé!'}
            {status === 'error' && 'Erreur de traitement'}
          </span>
        </div>
        <span className="text-xs text-gray-400">{displayProgress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            status === 'error'
              ? 'bg-red-500'
              : status === 'complete'
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-purple-500 to-cyan-500'
          }`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {errorMessage && (
        <p className="text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  )
}
