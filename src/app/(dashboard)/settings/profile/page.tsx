'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, Globe, Save, Loader2, Upload, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

interface ProfileData {
  user: {
    id: string
    email: string
    name: string
    avatar_url?: string
  }
  agency: {
    id: string
    name: string
  }
}

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    timezone: 'UTC',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/settings/profile')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setProfile(data)
      setFormData(prev => ({
        ...prev,
        name: data.agency.name || '',
        timezone: data.user.timezone || 'UTC',
      }))
      if (data.user.avatar_url) {
        setAvatarPreview(data.user.avatar_url)
      }
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 5MB')
        return
      }

      setAvatar(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatar || !profile) return null

    setUploading(true)
    try {
      const ext = avatar.name.split('.').pop()
      const fileName = `${profile.agency.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatar, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      return data.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors du téléchargement de l\'image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom de l\'agence est requis')
      return
    }

    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        toast.error('L\'ancien mot de passe est requis')
        return
      }
      if (!formData.newPassword) {
        toast.error('Le nouveau mot de passe est requis')
        return
      }
      if (formData.newPassword !== formData.newPasswordConfirm) {
        toast.error('Les mots de passe ne correspondent pas')
        return
      }
      if (formData.newPassword.length < 8) {
        toast.error('Le mot de passe doit faire au moins 8 caractères')
        return
      }
    }

    setSaving(true)
    try {
      let avatar_url: string | undefined = undefined

      // Upload avatar if changed
      if (avatar) {
        avatar_url = await uploadAvatar() || undefined
      }

      // Save profile
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          timezone: formData.timezone,
          avatar_url,
          ...(formData.newPassword && {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Save failed')
      }

      toast.success('Profil mis à jour ✅')
      setAvatar(null)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      }))
      await loadProfile()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return <div className="p-8 text-red-400">Erreur: Impossible de charger le profil</div>
  }

  // Generate initials avatar
  const initials = profile.agency.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  const colors = [
    'from-purple-600 to-cyan-600',
    'from-pink-600 to-orange-600',
    'from-blue-600 to-green-600',
    'from-yellow-600 to-red-600',
  ]
  const colorClass = colors[initials.charCodeAt(0) % colors.length]

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User size={28} className="text-purple-400" />
          <h1 className="text-2xl font-bold">Profil de l'agence</h1>
        </div>
        <p className="text-gray-400">Gérez vos informations personnelles et les paramètres de sécurité</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="glass rounded-2xl p-6 border border-purple-500/10">
          <h2 className="text-lg font-bold mb-4">Avatar</h2>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-2xl font-bold text-white flex-shrink-0`}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 cursor-pointer transition-all inline-flex">
                <Upload size={16} />
                Changer l'image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF jusqu'à 5MB</p>
            </div>
          </div>
        </div>

        {/* Agency Info */}
        <div className="glass rounded-2xl p-6 border border-purple-500/10">
          <h2 className="text-lg font-bold mb-4">Informations de l'agence</h2>
          <div className="space-y-4">
            {/* Agency Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nom de l'agence</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email (non modifiable)</label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-400">
                <Mail size={18} />
                {profile.user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Pour des raisons de sécurité, l'email ne peut pas être changé</p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Fuseau horaire</label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white">
                <Globe size={18} className="text-purple-400 flex-shrink-0" />
                <select
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  className="flex-1 bg-transparent outline-none"
                >
                  <option value="UTC">UTC (UTC+0)</option>
                  <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
                  <option value="Europe/London">Europe/London (UTC+0/+1)</option>
                  <option value="America/New_York">America/New_York (UTC-5/-4)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (UTC-8/-7)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                  <option value="Australia/Sydney">Australia/Sydney (UTC+10/+11)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass rounded-2xl p-6 border border-purple-500/10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lock size={18} className="text-yellow-400" />
            Sécurité
          </h2>
          <p className="text-sm text-gray-400 mb-4">Optionnel: Laissez vide pour ne pas changer le mot de passe</p>
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Ancien mot de passe</label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nouveau mot de passe</label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                  placeholder="Entrez un nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Minimum 8 caractères</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.newPasswordConfirm}
                  onChange={e => setFormData({ ...formData, newPasswordConfirm: e.target.value })}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {saving || uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save size={18} />
              Sauvegarder les modifications
            </>
          )}
        </button>
      </div>
    </div>
  )
}
