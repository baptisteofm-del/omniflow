'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Type, Image as ImageIcon, Smile, Layers, Trash2, Copy,
  ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Download, RotateCcw, Crop, Plus, Film, Move
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ── Types ────────────────────────────────────────────────────
interface Layer {
  id: string
  type: 'image' | 'text' | 'sticker'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  // text
  content?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  bold?: boolean
  italic?: boolean
  align?: 'left' | 'center' | 'right'
  bgColor?: string
  // image
  src?: string
  img?: HTMLImageElement
}

interface CanvasEditorProps {
  file: File
  onExport: (blob: Blob, caption: string) => void
  onCancel: () => void
}

const CANVAS_W = 720
const CANVAS_H = 1280 // 9:16 default

const STICKERS = ['⭐','🔥','💎','✨','👑','💜','🎯','🚀','💫','🎉','❤️','🌟','💪','🎬','📸']
const FONTS = ['Inter', 'Georgia', 'Arial Black', 'Courier New', 'Impact']
const ASPECT_RATIOS = [
  { id: '9:16', w: 720, h: 1280, label: '9:16 TikTok/Reels' },
  { id: '1:1',  w: 720, h: 720,  label: '1:1 Carré' },
  { id: '4:5',  w: 720, h: 900,  label: '4:5 Portrait IG' },
  { id: '16:9', w: 1280, h: 720, label: '16:9 Paysage' },
]

function genId() { return Math.random().toString(36).slice(2, 9) }

