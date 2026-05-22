'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search, Star, Trash2, MessageSquare, ExternalLink, Upload,
  Bot, Send, RefreshCw, ChevronRight, X, Check, Loader2,
  Users, TrendingUp, Zap, Filter,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ProspectStatus = 'discovered' | 'contacted' | 'discussing' | 'signed'
type OutreachStatus = 'pending' | 'sent' | 'replied' | 'no_response' | 'signed' | 'rejected'

interface Prospect {
  id: string
  username: string
  display_name?: string
  platform: 'Instagram' | 'TikTok' | 'Twitter'
  profile_url?: string
  avatar_url?: string
  followers_estimate: number
  engagement_rate: number
  niche: string
  bio?: string
  potential_score: number
  status: ProspectStatus
  outreach_count: number
  notes?: string
}

interface OutreachMessage {
  id: string
  prospect_id: string
  message: string
  platform: string
  status: OutreachStatus
  sent_at?: string
  replied_at?: string
  reply_content?: string
  ai_generated: boolean
  prospects?: {
    username: string
    platform: string
    followers_estimate: number
    niche: string
    avatar_url?: string
    profile_url?: string
  }
}

interface GeneratedMsg {
  id: number
  text: string
  label: string
}

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string; dot: string }> = {
  discovered: { label: 'Découverts', color: 'border-blue-500/40 bg-blue-500/5', dot: 'bg-blue-400' },
  contacted: { label: 'Contactés', color: 'border-amber-500/40 bg-amber-500/5', dot: 'bg-amber-400' },
  discussing: { label: 'En discussion', color: 'border-violet-500/40 bg-violet-500/5', dot: 'bg-violet-400' },
  signed: { label: '✅ Signés', color: 'border-green-500/40 bg-green-500/5', dot: 'bg-green-400' },
}

const PLATFORM_ICON: Record<string, string> = {
  Instagram: '📷',
  TikTok: '🎵',
  Twitter: '𝕏',
}

const NICHES = ['fitness', 'lifestyle', 'glamour', 'beauty', 'health', 'gaming', 'fashion', 'travel', 'food', 'music']
const SIZES = [
  { id: 'micro', label: 'Micro (1K–10K)' },
  { id: 'mid', label: 'Mid (10K–100K)' },
  { id: 'macro', label: 'Macro (100K+)' },
]

