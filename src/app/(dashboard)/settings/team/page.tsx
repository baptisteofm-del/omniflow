'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Mail, Trash2, Loader2, AlertCircle, Check, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface TeamMember {
  id: string
  email: string
  role: string
  joined_at: string
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  created_at: string
}

export default function TeamPage() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
  })

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    try {
      const res = await fetch('/api/settings/team')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setMembers(data.members)
      setInvitations(data.invitations)
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Erreur lors du chargement de l\'équipe')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!formData.email.trim()) {
      toast.error('L\'email est requis')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Email invalide')
      return
    }

    setInviting(true)
    try {
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast.success(`Invitation envoyée à ${formData.email}`)
      setFormData({ email: '', role: 'member' })
      setShowInviteModal(false)
      await loadTeam()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr? Cette action ne peut pas être annulée.')) return

    setDeleting(memberId)
    try {
      const res = await fetch('/api/settings/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to remove')
      }

      toast.success('Membre supprimé')
      await loadTeam()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setDeleting(null)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Propriétaire',
      admin: 'Administrateur',
      member: 'Membre',
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-500/20 text-purple-300',
      admin: 'bg-blue-500/20 text-blue-300',
      member: 'bg-gray-500/20 text-gray-300',
    }
    return colors[role] || colors.member
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

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-purple-400" />
            <h1 className="text-2xl font-bold">Gestion de l'équipe</h1>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all"
          >
            <Plus size={18} />
            Inviter un membre
          </button>
        </div>
        <p className="text-gray-400">Gérez les membres de votre agence et leurs permissions</p>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 border border-purple-500/30 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Inviter un membre</h2>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="membre@example.com"
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Rôle</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60"
                >
                  <option value="member">Membre</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Envoyer invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Membres actifs ({members.length})</h2>
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="glass rounded-2xl p-8 border border-purple-500/10 text-center text-gray-400">
              Pas encore de membres
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="glass rounded-xl p-4 border border-purple-500/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                    {member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-xs text-gray-400">
                      Rejoint le {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={deleting === member.id}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === member.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Invitations en attente ({invitations.length})</h2>
          <div className="space-y-2">
            {invitations.map(invitation => (
              <div
                key={invitation.id}
                className="glass rounded-xl p-4 border border-yellow-500/10 flex items-center justify-between bg-yellow-500/5"
              >
                <div className="flex items-center gap-4">
                  <Clock className="text-yellow-400" size={20} />
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-xs text-gray-400">
                      Invité le {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-500/20 text-yellow-300">
                  En attente...
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
            <p className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              Les invitations expirent après 7 jours
            </p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-gray-300">
        <p className="font-medium mb-2">💡 Rôles et permissions:</p>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• <strong>Propriétaire</strong> - Accès complet, gestion de l'équipe et facturation</li>
          <li>• <strong>Administrateur</strong> - Accès complet aux outils, pas de gestion d'équipe</li>
          <li>• <strong>Membre</strong> - Accès aux outils de base, pas d'accès aux paramètres</li>
        </ul>
      </div>
    </div>
  )
}
