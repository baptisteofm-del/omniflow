'use client'
import { useState, useRef, useEffect } from 'react'
import {
  Upload, X, Sparkles, Loader2, ChevronDown, ChevronUp,
  Smartphone, Monitor, Square, Image as ImageIcon, Film,
  Database, Edit2, Copy, Type, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import { processVideo } from '@/lib/ffmpeg/processor'
import { cn } from '@/lib/utils/cn'

interface OutputFile { blob: Blob; filename: string; duplicate: number }
interface VideoEditorProps { onProcessingComplete?: (files: OutputFile[], format: string) => void }
interface MediaItem { id: string; name: string; public_url: string; type: string }

// ── Formats ──────────────────────────────────────────────────
const FORMATS = [
  { id: '9:16',     label: '9:16',     desc: 'TikTok / Reels',       Icon: Smartphone },
  { id: '16:9',     label: '16:9',     desc: 'YouTube / Horizontal', Icon: Monitor },
  { id: '1:1',      label: '1:1',      desc: 'Carré Instagram',      Icon: Square },
  { id: '4:5',      label: '4:5',      desc: 'Portrait Instagram',   Icon: ImageIcon },
  { id: 'original', label: 'Original', desc: 'Garder le format',     Icon: Film },
]

// ── Modes de spoof ────────────────────────────────────────────
const SPOOF_MODES = [
  {
    id: 'soft',
    label: 'Faible',
    desc: 'Métadonnées uniquement',
    detail: 'Suppression des métadonnées EXIF, modification des timestamps.',
    color: 'border-yellow-500/40 bg-yellow-500/5',
    active: 'border-yellow-500/70 bg-yellow-500/15 ring-1 ring-yellow-500/30',
    text: 'text-yellow-400',
    options: { stripMetadata: true, reEncode: false, changeTimestamps: true, cropPixels: 0 },
  },
  {
    id: 'medium',
    label: 'Moyen',
    desc: 'Métadonnées + ré-encodage',
    detail: 'Suppression méta + ré-encodage vidéo, rognage léger 2px.',
    color: 'border-orange-500/40 bg-orange-500/5',
    active: 'border-orange-500/70 bg-orange-500/15 ring-1 ring-orange-500/30',
    text: 'text-orange-400',
    options: { stripMetadata: true, reEncode: true, changeTimestamps: true, cropPixels: 2 },
  },
  {
    id: 'hard',
    label: 'Fort',
    desc: 'Métadonnées + ré-encodage + transformations',
    detail: 'Traitement complet : méta, ré-encodage, rognage 4px, variations avancées. Traitement plus long.',
    color: 'border-red-500/40 bg-red-500/5',
    active: 'border-red-500/70 bg-red-500/15 ring-1 ring-red-500/30',
    text: 'text-red-400',
    options: { stripMetadata: true, reEncode: true, changeTimestamps: true, cropPixels: 4 },
  },
]

export function VideoEditor({ onProcessingComplete }: VideoEditorProps) {
  const [file, setFile]                   = useState<File | null>(null)
  const [preview, setPreview]             = useState('')
  const [isProcessing, setIsProcessing]   = useState(false)
  const [progress, setProgress]           = useState(0)
  const [currentDuplicate, setCurrentDuplicate] = useState(0)

  // ── Mode sélection ──
  const [mode, setMode]                   = useState<'edit' | 'spoof' | null>(null)

  // ── Edit mode ──
  const [format, setFormat]               = useState('9:16')
  const [caption, setCaption]             = useState('')
  const [showAdvanced, setShowAdvanced]   = useState(false)

  // ── Spoof mode ──
  const [spoofMode, setSpoofMode]         = useState('medium')
  const [spoofCount, setSpoofCount]       = useState(1)

  // ── Banque médias ──
  const [showMediaBank, setShowMediaBank] = useState(false)
  const [mediaItems, setMediaItems]       = useState<MediaItem[]>([])
  const [loadingMedia, setLoadingMedia]   = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef      = useRef<HTMLDivElement>(null)

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
    setMode(null)
    setShowMediaBank(false)
  }

  const handleMediaBankSelect = async (item: MediaItem) => {
    try {
      const res = await fetch(item.public_url)
      const blob = await res.blob()
      handleFileSelect(new File([blob], item.name, { type: blob.type }))
      toast.success(`"${item.name}" importé`)
    } catch { toast.error('Impossible de charger ce média') }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dropRef.current?.classList.remove('border-cyan-500/50')
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0])
  }

  const handleClear = () => {
    setFile(null); setPreview(''); setProgress(0); setCurrentDuplicate(0)
    setMode(null); setCaption('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectedSpoofMode = SPOOF_MODES.find(m => m.id === spoofMode)!

  const handleProcess = async () => {
    if (!file) { toast.error('Importez un fichier'); return }
    if (!mode)  { toast.error('Choisissez un mode'); return }

    setIsProcessing(true); setProgress(0); setCurrentDuplicate(0)

    const count = mode === 'spoof' ? Math.max(spoofCount, 1) : 1
    const options = mode === 'spoof' ? selectedSpoofMode.options : { stripMetadata: true, reEncode: false, changeTimestamps: true, cropPixels: 0 }
    const outputs: OutputFile[] = []
    const ext = file.name.split('.').pop() || 'mp4'
    const baseName = file.name.replace(/\.[^.]+$/, '')
    const timestamp = new Date().toISOString().split('T')[0]

    try {
      for (let i = 1; i <= count; i++) {
        setCurrentDuplicate(i)
        setProgress(((i - 1) / count) * 100 + 5)
        await sleep(200)

        const dupOptions = {
          ...options,
          cropPixels: (options.cropPixels || 0) + (i > 1 ? Math.floor(Math.random() * 2) : 0),
        }

        let blob: Blob
        if (file.type.startsWith('image/')) {
          blob = file
        } else {
          blob = await processVideo(file, dupOptions)
        }

        setProgress(((i - 1) / count) * 100 + (100 / count) * 0.9)
        const suffix = count > 1 ? `_${i}` : ''
        const modeLabel = mode === 'edit' ? 'edit' : `spoof_${spoofMode}`
        outputs.push({ blob, filename: `${baseName}_${modeLabel}${suffix}_${timestamp}.${ext}`, duplicate: i })
      }

      setProgress(100)
      await sleep(400)
      onProcessingComplete?.(outputs, mode === 'edit' ? format : 'original')
      setTimeout(handleClear, 1500)
    } catch {
      toast.error('Erreur lors du traitement')
    } finally {
      setIsProcessing(false)
    }
  }

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════

  if (!file) return (
    <div className="space-y-3">
      {/* Drop zone */}
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
        <p className="text-gray-500 text-sm">Glissez-déposez ou cliquez</p>
        <p className="text-gray-700 text-xs mt-1.5">MP4 · MOV · WebM · JPG · PNG</p>
      </div>

      {/* Banque médias */}
      <button onClick={() => setShowMediaBank(!showMediaBank)}
        className={cn('w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all',
          showMediaBank ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300')}>
        <span className="flex items-center gap-2"><Database size={14} />Sélectionner depuis la banque de médias</span>
        {showMediaBank ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {showMediaBank && (
        <div className="glass rounded-xl border border-white/5 p-3">
          {loadingMedia ? (
            <div className="flex items-center justify-center py-6 gap-2 text-gray-500 text-sm"><Loader2 size={14} className="animate-spin" />Chargement...</div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center py-6 text-gray-600 text-sm">
              Aucun média. <a href="/media" className="text-purple-400 hover:underline">Ajouter des médias</a>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto">
              {mediaItems.map(item => (
                <button key={item.id} onClick={() => handleMediaBankSelect(item)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-purple-500/40 transition-all">
                  {item.type === 'image'
                    ? <img src={item.public_url} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Film size={16} className="text-gray-500" /></div>
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Choisir</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-5">

      {/* ── Aperçu fichier ── */}
      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              {file.type.startsWith('video') ? <Film size={14} className="text-purple-400" /> : <ImageIcon size={14} className="text-cyan-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
          <button onClick={handleClear} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>
        {file.type.startsWith('video')
          ? <video src={preview} controls className="w-full max-h-52 object-contain bg-black" />
          : <img src={preview} alt="preview" className="w-full max-h-52 object-contain bg-black" />
        }
      </div>

      {/* ── ÉTAPE 1 : Choix du mode ── */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Mode de traitement</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'edit' as const, label: 'Éditer', desc: 'Recadrer, formater, ajouter une caption', Icon: Edit2, color: 'border-cyan-500/40 bg-cyan-500/5', active: 'border-cyan-500/70 bg-cyan-500/15 ring-1 ring-cyan-500/30', text: 'text-cyan-400' },
            { id: 'spoof' as const, label: 'Spoof',  desc: 'Dupliquer avec variations anti-détection', Icon: Copy,  color: 'border-purple-500/40 bg-purple-500/5', active: 'border-purple-500/70 bg-purple-500/15 ring-1 ring-purple-500/30', text: 'text-purple-400' },
          ].map(m => {
            const Icon = m.Icon
            const isSelected = mode === m.id
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={cn('p-4 rounded-xl border text-left transition-all', isSelected ? m.active : m.color + ' hover:border-opacity-70')}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={16} className={isSelected ? m.text : 'text-gray-400'} />
                  <span className={cn('font-bold text-sm', isSelected ? m.text : 'text-white')}>{m.label}</span>
                  {isSelected && <Check size={13} className={cn('ml-auto', m.text)} />}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── ÉTAPE 2 : Réglages selon le mode ── */}
      {mode === 'edit' && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Réglages — Édition</p>

          {/* Format */}
          <div>
            <label className="block text-xs text-gray-500 mb-2.5">Format de sortie</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(f => {
                const Icon = f.Icon
                return (
                  <button key={f.id} onClick={() => setFormat(f.id)}
                    className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                      format === f.id ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300')}>
                    <Icon size={12} /><span>{f.label}</span>
                    <span className="text-gray-600 hidden sm:block">{f.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-500 mb-2.5">
              <Type size={12} />Caption / Texte
              <span className="text-gray-700">(optionnel)</span>
            </label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Ajoutez une légende, un titre ou un texte à associer à ce contenu..."
              rows={3}
              className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none transition-colors"
            />
            {caption && <p className="text-xs text-gray-600 mt-1">{caption.length} caractères</p>}
          </div>
        </div>
      )}

      {mode === 'spoof' && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Réglages — Spoof</p>

          {/* Nombre de spoof */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-gray-500">Nombre de spoof <span className="text-gray-700">(variations générées)</span></label>
              <span className="text-white font-bold text-xl tabular-nums">{spoofCount}</span>
            </div>
            <input type="range" min={1} max={100} step={1} value={spoofCount}
              onChange={e => setSpoofCount(Number(e.target.value))}
              className="w-full accent-purple-500" />
            <div className="flex justify-between text-xs text-gray-700 mt-1">
              <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
            {spoofCount > 20 && (
              <p className="text-xs text-amber-500/80 mt-1.5">Traitement long — {spoofCount} variations seront générées</p>
            )}
          </div>

          {/* Mode de spoof */}
          <div>
            <label className="block text-xs text-gray-500 mb-3">Intensité du spoof</label>
            <div className="grid grid-cols-3 gap-3">
              {SPOOF_MODES.map(m => {
                const isSelected = spoofMode === m.id
                return (
                  <button key={m.id} onClick={() => setSpoofMode(m.id)}
                    className={cn('p-3.5 rounded-xl border text-left transition-all', isSelected ? m.active : m.color + ' hover:border-opacity-70')}>
                    <p className={cn('text-sm font-bold', isSelected ? m.text : 'text-white')}>{m.label}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{m.desc}</p>
                  </button>
                )
              })}
            </div>
            {/* Détail du mode sélectionné */}
            <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-black/20 border border-white/5 text-xs text-gray-500">
              <span className={cn('font-semibold mr-2', selectedSpoofMode.text)}>{selectedSpoofMode.label}</span>
              {selectedSpoofMode.detail}
            </div>
          </div>
        </div>
      )}

      {/* ── Barre de progression ── */}
      {isProcessing && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-purple-400" />
              <span className="text-sm font-medium text-white">
                {mode === 'spoof' && spoofCount > 1 ? `Variation ${currentDuplicate}/${spoofCount}...` : 'Traitement en cours...'}
              </span>
            </div>
            <span className="text-sm font-bold text-purple-400 tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {mode === 'spoof' && spoofCount > 1 && (
            <div className="flex gap-0.5 mt-3">
              {Array.from({ length: Math.min(spoofCount, 20) }, (_, i) => (
                <div key={i} className={cn('flex-1 h-1 rounded-full transition-all',
                  i + 1 < currentDuplicate ? 'bg-green-500' : i + 1 === currentDuplicate ? 'bg-purple-400 animate-pulse' : 'bg-gray-700')} />
              ))}
              {spoofCount > 20 && <span className="text-xs text-gray-600 ml-1">+{spoofCount - 20}</span>}
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
          <button onClick={handleProcess} disabled={!mode}
            className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all',
              mode ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/20' : 'bg-white/5 text-gray-600 cursor-not-allowed')}>
            <Sparkles size={15} />
            {!mode ? 'Choisissez un mode' : mode === 'edit' ? 'Éditer le fichier' : `Générer ${spoofCount} variation${spoofCount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