export default function ProspectionPage() {
  const supabase = createClient()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [outreach, setOutreach] = useState<OutreachMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'kanban' | 'outreach'>('kanban')

  // Search modal
  const [showSearch, setShowSearch] = useState(false)
  const [searchParams, setSearchParams] = useState({
    platforms: ['Instagram'],
    niche: 'lifestyle',
    accountSize: 'mid',
    hashtag: '',
  })
  const [searchResult, setSearchResult] = useState<string | null>(null)

  // CSV import
  const csvRef = useRef<HTMLInputElement>(null)

  // AI outreach modal
  const [outreachProspect, setOutreachProspect] = useState<Prospect | null>(null)
  const [generatingMsg, setGeneratingMsg] = useState(false)
  const [generatedMsgs, setGeneratedMsgs] = useState<GeneratedMsg[]>([])
  const [selectedMsg, setSelectedMsg] = useState<GeneratedMsg | null>(null)
  const [editedMsg, setEditedMsg] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyPitch, setAgencyPitch] = useState('')
  const [sendingOutreach, setSendingOutreach] = useState(false)
  const [outreachStep, setOutreachStep] = useState<'generate' | 'edit' | 'confirm'>('generate')

  useEffect(() => { loadProspects() }, [])

  const loadProspects = async () => {
    setLoading(true)
    const { data } = await supabase.from('prospects').select('*').order('created_at', { ascending: false })
    if (data) setProspects(data as Prospect[])
    setLoading(false)
  }

  const loadOutreach = async () => {
    const res = await fetch('/api/prospection/outreach')
    if (res.ok) {
      const { outreach: data } = await res.json()
      setOutreach(data || [])
    }
  }

  // ── Search / Scrape ──
  const handleSearch = async () => {
    setLoading(true)
    setSearchResult(null)
    try {
      const res = await fetch('/api/prospection/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      })
      const data = await res.json()
      if (data.success) {
        setProspects((prev) => [...(data.prospects || []), ...prev])
        setSearchResult(data.message)
        setTimeout(() => setShowSearch(false), 2000)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  // ── CSV Import ──
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    const parsed = lines.map((line) => {
      const [username, platform, followers, engagement, niche, bio] = line.split(',').map((s) => s.trim().replace(/"/g, ''))
      return {
        username: username.startsWith('@') ? username : '@' + username,
        platform: (['Instagram', 'TikTok', 'Twitter'].includes(platform) ? platform : 'Instagram') as Prospect['platform'],
        followers_estimate: parseInt(followers) || 5000,
        engagement_rate: parseFloat(engagement) || 0.04,
        niche: niche || 'lifestyle',
        bio: bio || '',
        potential_score: 3,
        status: 'discovered' as ProspectStatus,
        outreach_count: 0,
      }
    }).filter((p) => p.username.length > 1)

    // Insert via supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency) return

    const records = parsed.map((p) => ({ ...p, agency_id: agency.id }))
    const { data: inserted } = await supabase.from('prospects').insert(records).select('*')
    if (inserted) setProspects((prev) => [...(inserted as Prospect[]), ...prev])
    e.target.value = ''
  }

  // ── Status update ──
  const updateStatus = async (id: string, status: ProspectStatus) => {
    await supabase.from('prospects').update({ status }).eq('id', id)
    setProspects((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
  }

  const deleteProspect = async (id: string) => {
    await supabase.from('prospects').delete().eq('id', id)
    setProspects((prev) => prev.filter((p) => p.id !== id))
  }

  // ── AI Outreach ──
  const openOutreach = (prospect: Prospect) => {
    setOutreachProspect(prospect)
    setGeneratedMsgs([])
    setSelectedMsg(null)
    setEditedMsg('')
    setOutreachStep('generate')
  }

  const generateMessages = async () => {
    if (!outreachProspect) return
    setGeneratingMsg(true)
    try {
      const res = await fetch('/api/prospection/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: outreachProspect.id,
          tone: 'chaleureux et direct',
          agency_name: agencyName,
          agency_pitch: agencyPitch,
        }),
      })
      const data = await res.json()
      if (data.messages) {
        setGeneratedMsgs(data.messages)
        setSelectedMsg(data.messages[0])
        setEditedMsg(data.messages[0].text)
        setOutreachStep('edit')
      }
    } catch { /* ignore */ }
    finally { setGeneratingMsg(false) }
  }

  const selectMessage = (msg: GeneratedMsg) => {
    setSelectedMsg(msg)
    setEditedMsg(msg.text)
  }

  const queueOutreach = async () => {
    if (!outreachProspect) return
    setSendingOutreach(true)
    try {
      const res = await fetch('/api/prospection/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: outreachProspect.id,
          message: editedMsg,
          platform: outreachProspect.platform,
          ai_generated: true,
        }),
      })
      if (res.ok) {
        setOutreachStep('confirm')
        setProspects((prev) =>
          prev.map((p) => p.id === outreachProspect.id
            ? { ...p, status: 'contacted', outreach_count: (p.outreach_count || 0) + 1 }
            : p
          )
        )
        setTimeout(() => {
          setOutreachProspect(null)
          setOutreachStep('generate')
        }, 2500)
      }
    } catch { /* ignore */ }
    finally { setSendingOutreach(false) }
  }

  // ── Stats ──
  const stats = {
    total: prospects.length,
    contacted: prospects.filter((p) => p.status !== 'discovered').length,
    discussing: prospects.filter((p) => p.status === 'discussing').length,
    signed: prospects.filter((p) => p.status === 'signed').length,
  }

  const kanbanCols: ProspectStatus[] = ['discovered', 'contacted', 'discussing', 'signed']

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1625] to-[#0a0a0f] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-1">
              Prospection de modèles
            </h1>
            <p className="text-gray-400">
              Notre IA scrape Instagram, TikTok & Twitter — puis contacte les modèles automatiquement
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setView('outreach'); loadOutreach() }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                view === 'outreach'
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Bot size={16} className="inline mr-2" />Outreach IA
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                view === 'kanban'
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => csvRef.current?.click()}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-gray-400 hover:border-white/20 transition-all"
            >
              <Upload size={16} className="inline mr-2" />Import CSV
            </button>
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
            <button
              onClick={() => setShowSearch(true)}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              <Search size={16} className="inline mr-2" />Scraper des profils
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total scraping', value: stats.total, icon: <Users size={20} />, color: 'text-blue-400' },
            { label: 'En approche', value: stats.contacted, icon: <Send size={20} />, color: 'text-amber-400' },
            { label: 'En discussion', value: stats.discussing, icon: <MessageSquare size={20} />, color: 'text-violet-400' },
            { label: 'Signées', value: stats.signed, icon: <TrendingUp size={20} />, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Kanban ── */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {kanbanCols.map((col) => {
              const colProspects = prospects.filter((p) => p.status === col)
              const conf = STATUS_CONFIG[col]
              return (
                <div key={col} className={`rounded-2xl border ${conf.color} backdrop-blur-sm p-4 min-h-80`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${conf.dot}`} />
                      <h3 className="font-semibold text-white text-sm">{conf.label}</h3>
                    </div>
                    <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                      {colProspects.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colProspects.map((p) => (
                      <ProspectCard
                        key={p.id}
                        prospect={p}
                        onStatusChange={updateStatus}
                        onDelete={deleteProspect}
                        onOutreach={openOutreach}
                      />
                    ))}
                    {colProspects.length === 0 && (
                      <p className="text-center text-gray-600 text-xs py-8">Aucun profil</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Outreach list ── */}
        {view === 'outreach' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">File d'outreach IA</h2>
              <button onClick={loadOutreach} className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
            {outreach.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Bot size={40} className="mx-auto mb-3 opacity-30" />
                <p>Aucun message en file — cliquez sur <strong className="text-gray-400">Contacter par IA</strong> sur une carte</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outreach.map((msg) => (
                  <OutreachRow key={msg.id} msg={msg} onUpdate={(id, status) => {
                    setOutreach((prev) => prev.map((m) => m.id === id ? { ...m, status } : m))
                    fetch('/api/prospection/outreach', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id, status }),
                    })
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CSV template helper ── */}
        <div className="text-xs text-gray-600 border-t border-white/5 pt-4">
          Format CSV: <code className="text-gray-400">username,platform,followers,engagement_rate,niche,bio</code>
          {' '}— ex: <code className="text-gray-400">@sofia_fit,Instagram,25000,0.065,fitness,"Coach perso 💪"</code>
        </div>
      </div>

      {/* ════════════════════════════ SEARCH MODAL ════════════════════════════ */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12111a] border border-violet-500/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-violet-900/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap size={20} className="text-violet-400" />
                Scraper des profils
              </h2>
              <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Platforms */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Plateformes</label>
                <div className="flex gap-3">
                  {['Instagram', 'TikTok', 'Twitter'].map((pl) => (
                    <button
                      key={pl}
                      onClick={() => setSearchParams((prev) => ({
                        ...prev,
                        platforms: prev.platforms.includes(pl)
                          ? prev.platforms.filter((p) => p !== pl)
                          : [...prev.platforms, pl],
                      }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        searchParams.platforms.includes(pl)
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {PLATFORM_ICON[pl]} {pl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hashtag */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Hashtag / mot-clé
                </label>
                <input
                  type="text"
                  placeholder="ex: fitnessgirl, lifestyleblogger..."
                  value={searchParams.hashtag}
                  onChange={(e) => setSearchParams((p) => ({ ...p, hashtag: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm"
                />
              </div>

              {/* Niche */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Niche</label>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((n) => (
                    <button
                      key={n}
                      onClick={() => setSearchParams((p) => ({ ...p, niche: n }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        searchParams.niche === n
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Taille de compte</label>
                <div className="flex gap-3">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSearchParams((p) => ({ ...p, accountSize: s.id }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        searchParams.accountSize === s.id
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {searchResult && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                ✅ {searchResult}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSearch(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/20 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSearch}
                disabled={loading || searchParams.platforms.length === 0}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? 'Scan en cours...' : 'Lancer le scraping'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════ AI OUTREACH MODAL ════════════════════════════ */}
      {outreachProspect && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12111a] border border-violet-500/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl shadow-violet-900/40 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                  {outreachProspect.username.slice(1, 3).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white">{outreachProspect.username}</h3>
                  <p className="text-gray-500 text-sm">
                    {PLATFORM_ICON[outreachProspect.platform]} {outreachProspect.platform} ·{' '}
                    {outreachProspect.followers_estimate.toLocaleString('fr-FR')} abonnés ·{' '}
                    {(outreachProspect.engagement_rate * 100).toFixed(1)}% eng.
                  </p>
                  {outreachProspect.bio && (
                    <p className="text-gray-600 text-xs mt-0.5 italic">"{outreachProspect.bio}"</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setOutreachProspect(null); setOutreachStep('generate') }}
                className="text-gray-500 hover:text-white mt-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step: generate */}
            {outreachStep === 'generate' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                  <p className="text-violet-300 text-sm font-medium mb-1 flex items-center gap-2">
                    <Bot size={16} />
                    Personnaliser le contexte agence (optionnel)
                  </p>
                  <input
                    type="text"
                    placeholder="Nom de votre agence..."
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-violet-500 focus:outline-none mb-2"
                  />
                  <textarea
                    placeholder="Votre pitch (ex: On gère des créatrices OF/MYM et on multiplie leurs revenus par 3 en 60 jours)"
                    value={agencyPitch}
                    onChange={(e) => setAgencyPitch(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={generateMessages}
                  disabled={generatingMsg}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
                >
                  {generatingMsg ? (
                    <><Loader2 size={18} className="animate-spin" />Claude analyse le profil...</>
                  ) : (
                    <><Zap size={18} />Générer 3 messages IA</>
                  )}
                </button>
              </div>
            )}

            {/* Step: edit */}
            {outreachStep === 'edit' && (
              <div className="space-y-4">
                {/* Message variations */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Choisir une approche
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {generatedMsgs.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => selectMessage(msg)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${
                          selectedMsg?.id === msg.id
                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                            : 'border-white/10 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        {msg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable message */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Message — modifier si besoin
                  </p>
                  <textarea
                    value={editedMsg}
                    onChange={(e) => setEditedMsg(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm focus:border-violet-500 focus:outline-none resize-none leading-relaxed"
                  />
                  <p className="text-right text-xs text-gray-600 mt-1">{editedMsg.length} caractères</p>
                </div>

                {/* Profile link */}
                {outreachProspect.profile_url && (
                  <a
                    href={outreachProspect.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cyan-400 text-sm hover:text-cyan-300"
                  >
                    <ExternalLink size={14} />
                    Ouvrir le profil {outreachProspect.platform}
                  </a>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setOutreachStep('generate')}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition-colors"
                  >
                    ← Regenerer
                  </button>
                  <button
                    onClick={queueOutreach}
                    disabled={sendingOutreach || !editedMsg.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
                  >
                    {sendingOutreach ? (
                      <><Loader2 size={16} className="animate-spin" />En cours...</>
                    ) : (
                      <><ChevronRight size={16} />Mettre en file d'envoi</>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-600 text-center">
                  Le message sera envoyé via AdsPower/GeeLark si N8N_OUTREACH_WEBHOOK_URL est configuré
                </p>
              </div>
            )}

            {/* Step: confirm */}
            {outreachStep === 'confirm' && (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto">
                  <Check size={28} className="text-green-400" />
                </div>
                <p className="text-white font-bold text-lg">Message mis en file !</p>
                <p className="text-gray-500 text-sm">
                  {outreachProspect.username} est passée en statut <span className="text-amber-400">Contactée</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Prospect Card ──
function ProspectCard({
  prospect, onStatusChange, onDelete, onOutreach,
}: {
  prospect: Prospect
  onStatusChange: (id: string, s: ProspectStatus) => void
  onDelete: (id: string) => void
  onOutreach: (p: Prospect) => void
}) {
  const STATUSES: ProspectStatus[] = ['discovered', 'contacted', 'discussing', 'signed']
  const next = STATUSES[(STATUSES.indexOf(prospect.status) + 1) % STATUSES.length]

  const colors = ['from-violet-600', 'from-cyan-600', 'from-pink-600', 'from-amber-600', 'from-green-600']
  const bg = colors[prospect.username.charCodeAt(1) % colors.length]

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n)

  return (
    <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${bg} to-slate-800 flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
          {prospect.username.slice(1, 3).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{prospect.username}</p>
          <p className="text-gray-600 text-xs">{PLATFORM_ICON[prospect.platform]} {prospect.platform}</p>
        </div>
        <button
          onClick={() => onDelete(prospect.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Bio */}
      {prospect.bio && (
        <p className="text-gray-600 text-xs italic truncate mb-2">"{prospect.bio}"</p>
      )}

      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-gray-400">{fmt(prospect.followers_estimate)} abonnés</span>
        <span className="text-cyan-400">{(prospect.engagement_rate * 100).toFixed(1)}% eng.</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{prospect.niche}</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className={i < prospect.potential_score ? 'fill-amber-400 text-amber-400' : 'text-gray-700'} />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onOutreach(prospect)}
          className="flex-1 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <Bot size={12} />
          Contacter par IA
        </button>
        <button
          onClick={() => onStatusChange(prospect.id, next)}
          className="py-1.5 px-2 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 transition-colors"
          title="Avancer dans le kanban"
        >
          <ChevronRight size={14} />
        </button>
        {prospect.profile_url && (
          <a
            href={prospect.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-2 rounded-lg bg-white/5 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {prospect.outreach_count > 0 && (
        <p className="text-xs text-amber-500/70 mt-2 text-center">
          {prospect.outreach_count} message{prospect.outreach_count > 1 ? 's' : ''} envoyé{prospect.outreach_count > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// ── Outreach Row ──
const OUTREACH_STATUS_LABELS: Record<OutreachStatus, { label: string; color: string }> = {
  pending: { label: '⏳ En attente', color: 'text-gray-400' },
  sent: { label: '✉️ Envoyé', color: 'text-blue-400' },
  replied: { label: '💬 A répondu', color: 'text-green-400' },
  no_response: { label: '🔇 Pas de réponse', color: 'text-gray-500' },
  signed: { label: '✅ Signée', color: 'text-emerald-400' },
  rejected: { label: '❌ Refus', color: 'text-red-400' },
}

function OutreachRow({
  msg, onUpdate,
}: {
  msg: OutreachMessage
  onUpdate: (id: string, status: OutreachStatus) => void
}) {
  const sc = OUTREACH_STATUS_LABELS[msg.status]
  const STATUSES: OutreachStatus[] = ['pending', 'sent', 'replied', 'no_response', 'signed', 'rejected']

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white text-sm">{msg.prospects?.username || '—'}</span>
          <span className="text-gray-600 text-xs">{msg.prospects?.platform && PLATFORM_ICON[msg.prospects.platform]}</span>
          {msg.ai_generated && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">IA</span>
          )}
        </div>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{msg.message}</p>
        {msg.sent_at && (
          <p className="text-gray-600 text-[10px] mt-1">Envoyé le {new Date(msg.sent_at).toLocaleDateString('fr-FR')}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-medium ${sc.color}`}>{sc.label}</span>
        <select
          value={msg.status}
          onChange={(e) => onUpdate(msg.id, e.target.value as OutreachStatus)}
          className="text-xs bg-[#0a0a0f] border border-white/10 rounded-lg px-2 py-1 text-gray-300 focus:border-violet-500 focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{OUTREACH_STATUS_LABELS[s].label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