export function CanvasEditor({ file, onExport, onCancel }: CanvasEditorProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const previewRef  = useRef<HTMLDivElement>(null)

  const [layers, setLayers]           = useState<Layer[]>([])
  const [selected, setSelected]       = useState<string | null>(null)
  const [dragging, setDragging]       = useState(false)
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0, lx: 0, ly: 0 })
  const [canvasSize, setCanvasSize]   = useState({ w: CANVAS_W, h: CANVAS_H })
  const [activeTab, setActiveTab]     = useState<'layers' | 'text' | 'stickers' | 'collage'>('layers')
  const [caption, setCaption]         = useState('')
  const [scale, setScale]             = useState(1)
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [extraFiles, setExtraFiles]   = useState<File[]>([])
  const extraInputRef = useRef<HTMLInputElement>(null)

  const selectedLayer = layers.find(l => l.id === selected) ?? null

  // ── Load initial file ─────────────────────────────────────
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    if (file.type.startsWith('image/')) {
      const img = new window.Image()
      img.onload = () => {
        const aspect = img.width / img.height
        const cw = canvasSize.w
        const ch = canvasSize.h
        const fitW = Math.min(cw, ch * aspect)
        const fitH = fitW / aspect
        const layer: Layer = {
          id: genId(), type: 'image', src: url, img,
          x: (cw - fitW) / 2, y: (ch - fitH) / 2,
          width: fitW, height: fitH, rotation: 0, opacity: 1,
        }
        setLayers([layer])
      }
      img.src = url
    }
  }, [file])

  // ── Compute preview scale ─────────────────────────────────
  useEffect(() => {
    if (!previewRef.current) return
    const maxW = previewRef.current.clientWidth || 360
    setScale(Math.min(1, maxW / canvasSize.w))
  }, [canvasSize])

  // ── Redraw canvas ─────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = canvasSize.w
    canvas.height = canvasSize.h
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    layers.forEach(layer => {
      ctx.save()
      ctx.globalAlpha = layer.opacity
      const cx = layer.x + layer.width / 2
      const cy = layer.y + layer.height / 2
      ctx.translate(cx, cy)
      ctx.rotate((layer.rotation * Math.PI) / 180)

      if (layer.type === 'image' && layer.img) {
        ctx.drawImage(layer.img, -layer.width / 2, -layer.height / 2, layer.width, layer.height)
      }

      if (layer.type === 'text' || layer.type === 'sticker') {
        const fs = layer.fontSize || 48
        ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${fs}px ${layer.fontFamily || 'Inter'}`
        ctx.textAlign = (layer.align as CanvasTextAlign) || 'center'
        ctx.textBaseline = 'middle'
        const text = layer.content || ''
        if (layer.bgColor) {
          const m = ctx.measureText(text)
          const pad = 10
          ctx.fillStyle = layer.bgColor
          ctx.fillRect(-m.width / 2 - pad, -fs / 2 - pad, m.width + pad * 2, fs + pad * 2)
        }
        ctx.fillStyle = layer.color || '#ffffff'
        ctx.fillText(text, 0, 0)
      }

      // Selection indicator
      if (selected === layer.id) {
        ctx.strokeStyle = 'rgba(139,92,246,0.9)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 3])
        ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height)
      }

      ctx.restore()
    })
  }, [layers, selected, canvasSize])

  useEffect(() => { draw() }, [draw])

  // ── Mouse events ──────────────────────────────────────────
  const canvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    }
  }

  const hitTest = (x: number, y: number): Layer | null => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i]
      if (x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height) return l
    }
    return null
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = canvasCoords(e)
    const hit = hitTest(x, y)
    setSelected(hit?.id ?? null)
    if (hit) {
      setDragging(true)
      setDragStart({ x, y, lx: hit.x, ly: hit.y })
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !selected) return
    const { x, y } = canvasCoords(e)
    const dx = x - dragStart.x
    const dy = y - dragStart.y
    setLayers(ls => ls.map(l => l.id === selected ? { ...l, x: dragStart.lx + dx, y: dragStart.ly + dy } : l))
  }

  const onMouseUp = () => { setDragging(false) }

  // ── Layer actions ─────────────────────────────────────────
  const updateSelected = (patch: Partial<Layer>) => {
    setLayers(ls => ls.map(l => l.id === selected ? { ...l, ...patch } : l))
  }

  const addText = () => {
    const layer: Layer = {
      id: genId(), type: 'text', content: 'Votre texte',
      x: canvasSize.w / 2 - 150, y: canvasSize.h / 2 - 30,
      width: 300, height: 60, fontSize: 48, color: '#ffffff',
      fontFamily: 'Inter', bold: false, italic: false, align: 'center',
      rotation: 0, opacity: 1,
    }
    setLayers(ls => [...ls, layer])
    setSelected(layer.id)
    setActiveTab('text')
  }

  const addSticker = (sticker: string) => {
    const layer: Layer = {
      id: genId(), type: 'sticker', content: sticker,
      x: canvasSize.w / 2 - 60, y: canvasSize.h / 2 - 60,
      width: 120, height: 120, fontSize: 96,
      rotation: 0, opacity: 1,
    }
    setLayers(ls => [...ls, layer])
    setSelected(layer.id)
  }

  const addImageLayer = (f: File) => {
    const url = URL.createObjectURL(f)
    const img = new window.Image()
    img.onload = () => {
      const layer: Layer = {
        id: genId(), type: 'image', src: url, img,
        x: 50, y: 50, width: 300, height: 300, rotation: 0, opacity: 1,
      }
      setLayers(ls => [...ls, layer])
      setSelected(layer.id)
    }
    img.src = url
  }

  const deleteSelected = () => {
    if (!selected) return
    setLayers(ls => ls.filter(l => l.id !== selected))
    setSelected(null)
  }

  const duplicateSelected = () => {
    if (!selected) return
    const orig = layers.find(l => l.id === selected)
    if (!orig) return
    const copy = { ...orig, id: genId(), x: orig.x + 20, y: orig.y + 20 }
    setLayers(ls => [...ls, copy])
    setSelected(copy.id)
  }

  const moveLayer = (dir: 'up' | 'down') => {
    if (!selected) return
    setLayers(ls => {
      const idx = ls.findIndex(l => l.id === selected)
      if (idx < 0) return ls
      const next = [...ls]
      if (dir === 'up' && idx < next.length - 1) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      } else if (dir === 'down' && idx > 0) {
        [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]]
      }
      return next
    })
  }

  const changeAspectRatio = (id: string) => {
    const ar = ASPECT_RATIOS.find(a => a.id === id)!
    setAspectRatio(id)
    setCanvasSize({ w: ar.w, h: ar.h })
  }

  // ── Export ────────────────────────────────────────────────
  const handleExport = () => {
    const canvas = canvasRef.current!
    canvas.toBlob(blob => {
      if (blob) onExport(blob, caption)
    }, 'image/jpeg', 0.92)
  }

  // ── Rendering ─────────────────────────────────────────────
  const canvasPxW = canvasSize.w * scale
  const canvasPxH = canvasSize.h * scale

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Aspect ratio */}
        <select value={aspectRatio} onChange={e => changeAspectRatio(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500/40">
          {ASPECT_RATIOS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        <button onClick={addText} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:bg-white/10 transition-all">
          <Type size={13} />Texte
        </button>
        <button onClick={() => extraInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:bg-white/10 transition-all">
          <ImageIcon size={13} />Image
        </button>
        <input ref={extraInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => Array.from(e.target.files || []).forEach(addImageLayer)} />
        <button onClick={() => setActiveTab('stickers')} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:bg-white/10 transition-all">
          <Smile size={13} />Stickers
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          {selected && <>
            <button onClick={duplicateSelected} title="Dupliquer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Copy size={13} /></button>
            <button onClick={() => moveLayer('up')} title="Couche au-dessus" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><ChevronUp size={13} /></button>
            <button onClick={() => moveLayer('down')} title="Couche en-dessous" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><ChevronDown size={13} /></button>
            <button onClick={deleteSelected} title="Supprimer" className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={13} /></button>
          </>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Canvas Preview ── */}
        <div className="lg:col-span-2">
          <div ref={previewRef} className="w-full">
            <div className="relative bg-black rounded-xl overflow-hidden border border-white/10 mx-auto"
              style={{ width: canvasPxW, height: canvasPxH }}>
              <canvas
                ref={canvasRef}
                width={canvasSize.w}
                height={canvasSize.h}
                style={{ width: canvasPxW, height: canvasPxH, cursor: dragging ? 'grabbing' : selected ? 'grab' : 'default' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                className="block"
              />
              {!selected && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded-lg text-xs text-gray-500">
                  Cliquez sur un élément pour le sélectionner
                </div>
              )}
              {selected && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded-lg text-xs text-purple-300 flex items-center gap-1.5">
                  <Move size={11} />Glissez pour déplacer
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div className="space-y-4">

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            {[
              { id: 'layers',   label: 'Calques', Icon: Layers },
              { id: 'text',     label: 'Texte',   Icon: Type },
              { id: 'stickers', label: 'Stickers', Icon: Smile },
            ].map(tab => {
              const Icon = tab.Icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                    activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
                  <Icon size={12} />{tab.label}
                </button>
              )
            })}
          </div>

          {/* Layers tab */}
          {activeTab === 'layers' && (
            <div className="glass rounded-xl border border-white/5 p-3">
              <p className="text-xs text-gray-600 mb-2">{layers.length} calque{layers.length > 1 ? 's' : ''}</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...layers].reverse().map(l => (
                  <button key={l.id} onClick={() => setSelected(l.id === selected ? null : l.id)}
                    className={cn('w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs',
                      selected === l.id ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'bg-white/3 border border-white/5 text-gray-400 hover:bg-white/8')}>
                    <span className="flex-shrink-0">{l.type === 'image' ? <ImageIcon size={11} /> : l.type === 'sticker' ? <span>{l.content}</span> : <Type size={11} />}</span>
                    <span className="truncate">{l.type === 'image' ? 'Image' : l.content || 'Texte'}</span>
                  </button>
                ))}
                {layers.length === 0 && <p className="text-xs text-gray-700 text-center py-4">Aucun calque</p>}
              </div>
            </div>
          )}

          {/* Text tab */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              {(!selectedLayer || selectedLayer.type !== 'text') ? (
                <div className="glass rounded-xl border border-white/5 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-3">Aucun texte sélectionné</p>
                  <button onClick={addText} className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs text-purple-300 hover:bg-purple-500/30 transition-all mx-auto">
                    <Plus size={12} />Ajouter du texte
                  </button>
                </div>
              ) : (
                <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
                  <textarea value={selectedLayer.content || ''} onChange={e => updateSelected({ content: e.target.value })}
                    rows={3} placeholder="Votre texte..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/40 focus:outline-none resize-none" />

                  {/* Font size */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Taille</label>
                    <input type="range" min={12} max={200} value={selectedLayer.fontSize || 48}
                      onChange={e => updateSelected({ content: selectedLayer.content, fontSize: Number(e.target.value), width: Math.max(Number(e.target.value) * (selectedLayer.content?.length || 10) * 0.6, 100), height: Number(e.target.value) * 1.5 })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-8 text-right tabular-nums">{selectedLayer.fontSize || 48}</span>
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Couleur</label>
                    <input type="color" value={selectedLayer.color || '#ffffff'}
                      onChange={e => updateSelected({ color: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                    <div className="flex gap-1 ml-2">
                      {['#ffffff', '#000000', '#a855f7', '#06b6d4', '#f59e0b', '#ef4444'].map(c => (
                        <button key={c} onClick={() => updateSelected({ color: c })}
                          className={cn('w-5 h-5 rounded-full border-2 transition-all', selectedLayer.color === c ? 'border-white scale-110' : 'border-white/20')}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>

                  {/* Fond */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Fond</label>
                    <button onClick={() => updateSelected({ bgColor: selectedLayer.bgColor ? undefined : 'rgba(0,0,0,0.5)' })}
                      className={cn('px-2.5 py-1 rounded-lg text-xs border transition-all', selectedLayer.bgColor ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-white/10 text-gray-500 hover:text-gray-300')}>
                      {selectedLayer.bgColor ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>

                  {/* Font */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Police</label>
                    <select value={selectedLayer.fontFamily || 'Inter'} onChange={e => updateSelected({ fontFamily: e.target.value })}
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  {/* Style */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Style</label>
                    <div className="flex gap-1">
                      <button onClick={() => updateSelected({ bold: !selectedLayer.bold })}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border font-bold transition-all', selectedLayer.bold ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-gray-500')}>B</button>
                      <button onClick={() => updateSelected({ italic: !selectedLayer.italic })}
                        className={cn('px-2.5 py-1 rounded-lg text-xs border italic transition-all', selectedLayer.italic ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-gray-500')}>I</button>
                    </div>
                    <div className="flex gap-1 ml-1">
                      {(['left','center','right'] as const).map(a => {
                        const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight
                        return (
                          <button key={a} onClick={() => updateSelected({ align: a })}
                            className={cn('p-1.5 rounded-lg border transition-all', selectedLayer.align === a ? 'bg-white/20 border-white/40 text-white' : 'border-white/10 text-gray-500 hover:text-gray-300')}>
                            <Icon size={11} />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Rotation</label>
                    <input type="range" min={-180} max={180} value={selectedLayer.rotation}
                      onChange={e => updateSelected({ rotation: Number(e.target.value) })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-10 text-right tabular-nums">{selectedLayer.rotation}°</span>
                  </div>

                  {/* Opacité */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12 flex-shrink-0">Opacité</label>
                    <input type="range" min={0.1} max={1} step={0.05} value={selectedLayer.opacity}
                      onChange={e => updateSelected({ opacity: Number(e.target.value) })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-10 text-right tabular-nums">{Math.round(selectedLayer.opacity * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Image layer controls */}
              {selectedLayer && selectedLayer.type === 'image' && (
                <div className="glass rounded-xl border border-white/5 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400">Image sélectionnée</p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-16 flex-shrink-0">Largeur</label>
                    <input type="range" min={50} max={canvasSize.w} value={selectedLayer.width}
                      onChange={e => updateSelected({ width: Number(e.target.value) })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-12 text-right tabular-nums">{Math.round(selectedLayer.width)}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-16 flex-shrink-0">Hauteur</label>
                    <input type="range" min={50} max={canvasSize.h} value={selectedLayer.height}
                      onChange={e => updateSelected({ height: Number(e.target.value) })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-12 text-right tabular-nums">{Math.round(selectedLayer.height)}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-16 flex-shrink-0">Rotation</label>
                    <input type="range" min={-180} max={180} value={selectedLayer.rotation}
                      onChange={e => updateSelected({ rotation: Number(e.target.value) })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-12 text-right tabular-nums">{selectedLayer.rotation}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-16 flex-shrink-0">Opacité</label>
                    <input type="range" min={0.1} max={1} step={0.05} value={selectedLayer.opacity}
                      onChange={e => updateSelected({ opacity: Number(e.target.value) })}
                      className="flex-1 accent-purple-500" />
                    <span className="text-xs text-white w-12 text-right tabular-nums">{Math.round(selectedLayer.opacity * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stickers tab */}
          {activeTab === 'stickers' && (
            <div className="glass rounded-xl border border-white/5 p-4">
              <p className="text-xs text-gray-500 mb-3">Cliquez pour ajouter</p>
              <div className="grid grid-cols-5 gap-2">
                {STICKERS.map(s => (
                  <button key={s} onClick={() => addSticker(s)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 text-xl transition-all hover:scale-110">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption field */}
          <div className="glass rounded-xl border border-white/5 p-4">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
              <Type size={12} />Caption
            </label>
            <textarea value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Ajoutez une caption pour ce contenu..."
              rows={2}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <button onClick={onCancel} className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-gray-300 transition-all">
          Annuler
        </button>
        <button onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20">
          <Download size={16} />
          Exporter l'édition
        </button>
      </div>
    </div>
  )
}
