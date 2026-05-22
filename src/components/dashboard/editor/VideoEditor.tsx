'use client'
import { useState, useRef } from 'react'
import { Upload, X, Sparkles, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { processVideo } from '@/lib/ffmpeg/processor'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OutputFile {
  blob: Blob
  filename: string
  duplicate: number
}

interface VideoEditorProps {
  onProcessingComplete?: (files: OutputFile[], format: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FORMATS = [
  { id: '9:16', label: '9:16', desc: 'TikTok / Reels', icon: '📱' },
  { id: '16:9', label: '16:9', desc: 'YouTube / Horizontal', icon: '🖥️' },
  { id: '1:1',  label: '1:1',  desc: 'Carré Instagram', icon: '⬜' },
  { id: '4:5',  label: '4:5',  desc: 'Portrait Instagram', icon: '📷' },
  { id: 'original', label: 'Original', desc: 'Garder le format', icon: '🎬' },
]

const SPOOF_PRESETS = [
  {
    id: 'soft',
    label: '🟡 Léger',
    desc: 'Métadonnées seulement',
    options: { stripMetadata: true, reEncode: false, changeTimestamps: true, cropPixels: 0 },
  },
  {
    id: 'medium',
    label: '🟠 Moyen',
    desc: 'Méta + ré-encodage',
    options: { stripMetadata: true, reEncode: true, changeTimestamps: true, cropPixels: 2 },
  },
  {
    id: 'hard',
    label: '🔴 Fort',
    desc: 'Tout + rognage 4px',
    options: { stripMetadata: true, reEncode: true, changeTimestamps: true, cropPixels: 4 },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function VideoEditor({ onProcessingComplete }: VideoEditorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentDuplicate, setCurrentDuplicate] = useState(0)

  // ── Config options ──
  const [format, setFormat] = useState('9:16')
  const [duplicates, setDuplicates] = useState(1)
  const [spoofPreset, setSpoofPreset] = useState('medium')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // ── Advanced / custom trim ──
  const [trimEnabled, setTrimEnabled] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [addWatermark, setAddWatermark] = useState(false)
  const [randomizePitch, setRandomizePitch] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // ── File handling ──
  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('video/') && !f.type.startsWith('image/')) {
      toast.error('Format non supporté (vidéo ou image uniquement)')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setProgress(0)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dropRef.current?.classList.remove('border-cyan-500', 'bg-cyan-500/10')
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0])
  }

  const handleClear = () => {
    setFile(null)
    setPreview('')
    setProgress(0)
    setCurrentDuplicate(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Processing ──
  const handleProcess = async () => {
    if (!file) { toast.error('Importez un fichier d\'abord'); return }
    setIsProcessing(true)
    setProgress(0)
    setCurrentDuplicate(0)

    const preset = SPOOF_PRESETS.find((p) => p.id === spoofPreset)!
    const outputs: OutputFile[] = []
    const ext = file.name.split('.').pop() || 'mp4'
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const timestamp = new Date().toISOString().split('T')[0]

    try {
      for (let i = 1; i <= duplicates; i++) {
        setCurrentDuplicate(i)

        // Slightly vary spoof per duplicate for uniqueness
        const options = {
          ...preset.options,
          cropPixels: preset.options.cropPixels + (i > 1 ? Math.floor(Math.random() * 3) : 0),
          changeTimestamps: true,
        }

        // Simulate step progress per duplicate
        const baseProgress = ((i - 1) / duplicates) * 100
        setProgress(baseProgress + 5)
        await sleep(200)

        let blob: Blob
        if (file.type.startsWith('image/')) {
          // For images, just return a copy (real image manipulation would be FFmpeg)
          blob = file
        } else {
          blob = await processVideo(file, options)
        }

        setProgress(baseProgress + (100 / duplicates) * 0.9)

        const suffix = duplicates > 1 ? `_v${i}` : ''
        const filename = `${baseName}_spoofed_${timestamp}${suffix}.${ext}`
        outputs.push({ blob, filename, duplicate: i })
      }

      setProgress(100)
      await sleep(400)

      onProcessingComplete?.(outputs, format)

      // Reset after a short delay
      setTimeout(handleClear, 1500)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du traitement')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedPreset = SPOOF_PRESETS.find((p) => p.id === spoofPreset)!

  return (
    <div className="space-y-5">

      {/* ── Drop zone ── */}
      {!file ? (
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('border-cyan-500', 'bg-cyan-500/10') }}
          onDragLeave={() => dropRef.current?.classList.remove('border-cyan-500', 'bg-cyan-500/10')}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-cyan-500/50 bg-white/3 p-12 text-center cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload size={28} className="text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Importez votre vidéo ou image</h3>
          <p className="text-gray-500 text-sm">Glissez-déposez ou cliquez pour sélectionner</p>
          <p className="text-gray-700 text-xs mt-2">MP4 · MOV · WebM · JPG · PNG · GIF</p>
        </div>
      ) : (
        <>
          {/* ── Preview ── */}
          <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-lg">{file.type.startsWith('video') ? '🎬' : '🖼️'}</span>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              <button onClick={handleClear} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            {file.type.startsWith('video') ? (
              <video src={preview} controls className="w-full max-h-56 object-contain bg-black" />
            ) : (
              <img src={preview} alt="preview" className="w-full max-h-56 object-contain bg-black" />
            )}
          </div>

          {/* ── Config panel ── */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-6">

            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Format de sortie
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      format === f.id
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                    <span className="text-xs text-gray-600 hidden sm:block">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duplications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Nombre de copies
                </label>
                <span className="text-white font-bold text-lg">{duplicates}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={duplicates}
                onChange={(e) => setDuplicates(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => <span key={n}>{n}</span>)}
              </div>
              {duplicates > 1 && (
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Chaque copie aura des métadonnées légèrement différentes pour éviter la détection
                </p>
              )}
            </div>

            {/* Spoof preset */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Niveau de spoof
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SPOOF_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSpoofPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      spoofPreset === preset.id
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">{preset.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{preset.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-2 p-3 rounded-xl bg-black/20 border border-white/5 text-xs text-gray-500 flex flex-wrap gap-3">
                {Object.entries(selectedPreset.options).map(([key, val]) => (
                  <span key={key} className={val ? 'text-green-400' : 'text-gray-700'}>
                    {val ? '✓' : '✗'} {key === 'stripMetadata' ? 'Strip méta' : key === 'reEncode' ? 'Ré-encodage' : key === 'changeTimestamps' ? 'Timestamps' : `Crop ${val}px`}
                  </span>
                ))}
              </div>
            </div>

            {/* Advanced toggle */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                Options avancées
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 pl-2 border-l border-white/10">
                  {/* Trim */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer mb-2">
                      <input type="checkbox" checked={trimEnabled} onChange={(e) => setTrimEnabled(e.target.checked)} className="accent-purple-500" />
                      Rogner la vidéo (trim)
                    </label>
                    {trimEnabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Début (s)</label>
                          <input type="number" min={0} step={0.1} value={trimStart}
                            onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Fin (s)</label>
                          <input type="number" min={0} step={0.1} value={trimEnd}
                            onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                            placeholder="ex: 30"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extra options */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={randomizePitch} onChange={(e) => setRandomizePitch(e.target.checked)} className="accent-purple-500" />
                      Modifier légèrement la vitesse audio
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={addWatermark} onChange={(e) => setAddWatermark(e.target.checked)} className="accent-purple-500" />
                      Ajouter pixel invisible (watermark résistant)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Progress ── */}
          {isProcessing && (
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                  <span className="text-sm font-medium text-white">
                    {duplicates > 1
                      ? `Traitement copie ${currentDuplicate}/${duplicates}...`
                      : 'Traitement en cours...'}
                  </span>
                </div>
                <span className="text-sm font-bold text-purple-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {duplicates > 1 && (
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: duplicates }, (_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        i + 1 < currentDuplicate ? 'bg-green-500' :
                        i + 1 === currentDuplicate ? 'bg-purple-400 animate-pulse' :
                        'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CTA ── */}
          {!isProcessing && (
            <div className="flex gap-3">
              <button onClick={handleClear} className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleProcess}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                <Sparkles size={18} />
                Traiter & Spoof
                {duplicates > 1 && <span className="text-purple-200 text-sm">({duplicates} copies)</span>}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
