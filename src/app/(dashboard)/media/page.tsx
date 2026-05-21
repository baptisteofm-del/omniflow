'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Download, Trash2, Search, Filter, Grid3x3, List, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface MediaFile {
  id: string
  name: string
  type: 'video' | 'image'
  size_bytes: number
  duration_seconds?: number
  public_url: string
  storage_path: string
  source: string
  is_published: boolean
  created_at: string
  tags: string[]
  platform?: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all')
  const [filterSource, setFilterSource] = useState<'all' | 'upload' | 'ai_generated' | 'spoofed'>('all')
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Load media files
  useEffect(() => {
    loadMediaFiles()
  }, [])

  // Filter files
  useEffect(() => {
    let filtered = files

    if (search) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.type === filterType)
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(f => f.source === filterSource)
    }

    setFilteredFiles(filtered)
  }, [files, search, filterType, filterSource])

  const loadMediaFiles = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!agency) return

      const { data: mediaFiles, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(mediaFiles || [])
    } catch (error) {
      console.error('Error loading media:', error)
      toast.error('Erreur lors du chargement des médias')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (newFiles: FileList) => {
    if (!newFiles.length) return

    try {
      setIsUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!agency) return

      const uploadedFiles: MediaFile[] = []

      for (const file of Array.from(newFiles)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${file.name}`
        const filePath = `${agency.id}/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file)

        if (uploadError) {
          toast.error(`Erreur upload: ${file.name}`)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)

        // Determine file type
        const type = file.type.startsWith('video') ? 'video' : 'image'

        // Insert into media_files table
        const { data: mediaRecord, error: dbError } = await supabase
          .from('media_files')
          .insert([
            {
              agency_id: agency.id,
              name: file.name,
              storage_path: filePath,
              public_url: publicUrl,
              type,
              size_bytes: file.size,
              source: 'upload',
              tags: [],
            },
          ])
          .select()
          .single()

        if (!dbError && mediaRecord) {
          uploadedFiles.push(mediaRecord)
        }
      }

      if (uploadedFiles.length > 0) {
        toast.success(`${uploadedFiles.length} fichier(s) uploadé(s)`)
        setFiles([...uploadedFiles, ...files])
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: string, storagePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('media').remove([storagePath])

      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      setFiles(files.filter(f => f.id !== fileId))
      toast.success('Média supprimé')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDownload = (publicUrl: string, fileName: string) => {
    const a = document.createElement('a')
    a.href = publicUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📱 Banque de médias</h1>
        <p className="text-gray-400">Organisez et réutilisez tous vos contenus générés</p>
      </div>

      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        onDrop={(e) => {
          e.preventDefault()
          handleFileUpload(e.dataTransfer.files)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          dropZoneRef.current?.classList.add('border-purple-500', 'bg-purple-500/5')
        }}
        onDragLeave={() => {
          dropZoneRef.current?.classList.remove('border-purple-500', 'bg-purple-500/5')
        }}
        className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors mb-8 bg-white/[0.02]"
      >
        <Upload size={40} className="mx-auto mb-3 text-gray-400" />
        <p className="text-white font-semibold mb-1">Déposez vos fichiers ici</p>
        <p className="text-gray-400 text-sm mb-4">ou</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Upload en cours...' : 'Parcourir'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-4">MP4, WebM, PNG, JPEG supportés</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search & Filters */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Tous les types</option>
              <option value="video">Vidéos</option>
              <option value="image">Images</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="px-3 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Toutes les sources</option>
              <option value="upload">Upload</option>
              <option value="ai_generated">IA Générée</option>
              <option value="spoofed">Spoofée</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400 mb-4">
        {filteredFiles.length} média{filteredFiles.length !== 1 ? 's' : ''} trouvé{filteredFiles.length !== 1 ? 's' : ''}
      </div>

      {/* Empty State */}
      {!isLoading && filteredFiles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">Aucun média trouvé</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative bg-white/5 border border-purple-500/10 rounded-lg overflow-hidden hover:border-purple-500/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-black/30 overflow-hidden">
                {file.type === 'video' ? (
                  <video
                    src={file.public_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={file.public_url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleDownload(file.public_url, file.name)}
                  title="Télécharger"
                  className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(file.id, file.storage_path)}
                  title="Supprimer"
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Info */}
              <div className="p-3 border-t border-purple-500/10">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-gray-400 text-xs">{formatFileSize(file.size_bytes)}</p>
                {file.is_published && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    ✓ Publié
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredFiles.length > 0 && (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 bg-white/5 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 flex-shrink-0 bg-black/30 rounded overflow-hidden">
                {file.type === 'video' ? (
                  <video
                    src={file.public_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={file.public_url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-gray-400 text-sm">
                  {file.type === 'video' ? '🎬 Vidéo' : '🖼️ Image'} • {formatFileSize(file.size_bytes)} • {formatDate(file.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(file.public_url, file.name)}
                  title="Télécharger"
                  className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(file.id, file.storage_path)}
                  title="Supprimer"
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
