'use client'
import { useState, useRef, useEffect } from 'react'
import {
  Upload, X, Sparkles, Loader2, ChevronDown, ChevronUp, Check,
  Smartphone, Monitor, Square, Image as ImageIcon, Film,
  Zap, Shield, ShieldAlert, Database, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { processVideo } from '@/lib/ffmpeg/processor'
import { cn } from '@/lib/utils/cn'

interface OutputFile { blob: Blob; filename: string; duplicate: number }
interface VideoEditorProps { onProcessingComplete?: (files: OutputFile[], format: string) => void }
interface MediaItem { id: string; name: string; public_url: string; type: string }

// ── Formats ──────────────────────────────────────────────────
const FORMATS = [
  { id: '9:16',     label: '9:16',     desc: 'TikTok / Reels',        Icon: Smartphone },
  { id: '16:9',     label: '16:9',     desc: 'YouTube / Horizontal',  Icon: Monitor },
  { id: '1:1',      label: '1:1',      desc: 'Carré Instagram',       Icon: Square },
  { id: '4:5',      label: '4:5',      desc: 'Portrait Instagram',    Icon: ImageIcon },
  { id: 'original', label: 'Original', desc: 'Garder le format',      Icon: Film },
]

// ── Spoof presets (liés au slider 1-100) ─────────────────────
function getSpoofPresetFromLevel(level: number) {
  if (level <= 30)  return { id: 'soft',   label: 'Léger',  color: 'text-yellow-400', stripMetadata: true,  reEncode: false, changeTimestamps: true,  cropPixels: 0 }
  if (level <= 70)  return { id: 'medium', label: 'Moyen',  color: 'text-orange-400', stripMetadata: true,  reEncode: true,  changeTimestamps: true,  cropPixels: Math.round((level - 30) / 20) }
  return            { id: 'hard',   label: 'Fort',   color: 'text-red-400',    stripMetadata: true,  reEncode: true,  changeTimestamps: true,  cropPixels: Math.min(4 + Math.round((level - 70) / 10), 8) }
}

const SPOOF_LABELS = [
  { range: [1, 30],   label: 'Léger — Métadonnées uniquement',  color: 'bg-yellow-500' },
  { range: [31, 70],  label: 'Moyen — Méta + ré-encodage',      color: 'bg-orange-500' },
  { range: [71, 100], label: 'Fort — Tout + transformations',   color: 'bg-red-500' },
]

function getSpoofLabel(level: number) {
  return SPOOF_LABELS.find(s => level >= s.range[0] && level <= s.range[1])!
}

// ── Processing speeds ─────────────────────────────────────────
const SPEEDS = [
  { id: 'fast',   label: 'Rapide',    desc: 'Qualité réduite, temps minimal' },
  { id: 'normal', label: 'Normal',    desc: 'Équilibre qualité / vitesse' },
  { id: 'best',   label: 'Haute qualité', desc: 'Traitement approfondi' },
]

export function VideoEditor({ onProcessingComplete }: VideoEditorProps) {
  const [file, setFile]               = useState<File | null>(null)
  const [preview, setPreview]         = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress]       = useState(0)
  const [currentDuplicate, setCurrentDuplicate] = useState(0)
  const [format, setFormat]           = useState('9:16')
  const [duplicates, setDuplicates]   = useState(1)
  const [spoofLevel, setSpoofLevel]   = useState(50)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showMediaBank, setShowMediaBank] = useState(false)
  const [mediaItems, setMediaItems]   = useState<MediaItem[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  // Advanced
  const [processingSpeed, setProcessingSpeed] = useState('normal')
  const [trimEnabled, setTrimEnabled] = useState(false)
  const [trimStart, setTrimStart]     = useState(0)
  const [trimEnd, setTrimEnd]         = useState(0)
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [randomizePitch, setRandomizePitch] = useState(false)
  const [addInvisibleWatermark, setAddInvisibleWatermark] = useState(false)
  const [videoBitrate, setVideoBitrate] = useState('auto')
  const [colorAdjust, setColorAdjust]  = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef      = useRef<HTMLDivElement>(null)

  const spoofConfig = getSpoofPresetFromLevel(spoofLevel)
  const spoofLabel  = getSpoofLabel(spoofLevel)

  // Charger la banque de médias
  const loadMediaBank = async () => {
    setLoadingMedia(true)
    try {
      const res = await fetch('/api/media')
      if (res.ok) {
        const data = await res.json()
        setMediaItems(data.files || data.media || [])
      }
    } catch {}
    setLoadingMedia(false)
  }

  useEffect(() => { if (showMediaBank) loadMediaBank() }, [showMediaBank])

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('video/') && !f.type.startsWith('image/')) {
      toast.error('Format non supporté')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setProgress(0)
    setShowMediaBank(false)
  }

  const handleMediaBankSelect = async (item: MediaItem) => {
    try {
      const res = await fetch(item.public_url)
      const blob = await res.blob()
      const f = new File([blob], item.name, { type: blob.type })
      handleFileSelect(f)
      toast.success(`"${item.name}" importé depuis la banque`)
    } catch {
      toast.error('Impossible de charger ce média')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dropRef.current?.classList.remove('border-cyan-500', 'bg-cyan-500/10')
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0])
  }

  const handleClear = () => {
    setFile(null); setPreview(''); setProgress(0); setCurrentDuplicate(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleProcess = async () => {
    if (!file) { toast.error('Importez un fichier'); return }
    setIsProcessing(true); setProgress(0); setCurrentDuplicate(0)
    const options = { ...spoofConfig, cropPixels: spoofConfig.cropPixels + (spoofLevel > 85 ? 2 : 0) }
    const outputs: OutputFile[] = []
    const ext = file.name.split('.').pop() || 'mp4'
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const timestamp = new Date().toISOString().split('T')[0]

    try {
      for (let i = 1; i <= duplicates; i++) {
        setCurrentDuplicate(i)
        const baseProgress = ((i - 1) / duplicates) * 100
        setProgress(baseProgress + 5)
        await sleep(processingSpeed === 'fast' ? 100 : processingSpeed === 'best' ? 400 : 200)

        const dupOptions = {
          ...options,
          cropPixels: options.cropPixels + (i > 1 ? Math.floor(Math.random() * 3) : 0),
        }

        let blob: Blob
        if (file.type.startsWith('image/')) {
          blob = file
        } else {
          blob = await processVideo(file, dupOptions)
        }

        setProgress(baseProgress + (100 / duplicates) * 0.9)
        const suffix = duplicates > 1 ? `_v${i}` : ''
        outputs.push({ blob, filename: `${baseName}_spoof${suffix}_${timestamp}.${ext}`, duplicate: i })
      }

      setProgress(100)
      await sleep(400)
      onProcessingComplete?.(outputs, format)
      setTimeout(handleClear, 1500)
    } catch (err) {
      toast.error('Erreur lors du traitement')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* ── Drop zone ── */}
      {!file ? (
        <div className="space-y-3">
          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add('border-cyan-500/50') }}
            onDragLeave={() => dropRef.current?.classList.remove('border-cyan-500/50')}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-cyan-500/40 bg-white/3 p-10 text-center cursor-pointer transition-all group"
          >
            <input ref={fileInputRef} type="file" accept="video/*,image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload size={24} className="text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Importer un fichier</h3>
            <p className="text-gray-500 text-sm">Glissez-déposez ou cliquez pour sélectionner</p>
            <p className="text-gray-700 text-xs mt-1.5">MP4 · MOV · WebM · JPG · PNG · GIF</p>
          </div>

          {/* Banque de médias */}
          <div>
            <button onClick={() => setShowMediaBank(!showMediaBank)}
              className={cn('w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all',
                showMediaBank ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300')}>
              <span className="flex items-center gap-2">
                <Database size={15} />
                Sélectionner depuis la banque de médias
              </span>
              {showMediaBank ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showMediaBank && (
              <div className="mt-2 glass rounded-xl border border-white/5 p-3">
                {loadingMedia ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-gray-500 text-sm">
                    <Loader2 size={15} className="animate-spin" />Chargement...
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-600 text-sm">
                    Aucun média dans la banque.{' '}
                    <a href="/media" className="text-purple-400 hover:text-purple-300 underline">Ajouter des médias</a>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {mediaItems.map(item => (
                      <button key={item.id} onClick={() => handleMediaBankSelect(item)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all">
                        {item.type === 'image' ? (
                          <img src={item.public_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <Film size={18} className="text-gray-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Sélectionner</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Preview ── */}
          <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  {file.type.startsWith('video') ? <Film size={15} className="text-purple-400" /> : <ImageIcon size={15} className="text-cyan-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              <button onClick={handleClear} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <X size={15} />
              </button>
            </div>
            {file.type.startsWith('video') ? (
              <video src={preview} controls className="w-full max-h-52 object-contain bg-black" />
            ) : (
              <img src={preview} alt="preview" className="w-full max-h-52 object-contain bg-black" />
            )}
          </div>

          {/* ── Config ── */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-6">

            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Format de sortie</label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(f => {
                  const Icon = f.Icon
                  return (
                    <button key={f.id} onClick={() => setFormat(f.id)}
                      className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                        format === f.id ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300')}>
                      <Icon size={13} />
                      <span>{f.label}</span>
                      <span className="text-gray-600 hidden sm:block">{f.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Copies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Nombre de copies</label>
                <span className="text-white font-bold text-lg tabular-nums">{duplicates}</span>
              </div>
              <input type="range" min={1} max={10} step={1} value={duplicates}
                onChange={e => setDuplicates(Number(e.target.value))} className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
              </div>
              {duplicates > 1 && (
                <p className="text-xs text-gray-600 mt-1.5">Chaque copie reçoit des métadonnées légèrement différentes</p>
              )}
            </div>

            {/* Spoof level 1-100 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Niveau de spoof</label>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold', spoofConfig.color)}>{spoofLabel.label.split(' — ')[0]}</span>
                  <span className="text-white font-bold text-lg tabular-nums">{spoofLevel}</span>
                  <span className="text-gray-600 text-xs">/100</span>
                </div>
              </div>
              <div className="relative">
                <input type="range" min={1} max={100} step={1} value={spoofLevel}
                  onChange={e => setSpoofLevel(Number(e.target.value))}
                  className="w-full accent-purple-500 [&::-webkit-slider-runnable-track]:rounded-full" />
                <div className="flex justify-between text-xs text-gray-700 mt-1">
                  <span>1 — Léger</span><span className="text-center">50 — Moyen</span><span>100 — Fort</span>
                </div>
              </div>
              {/* Level indicator */}
              <div className="mt-3 p-3 rounded-xl bg-black/20 border border-white/5 space-y-2">
                <p className="text-xs text-gray-400 font-medium">{spoofLabel.label}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={spoofConfig.stripMetadata ? 'text-green-400' : 'text-gray-700'}>
                    <Check size={10} className="inline mr-0.5" />Strip métadonnées
                  </span>
                  <span className={spoofConfig.reEncode ? 'text-green-400' : 'text-gray-600'}>
                    {spoofConfig.reEncode ? <Check size={10} className="inline mr-0.5" /> : <X size={10} className="inline mr-0.5" />}
                    Ré-encodage
                  </span>
                  <span className={spoofConfig.changeTimestamps ? 'text-green-400' : 'text-gray-700'}>
                    <Check size={10} className="inline mr-0.5" />Timestamps
                  </span>
                  {spoofConfig.cropPixels > 0 && (
                    <span className="text-orange-400"><Check size={10} className="inline mr-0.5" />Crop {spoofConfig.cropPixels}px</span>
                  )}
                </div>
                {spoofLevel > 70 && (
                  <p className="text-xs text-amber-500">Traitement plus long — qualité légèrement réduite</p>
                )}
              </div>
            </div>

            {/* Options avancées */}
            <div>
              <button onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Options avancées
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-5 pl-3 border-l border-white/8">

                  {/* Vitesse de traitement */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-2">Vitesse de traitement</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SPEEDS.map(s => (
                        <button key={s.id} onClick={() => setProcessingSpeed(s.id)}
                          className={cn('p-2.5 rounded-xl border text-left transition-all',
                            processingSpeed === s.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/8 hover:border-white/15')}>
                          <p className="text-xs font-semibold text-white">{s.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bitrate vidéo */}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-2">Bitrate vidéo</label>
                    <select value={videoBitrate} onChange={e => setVideoBitrate(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500/40 focus:outline-none">
                      <option value="auto">Automatique (recommandé)</option>
                      <option value="2M">2 Mbps — Léger</option>
                      <option value="5M">5 Mbps — Standard</option>
                      <option value="10M">10 Mbps — Haute qualité</option>
                      <option value="20M">20 Mbps — Ultra qualité</option>
                    </select>
                  </div>

                  {/* Trim */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer mb-2">
                      <input type="checkbox" checked={trimEnabled} onChange={e => setTrimEnabled(e.target.checked)} className="accent-purple-500" />
                      Rogner la vidéo (trim)
                    </label>
                    {trimEnabled && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Début (secondes)</label>
                          <input type="number" min={0} step={0.1} value={trimStart}
                            onChange={e => setTrimStart(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500/40 focus:outline-none" placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Fin (secondes)</label>
                          <input type="number" min={0} step={0.1} value={trimEnd}
                            onChange={e => setTrimEnd(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-purple-500/40 focus:outline-none" placeholder="30" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2.5">
                    {[
                      { key: 'autoOptimize',           val: autoOptimize,           set: setAutoOptimize,           label: 'Optimisation automatique du rendu' },
                      { key: 'randomizePitch',         val: randomizePitch,         set: setRandomizePitch,         label: 'Modifier légèrement la vitesse audio' },
                      { key: 'addInvisibleWatermark',  val: addInvisibleWatermark,  set: setAddInvisibleWatermark,  label: 'Watermark invisible (résistant à la détection)' },
                      { key: 'colorAdjust',            val: colorAdjust,            set: setColorAdjust,            label: 'Ajustement mineur des couleurs' },
                    ].map(({ key, val, set, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                        <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="accent-purple-500" />
                        {label}
                      </label>
                    ))}
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
                  <Loader2 size={15} className="animate-spin text-purple-400" />
                  <span className="text-sm font-medium text-white">
                    {duplicates > 1 ? `Copie ${currentDuplicate}/${duplicates}...` : 'Traitement en cours...'}
                  </span>
                </div>
                <span className="text-sm font-bold text-purple-400 tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              {duplicates > 1 && (
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: duplicates }, (_, i) => (
                    <div key={i} className={cn('flex-1 h-1 rounded-full transition-all',
                      i + 1 < currentDuplicate ? 'bg-green-500' : i + 1 === currentDuplicate ? 'bg-purple-400 animate-pulse' : 'bg-gray-700')} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CTA ── */}
          {!isProcessing && (
            <div className="flex gap-3">
              <button onClick={handleClear} className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-gray-300 transition-all">
                Annuler
              </button>
              <button onClick={handleProcess}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20">
                <Sparkles size={16} />
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

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
