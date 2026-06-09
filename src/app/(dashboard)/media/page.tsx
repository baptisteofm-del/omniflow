'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Upload, Download, Trash2, Search, Grid3x3, List, X, Plus,
  Folder, FolderOpen, Film, Image as ImageIcon, ChevronRight,
  FolderPlus, ArrowLeft, MoreVertical, Move, Tag, Check,
  Star, Layers, Send, Calendar, Zap, Copy
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────
interface MediaFile {
  id: string
  name: string
  type: 'video' | 'image'
  size_bytes: number
  public_url: string
  storage_path: string
  source: 'upload' | 'ai_generated' | 'edited' | 'spoofed' | 'imported'
  folder_id?: string
  tags?: string[]
  created_at: string
}

interface Folder {
  id: string
  name: string
  icon: string
  preset: boolean
  count?: number
}

// ── Dossiers prédéfinis ───────────────────────────────────────
const PRESET_FOLDERS: Folder[] = [
  { id: 'all',          name: 'Tous les médias', icon: 'grid',      preset: true },
  { id: 'auto_posting', name: 'Auto Posting',    icon: 'calendar',  preset: true },
  { id: 'star',    name: 'Instagram Reels', icon: 'star', preset: true },
  { id: 'tiktok',       name: 'TikTok',          icon: 'film',      preset: true },
  { id: 'twitter',      name: 'X / Twitter',     icon: 'twitter',   preset: true },
  { id: 'reddit',       name: 'Reddit',          icon: 'layers',    preset: true },
  { id: 'adspower',     name: 'ADS Power',       icon: 'zap',       preset: true },
  { id: 'telegram',     name: 'Telegram Bot',    icon: 'send',      preset: true },
]

const SOURCE_LABELS: Record<string, string> = {
  upload:       'Upload',
  ai_generated: 'Génération IA',
  edited:       'Édition',
  spoofed:      'Spoof',
  imported:     'Importé',
}
const SOURCE_COLORS: Record<string, string> = {
  upload:       'bg-blue-500/20 text-blue-400 border-blue-500/25',
  ai_generated: 'bg-purple-500/20 text-purple-400 border-purple-500/25',
  edited:       'bg-cyan-500/20 text-cyan-400 border-cyan-500/25',
  spoofed:      'bg-orange-500/20 text-orange-400 border-orange-500/25',
  imported:     'bg-gray-500/20 text-gray-400 border-gray-500/20',
}

function FolderIcon({ type, size = 16 }: { type: string; size?: number }) {
  const props = { size, className: 'text-gray-400' }
  switch (type) {
    case 'calendar':  return <Calendar {...props} />
    case 'star': return <Star {...props} />
    case 'film':      return <Film {...props} />
    case 'send':      return <Send {...props} />
    case 'layers':    return <Layers {...props} />
    case 'zap':       return <Zap {...props} />
    default:          return <Folder {...props} />
  }
}

