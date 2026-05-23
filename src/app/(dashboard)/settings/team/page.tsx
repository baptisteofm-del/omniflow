'use client'
import { useState, useEffect } from 'react'
import {
  Users, Plus, Mail, Trash2, Loader2, Check, Clock,
  X, ChevronDown, Shield, Settings, Film, MessageSquare,
  TrendingUp, Edit2, MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────
interface TeamMember {
  id: string
  email: string
  role: string
  permissions: string[]
  joined_at: string
  status: 'active' | 'invited' | 'suspended'
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  created_at: string
}

// ── Rôles prédéfinis ──────────────────────────────────────────
const ROLES = [
  {
    id: 'video_editor',
    label: 'Monteur Vidéo',
    icon: Film,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    desc: 'Accès strictement limité à Édition & Spoof',
    permissions: ['editor'],
    locked: true, // permissions non modifiables
  },
  {
    id: 'chatting_manager',
    label: 'Manager Chatting',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    desc: 'Chatting IA et Rapports Chatting',
    permissions: ['chatting_ai', 'chatting_reports'],
    locked: false,
  },
  {
    id: 'marketing_manager',
    label: 'Manager Marketing',
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    desc: 'Toutes les fonctionnalités marketing',
    permissions: ['veille', 'posting', 'ai_generation', 'telegram', 'media'],
    locked: false,
  },
  {
    id: 'admin',
    label: 'Administrateur',
    icon: Shield,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    desc: 'Accès complet à toutes les fonctionnalités',
    permissions: ['all'],
    locked: false,
  },
]

// ── Pages disponibles ──────────────────────────────────────────
const ALL_PAGES = [
  { id: 'editor',          label: 'Édition & Spoof',     section: 'Marketing' },
  { id: 'posting',         label: 'Auto Posting',         section: 'Marketing' },
  { id: 'veille',          label: 'Veille Trends',        section: 'Marketing' },
  { id: 'ai_generation',   label: 'Génération IA',        section: 'Marketing' },
  { id: 'telegram',        label: 'Bot Telegram',         section: 'Marketing' },
  { id: 'media',           label: 'Banque de médias',     section: 'Marketing' },
  { id: 'chatting_ai',     label: 'Chatting IA',          section: 'Chatting' },
  { id: 'chatting_reports',label: 'Rapports Chatting',    section: 'Chatting' },
  { id: 'finance',         label: 'Finance',              section: 'Pilotage' },
  { id: 'accounts',        label: 'Modèles',              section: 'Pilotage' },
  { id: 'prospection',     label: 'Recrutement',          section: 'Pilotage' },
]

const SECTIONS = ['Marketing', 'Chatting', 'Pilotage']

// ── Permissions Modal ─────────────────────────────────────────
function PermissionsModal({ member, onClose, onSave }: {
  member: TeamMember
  onClose: () => void
  onSave: (id: string, role: string, permissions: string[]) => Promise<void>
}) {
  const [role, setRole] = useState(member.role)
  const [perms, setPerms] = useState<string[]>(
    member.permissions?.length ? member.permissions :
    ROLES.find(r => r.id === member.role)?.permissions || []
  )
  const [saving, setSaving] = useState(false)

  const currentRole = ROLES.find(r => r.id === role)
  const isLocked = currentRole?.locked

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    const r = ROLES.find(x => x.id === newRole)
    if (r) setPerms(r.permissions)
  }

  const togglePerm = (pageId: string) => {
    if (isLocked) return
    setPerms(prev => prev.includes('all') ? ALL_PAGES.filter(p => p.id !== pageId).map(p => p.id)
      : prev.includes(pageId) ? prev.filter(p => p !== pageId) : [...prev, pageId])
  }

  const hasPerm = (pageId: string) => perms.includes('all') || perms.includes(pageId)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="font-semibold text-white text-sm">Modifier les permissions</h3>
            <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all"><X size={14} className="text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-5">

          {/* Sélection du rôle */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Rôle</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon
                return (
                  <button key={r.id} onClick={() => handleRoleChange(r.id)}
                    className={cn('flex items-center gap-2 p-3 rounded-xl border text-left transition-all',
                      role === r.id ? r.bg : 'border-white/8 hover:border-white/15')}>
                    <Icon size={13} className={role === r.id ? r.color : 'text-gray-600'} />
                    <div>
                      <p className="text-xs font-semibold text-white">{r.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-tight">{r.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Permissions granulaires */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Accès aux pages</label>
              {isLocked && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <Shield size={10} />Permissions fixes pour ce rôle
                </span>
              )}
            </div>
            <div className="space-y-3">
              {SECTIONS.map(section => {
                const pages = ALL_PAGES.filter(p => p.section === section)
                return (
                  <div key={section}>
                    <p className="text-xs text-gray-600 uppercase tracking-widest mb-1.5 px-1">{section}</p>
                    <div className="space-y-1">
                      {pages.map(page => (
                        <label key={page.id}
                          className={cn('flex items-center justify-between px-3 py-2 rounded-xl border transition-all',
                            hasPerm(page.id) ? 'border-purple-500/25 bg-purple-500/5' : 'border-white/5 bg-white/3',
                            isLocked ? 'opacity-60' : 'cursor-pointer hover:bg-white/5')}>
                          <span className="text-xs text-gray-300">{page.label}</span>
                          <input type="checkbox" checked={hasPerm(page.id)} onChange={() => togglePerm(page.id)}
                            disabled={isLocked} className="accent-purple-500" />
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">Annuler</button>
          <button onClick={async () => { setSaving(true); await onSave(member.id, role, perms); setSaving(false) }} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function TeamPage() {
  const [loading, setLoading]           = useState(true)
  const [owner, setOwner]               = useState<{id: string; email: string; name?: string | null} | null>(null)
  const [members, setMembers]           = useState<TeamMember[]>([])
  const [invitations, setInvitations]   = useState<TeamInvitation[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingMember, setEditingMember]     = useState<TeamMember | null>(null)
  const [inviting, setInviting]         = useState(false)
  const [form, setForm]                 = useState({ email: '', role: 'chatting_manager' })

  useEffect(() => { loadTeam() }, [])

  const loadTeam = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/team')
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.owner) setOwner(data.owner)
      setMembers((data.members || []).map((m: any) => ({
        ...m,
        permissions: m.permissions || ROLES.find(r => r.id === m.role)?.permissions || [],
        status: m.status || 'active',
      })))
      setInvitations(data.invitations || [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  const handleInvite = async () => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Email invalide')
      return
    }
    setInviting(true)
    try {
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          role: form.role,
          permissions: ROLES.find(r => r.id === form.role)?.permissions || [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'invitation')
      if (data.inviteUrl && data.message?.includes('lien')) {
        toast.success('Invitation créée. Lien copié dans le presse-papier !')
        try { await navigator.clipboard.writeText(data.inviteUrl) } catch {}
      } else {
        toast.success(`Invitation envoyée à ${form.email}`)
      }
      setShowInviteModal(false)
      setForm({ email: '', role: 'chatting_manager' })
      await loadTeam()
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleDelete = async (id: string, type: 'member' | 'invitation') => {
    if (!confirm('Supprimer ce membre/invitation ?')) return
    try {
      await fetch(`/api/settings/team?id=${id}&type=${type}`, { method: 'DELETE' })
      toast.success('Supprimé')
      await loadTeam()
    } catch { toast.error('Erreur') }
  }

  const handleSavePermissions = async (id: string, role: string, permissions: string[]) => {
    try {
      const res = await fetch('/api/settings/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role, permissions }),
      })
      if (!res.ok) throw new Error()
      toast.success('Permissions mises à jour')
      setEditingMember(null)
      await loadTeam()
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  const getRoleInfo = (roleId: string) => ROLES.find(r => r.id === roleId) || ROLES[2]

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })

  const STATUS_CONFIG = {
    active:    { label: 'Actif',    color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    invited:   { label: 'Invité',   color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    suspended: { label: 'Suspendu', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  }

  return (
    <div className="p-6 lg:p-8 max-w-screen-xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users size={21} className="text-purple-400" />
            Équipe
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Gérez les membres, rôles et permissions d'accès</p>
        </div>
        <button onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
          <Plus size={14} />Inviter un membre
        </button>
      </div>

      {/* ── RÔLES GUIDE ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {ROLES.map(r => {
          const Icon = r.icon
          const memberCount = members.filter(m => m.role === r.id).length
          return (
            <div key={r.id} className={cn('p-3.5 rounded-xl border', r.bg)}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={13} className={r.color} />
                <span className="text-xs font-semibold text-white">{r.label}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{r.desc}</p>
              <span className="text-xs text-gray-500">{memberCount} membre{memberCount > 1 ? 's' : ''}</span>
            </div>
          )
        })}
      </div>

      {/* ── MEMBRES ACTIFS ── */}
      <div className="glass rounded-2xl border border-white/5 mb-4">
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users size={14} className="text-purple-400" />
            Membres ({members.length + (owner ? 1 : 0)})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={22} className="animate-spin text-purple-400" /></div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={28} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-500 mb-4">Aucun membre — invitez votre équipe</p>
            <button onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
              <Plus size={13} />Inviter un membre
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map(member => {
              const role = getRoleInfo(member.role)
              const RoleIcon = role.icon
              const statusCfg = STATUS_CONFIG[member.status] || STATUS_CONFIG.active
              const pageCount = member.permissions.includes('all') ? ALL_PAGES.length
                : member.permissions.filter(p => ALL_PAGES.some(pg => pg.id === p)).length

              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors group">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {member.email.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{member.email}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={cn('inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border', role.bg)}>
                        <RoleIcon size={9} className={role.color} />{role.label}
                      </span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border', statusCfg.color)}>{statusCfg.label}</span>
                      <span className="text-xs text-gray-600">{pageCount} page{pageCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:block tabular-nums">
                    {fmtDate(member.joined_at)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button onClick={() => setEditingMember(member)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                      <Edit2 size={11} />Permissions
                    </button>
                    <button onClick={() => handleDelete(member.id, 'member')}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── INVITATIONS EN ATTENTE ── */}
      {invitations.length > 0 && (
        <div className="glass rounded-2xl border border-white/5">
          <div className="px-5 py-3.5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={14} className="text-yellow-400" />
              Invitations en attente ({invitations.length})
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {invitations.map(inv => {
              const role = getRoleInfo(inv.role)
              const RoleIcon = role.icon
              return (
                <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5 group hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-dashed border-white/15 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border', role.bg)}>
                        <RoleIcon size={9} className={role.color} />{role.label}
                      </span>
                      <span className="text-xs text-yellow-500/80 flex items-center gap-1">
                        <Clock size={9} />En attente
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0 hidden sm:block tabular-nums">
                    Envoyé {fmtDate(inv.created_at)}
                  </span>
                  <button onClick={() => handleDelete(inv.id, 'invitation')}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MODAL INVITATION ── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Mail size={14} className="text-purple-400" />Inviter un membre
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                <X size={14} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Adresse email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="collaborateur@email.com" autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-purple-500/40 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Rôle</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => {
                    const Icon = r.icon
                    return (
                      <button key={r.id} onClick={() => setForm(f => ({ ...f, role: r.id }))}
                        className={cn('flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                          form.role === r.id ? r.bg : 'border-white/8 hover:border-white/15')}>
                        <Icon size={12} className={form.role === r.id ? r.color : 'text-gray-600'} />
                        <div>
                          <p className="text-xs font-medium text-white">{r.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5 leading-tight line-clamp-1">{r.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Permissions preview */}
                {ROLES.find(r => r.id === form.role) && (
                  <div className="mt-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1.5">Accès inclus :</p>
                    <div className="flex flex-wrap gap-1">
                      {ROLES.find(r => r.id === form.role)?.permissions.includes('all')
                        ? <span className="text-xs px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/20 text-yellow-400 rounded">Accès complet</span>
                        : ROLES.find(r => r.id === form.role)?.permissions.map(p => {
                            const page = ALL_PAGES.find(pg => pg.id === p)
                            return page ? <span key={p} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded">{page.label}</span> : null
                          })
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">
                Annuler
              </button>
              <button onClick={handleInvite} disabled={inviting || !form.email}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                {inviting ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PERMISSIONS ── */}
      {editingMember && (
        <PermissionsModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  )
}
