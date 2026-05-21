'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Download, Trash2, Settings, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface ModelProfile {
  id: string
  profile_id: string
  profile_name: string
  platform: string
  tool: string
}

interface Model {
  id: string
  name: string
  platform: string
  status: string
  profiles?: ModelProfile[]
}

interface ImportedProfile {
  id: string
  name: string
}

export default function AccountsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [importing, setImporting] = useState<Record<string, boolean>>({})
  const [showImportModal, setShowImportModal] = useState(false)
  const [importingTool, setImportingTool] = useState<'adspower' | 'geelark' | ''>('')
  const [importedProfiles, setImportedProfiles] = useState<ImportedProfile[]>([])

  const [form, setForm] = useState({
    name: '',
    platform: 'onlyfans',
    tool: 'adspower',
    profile_id: '',
    profile_name: '',
  })

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const res = await fetch('/api/models')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Erreur lors du chargement des modèles')
    } finally {
      setLoading(false)
    }
  }

  const handleImportProfiles = async (tool: 'adspower' | 'geelark') => {
    setImportingTool(tool)
    setImporting({ ...importing, [tool]: true })
    try {
      const res = await fetch('/api/accounts/profiles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: form.name || 'temp',
          tool,
        }),
      })

      if (!res.ok) throw new Error('Import failed')
      const data = await res.json()
      setImportedProfiles(data.profiles || [])
      setShowImportModal(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setImporting({ ...importing, [tool]: false })
    }
  }

  const handleSelectProfile = (profile: ImportedProfile) => {
    setForm({
      ...form,
      profile_id: profile.id,
      profile_name: profile.name,
    })
    setShowImportModal(false)
  }

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Nom du modèle requis')
      return
    }

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          platform: form.platform,
          profile_id: form.profile_id || null,
          profile_tool: form.tool,
          profile_name: form.profile_name || null,
        }),
      })

      if (!res.ok) throw new Error('Create failed')
      await loadModels()
      setShowForm(false)
      setForm({
        name: '',
        platform: 'onlyfans',
        tool: 'adspower',
        profile_id: '',
        profile_name: '',
      })
      toast.success('Modèle créé ✅')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Êtes-vous sûr ?')) return

    try {
      const res = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      await loadModels()
      toast.success('Modèle supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users size={28} className="text-purple-400" />
            <h1 className="text-2xl font-bold">Comptes Modèles</h1>
          </div>
          <p className="text-gray-400">Gérez vos profils AdsPower/GeeLark par modèle</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Ajouter un modèle
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : models.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">Aucun modèle pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium"
          >
            <Plus size={16} />
            Créer le premier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map(model => (
            <div key={model.id} className="glass rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group">
              {/* Header with colorful avatar */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {model.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-cyan-300 transition-colors">{model.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">💱 {model.platform}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteModel(model.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
                  <p className="text-2xl font-bold text-cyan-400">3.2K</p>
                  <p className="text-xs text-gray-400 mt-1">Revenus mois</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-center">
                  <p className="text-2xl font-bold text-green-400">24</p>
                  <p className="text-xs text-gray-400 mt-1">Posts publiés</p>
                </div>
              </div>

              {/* Profils */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Connexions:</p>
                {model.profiles && model.profiles.length > 0 ? (
                  <div className="space-y-2">
                    {model.profiles.map(profile => (
                      <div
                        key={profile.id}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all"
                      >
                        <p className="font-medium text-gray-200 text-sm">{profile.profile_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 rounded text-purple-300 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            {profile.tool.toUpperCase()}
                          </span>
                          <span className="px-2.5 py-1 bg-cyan-500/20 rounded text-cyan-300 text-xs font-semibold">
                            {profile.platform.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic px-3 py-2 bg-white/3 rounded-lg">Pas de connexion configurée</p>
                )}
              </div>

              {/* Settings button */}
              <button className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-purple-600/40 to-cyan-600/40 hover:from-purple-600/60 hover:to-cyan-600/60 rounded-lg text-purple-300 transition-all font-medium">
                <Settings size={14} />
                Configurer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">Ajouter un modèle</h2>
            <form onSubmit={handleCreateModel} className="space-y-4">
              {/* Nom du modèle */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nom du modèle</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Leelou, Sophie, etc."
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              {/* Plateforme */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Plateforme</label>
                <select
                  value={form.platform}
                  onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60"
                >
                  <option value="onlyfans">OnlyFans</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>

              {/* Outil */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Outil d'automatisation</label>
                <select
                  value={form.tool}
                  onChange={e => setForm({ ...form, tool: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60"
                >
                  <option value="adspower">AdsPower</option>
                  <option value="geelark">GeeLark</option>
                  <option value="none">Aucun</option>
                </select>
              </div>

              {/* Profil */}
              {form.tool !== 'none' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Profil</label>
                    {form.profile_name ? (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-400">{form.profile_name}</p>
                          <p className="text-xs text-green-300/60">{form.profile_id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              profile_id: '',
                              profile_name: '',
                            })
                          }
                          className="text-sm text-green-400 hover:text-green-300"
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImportProfiles(form.tool as 'adspower' | 'geelark')}
                        disabled={importing[form.tool]}
                        className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-white/5 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-white/10 disabled:opacity-50 transition-all"
                      >
                        {importing[form.tool] ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Import...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Importer depuis {form.tool.toUpperCase()}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 glass rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Sélectionner un profil</h2>
            <div className="space-y-2">
              {importedProfiles.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Aucun profil trouvé</p>
              ) : (
                importedProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className="w-full p-4 text-left bg-white/5 hover:bg-white/10 border border-purple-500/20 rounded-xl transition-all group"
                  >
                    <p className="font-medium group-hover:text-purple-400">{profile.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{profile.id}</p>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full mt-4 py-2.5 glass rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