function fmtSize(b: number): string {
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`
  if (b >= 1e3) return `${(b / 1e3).toFixed(0)} KB`
  return `${b} B`
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function MediaPage() {
  const [files, setFiles]             = useState<MediaFile[]>([])
  const [loading, setLoading]         = useState(true)
  const [uploading, setUploading]     = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [search, setSearch]           = useState('')
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType]   = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [activeFolder, setActiveFolder] = useState<string>('all')
  const [customFolders, setCustomFolders] = useState<Folder[]>([])
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [draggingOver, setDraggingOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // ── Load ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
      if (!agency) return

      const { data: media } = await supabase
        .from('media_files')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false })

      setFiles((media || []).map((f: any) => ({
        id: f.id,
        name: f.name || f.storage_path?.split('/').pop() || 'Fichier',
        type: f.type?.startsWith('video') || f.mime_type?.startsWith('video') ? 'video' : 'image',
        size_bytes: f.size || f.size_bytes || 0,
        public_url: f.public_url || f.url || '',
        storage_path: f.storage_path || '',
        source: f.source || 'upload',
        folder_id: f.folder_id || null,
        tags: f.tags || [],
        created_at: f.created_at || new Date().toISOString(),
      })))

      // Load custom folders from localStorage
      const saved = localStorage.getItem(`media_folders_${agency.id}`)
      if (saved) setCustomFolders(JSON.parse(saved))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return
    setUploading(true)
    setUploadProgress(0)

    const arr = Array.from(fileList)
    let done = 0

    for (const f of arr) {
      try {
        const fd = new FormData()
        fd.append('file', f)
        if (activeFolder !== 'all') fd.append('folder_id', activeFolder)
        const res = await fetch('/api/media', { method: 'POST', body: fd })
        if (!res.ok) throw new Error()
        done++
        setUploadProgress(Math.round((done / arr.length) * 100))
      } catch { toast.error(`Erreur upload : ${f.name}`) }
    }

    toast.success(`${done} fichier${done > 1 ? 's' : ''} importé${done > 1 ? 's' : ''}`)
    setUploading(false)
    setUploadProgress(0)
    await load()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggingOver(false)
    handleUpload(e.dataTransfer.files)
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Supprimer ${ids.length} fichier${ids.length > 1 ? 's' : ''} ?`)) return
    for (const id of ids) {
      await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
    }
    toast.success(`${ids.length} fichier${ids.length > 1 ? 's' : ''} supprimé${ids.length > 1 ? 's' : ''}`)
    setSelectedIds([])
    await load()
  }

  // ── Download ──────────────────────────────────────────────
  const handleDownload = (file: MediaFile) => {
    const a = document.createElement('a')
    a.href = file.public_url
    a.download = file.name
    a.target = '_blank'
    a.click()
  }

  // ── Move to folder ────────────────────────────────────────
  const handleMove = async (targetFolderId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency) return

    for (const id of selectedIds) {
      await supabase.from('media_files').update({
        folder_id: targetFolderId === 'all' ? null : targetFolderId
      }).eq('id', id).eq('agency_id', agency.id)
    }
    toast.success('Médias déplacés')
    setSelectedIds([])
    setShowMoveModal(false)
    await load()
  }

  // ── Create custom folder ──────────────────────────────────
  const createFolder = async () => {
    if (!newFolderName.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()

    const folder: Folder = {
      id: `custom_${Date.now()}`,
      name: newFolderName.trim(),
      icon: 'folder',
      preset: false,
    }
    const updated = [...customFolders, folder]
    setCustomFolders(updated)
    if (agency) localStorage.setItem(`media_folders_${agency.id}`, JSON.stringify(updated))
    setNewFolderName('')
    setShowNewFolder(false)
    toast.success(`Dossier "${folder.name}" créé`)
  }

  const deleteFolder = async (folderId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    const updated = customFolders.filter(f => f.id !== folderId)
    setCustomFolders(updated)
    if (agency) localStorage.setItem(`media_folders_${agency.id}`, JSON.stringify(updated))
    if (activeFolder === folderId) setActiveFolder('all')
    toast.success('Dossier supprimé')
  }

  // ── Filtered files ────────────────────────────────────────
  const filtered = files.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase())
    const matchType   = filterType === 'all' || f.type === filterType
    const matchSource = filterSource === 'all' || f.source === filterSource
    const matchFolder = activeFolder === 'all' || f.folder_id === activeFolder
    return matchSearch && matchType && matchSource && matchFolder
  })

  const allFolders = [...PRESET_FOLDERS, ...customFolders]

  // Folder counts
  const folderCounts: Record<string, number> = { all: files.length }
  customFolders.forEach(f => {
    folderCounts[f.id] = files.filter(m => m.folder_id === f.id).length
  })

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const activeFolderInfo = allFolders.find(f => f.id === activeFolder)

  return (
    <>
      <PageHeader
        icon={ImageIcon}
        title="Banque de médias"
        subtitle="Organisez et gérez vos fichiers"
        iconColor="text-purple-400"
        iconBg="bg-purple-500/10"
      />
      <div className="flex h-full">

      {/* ── SIDEBAR DOSSIERS ── */}
      <div className="w-56 flex-shrink-0 h-full border-r border-white/5 p-3 flex flex-col gap-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Dossiers</span>
          <button onClick={() => setShowNewFolder(true)}
            className="p-1 rounded-lg hover:bg-white/10 transition-all text-gray-600 hover:text-white">
            <FolderPlus size={13} />
          </button>
        </div>

        {/* Preset folders */}
        {PRESET_FOLDERS.map(folder => (
          <button key={folder.id} onClick={() => setActiveFolder(folder.id)}
            className={cn('flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left w-full',
              activeFolder === folder.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')}>
            <FolderIcon type={folder.icon} size={13} />
            <span className="flex-1 truncate">{folder.name}</span>
            {folder.id === 'all'
              ? <span className="text-gray-700 text-xs tabular-nums">{files.length}</span>
              : null
            }
          </button>
        ))}

        {/* Séparateur */}
        {customFolders.length > 0 && <div className="my-1.5 border-t border-white/5" />}

        {/* Custom folders */}
        {customFolders.map(folder => (
          <div key={folder.id} className="group relative">
            <button onClick={() => setActiveFolder(folder.id)}
              className={cn('flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left w-full',
                activeFolder === folder.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')}>
              <Folder size={13} className={activeFolder === folder.id ? 'text-purple-400' : 'text-gray-600'} />
              <span className="flex-1 truncate">{folder.name}</span>
              <span className="text-gray-700 text-xs tabular-nums">{folderCounts[folder.id] || 0}</span>
            </button>
            <button onClick={() => deleteFolder(folder.id)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
              <X size={10} />
            </button>
          </div>
        ))}

        {/* New folder form */}
        {showNewFolder && (
          <div className="flex items-center gap-1.5 px-1.5 mt-1">
            <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolder(false) }}
              placeholder="Nom du dossier"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500/40 focus:outline-none" />
            <button onClick={createFolder} className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-all">
              <Check size={11} />
            </button>
            <button onClick={() => setShowNewFolder(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-600 transition-all">
              <X size={11} />
            </button>
          </div>
        )}

        {/* Storage info */}
        <div className="mt-auto pt-3 border-t border-white/5 px-2">
          <div className="text-xs text-gray-600 mb-1.5">
            {files.length} fichier{files.length > 1 ? 's' : ''} · {fmtSize(files.reduce((s, f) => s + (f.size_bytes || 0), 0))}
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${Math.min((files.length / 1000) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {activeFolder === 'all' ? <Grid3x3 size={17} className="text-purple-400" /> : <FolderIcon type={activeFolderInfo?.icon || 'folder'} size={17} />}
              {activeFolderInfo?.name || 'Médias'}
            </h1>
            <span className="text-xs text-gray-600">{filtered.length} fichier{filtered.length > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none w-40" />
            </div>

            {/* Type filter */}
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
              {[{ id: 'all', label: 'Tout' }, { id: 'image', label: 'Images' }, { id: 'video', label: 'Vidéos' }].map(f => (
                <button key={f.id} onClick={() => setFilterType(f.id)}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                    filterType === f.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Source filter */}
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-purple-500/40">
              <option value="all">Toutes sources</option>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
                <Grid3x3 size={13} />
              </button>
              <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
                <List size={13} />
              </button>
            </div>

            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              <Upload size={13} />Importer
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={e => handleUpload(e.target.files)} />
          </div>
        </div>

        {/* Selection toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-purple-500/10 border-b border-purple-500/20">
            <span className="text-xs text-purple-300 font-medium">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
            <button onClick={() => setShowMoveModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10 transition-all">
              <Move size={11} />Déplacer vers
            </button>
            <button onClick={() => handleDelete(selectedIds)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/15 transition-all">
              <Trash2 size={11} />Supprimer
            </button>
            <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Annuler
            </button>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="px-5 py-2.5 border-b border-white/5 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className="text-xs text-gray-500 tabular-nums">{uploadProgress}%</span>
          </div>
        )}

        {/* Drop zone + content */}
        <div
          className={cn('flex-1 overflow-y-auto p-5 transition-all', draggingOver && 'bg-purple-500/5 ring-2 ring-inset ring-purple-500/20')}
          onDragOver={e => { e.preventDefault(); setDraggingOver(true) }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {activeFolder === 'all' ? <Upload size={22} className="text-gray-600" /> : <Folder size={22} className="text-gray-600" />}
              </div>
              <p className="text-gray-400 font-medium mb-1">
                {search || filterType !== 'all' || filterSource !== 'all' ? 'Aucun résultat' : 'Dossier vide'}
              </p>
              <p className="text-gray-600 text-sm mb-5">
                {draggingOver ? 'Relâchez pour importer' : 'Glissez-déposez ou cliquez sur Importer'}
              </p>
              {!search && filterType === 'all' && filterSource === 'all' && (
                <button onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
                  <Upload size={14} />Importer des médias
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            // ── GRID VIEW ──
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filtered.map(file => (
                <div key={file.id}
                  onClick={() => toggleSelect(file.id)}
                  className={cn('group relative rounded-xl overflow-hidden border transition-all cursor-pointer',
                    selectedIds.includes(file.id)
                      ? 'border-purple-500/60 ring-2 ring-purple-500/30'
                      : 'border-white/5 hover:border-white/20')}>

                  {/* Thumbnail */}
                  <div className="aspect-square bg-black/30 relative">
                    {file.type === 'image' ? (
                      <img src={file.public_url} alt={file.name} loading="lazy"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <Film size={28} className="text-gray-600" />
                      </div>
                    )}

                    {/* Select indicator */}
                    <div className={cn('absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      selectedIds.includes(file.id) ? 'bg-purple-500 border-purple-500' : 'border-white/30 bg-black/30 opacity-0 group-hover:opacity-100')}>
                      {selectedIds.includes(file.id) && <Check size={11} className="text-white" />}
                    </div>

                    {/* Source badge */}
                    {file.source !== 'upload' && (
                      <div className={cn('absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded border font-medium', SOURCE_COLORS[file.source])}>
                        {SOURCE_LABELS[file.source]?.split(' ')[0]}
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2 gap-1">
                      <button onClick={e => { e.stopPropagation(); handleDownload(file) }}
                        className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all">
                        <Download size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete([file.id]) }}
                        className="p-1.5 rounded-lg bg-red-500/30 backdrop-blur-sm text-red-300 hover:bg-red-500/50 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2 bg-black/20">
                    <p className="text-xs text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{fmtSize(file.size_bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ── LIST VIEW ──
            <div className="space-y-1">
              {filtered.map(file => (
                <div key={file.id} onClick={() => toggleSelect(file.id)}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer group',
                    selectedIds.includes(file.id) ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/3')}>

                  {/* Checkbox */}
                  <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    selectedIds.includes(file.id) ? 'bg-purple-500 border-purple-500' : 'border-white/20')}>
                    {selectedIds.includes(file.id) && <Check size={9} className="text-white" />}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {file.type === 'image' ? (
                      <img src={file.public_url} alt={file.name} className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Film size={15} className="text-gray-600" /></div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-xs px-1.5 py-0 border rounded', SOURCE_COLORS[file.source])}>{SOURCE_LABELS[file.source] || 'Upload'}</span>
                    </div>
                  </div>

                  <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:block">{fmtSize(file.size_bytes)}</span>
                  <span className="text-xs text-gray-600 flex-shrink-0 hidden md:block tabular-nums">{fmtDate(file.created_at)}</span>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); handleDownload(file) }} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                      <Download size={12} className="text-gray-400" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete([file.id]) }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                      <Trash2 size={12} className="text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MOVE MODAL ── */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMoveModal(false)}>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Move size={14} className="text-purple-400" />
              Déplacer {selectedIds.length} fichier{selectedIds.length > 1 ? 's' : ''} vers
            </h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {allFolders.map(folder => (
                <button key={folder.id} onClick={() => handleMove(folder.id)}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all',
                    folder.id === activeFolder ? 'border-purple-500/30 bg-purple-500/10 text-purple-300' : 'border-white/8 text-gray-400 hover:bg-white/5')}>
                  <FolderIcon type={folder.icon} size={13} />
                  <span className="text-xs font-medium">{folder.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowMoveModal(false)} className="w-full mt-3 py-2 border border-white/10 rounded-xl text-gray-400 text-xs hover:bg-white/5 transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
