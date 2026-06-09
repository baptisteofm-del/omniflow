'use client'

import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Search, Star, Trash2, MessageSquare, ExternalLink, Upload,
  Bot, Send, RefreshCw, ChevronRight, X, Check, Loader2,
  Users, TrendingUp, Zap, Filter, CheckSquare, Square,
  BarChart2, Bell, BookOpen, Download, ArrowRight, AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/lib/hooks/useUsage'
import { FeatureGate } from '@/components/ui/FeatureGate'

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
bio?: string
  potential_score: number
  status: ProspectStatus
  outreach_count: number
  notes?: string
  platform_status?: 'not_on_platform' | 'aggregator_detected' | 'already_on_platform'
  source_account?: string
  geo_country?: string
  geo_cities?: string
  scrape_mode?: 'followers' | 'similar' | 'keyword'
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
  signed: { label: 'Signés', color: 'border-green-500/40 bg-green-500/5', dot: 'bg-green-400' },
}

const PLATFORM_ICON: Record<string, string> = {
  Instagram: 'IG',
  TikTok: 'TT',
  Twitter: 'X',
}

const SIZES = [
  { id: 'micro', label: 'Micro (1K-10K)' },
  { id: 'mid', label: 'Mid (10K-100K)' },
  { id: 'macro', label: 'Macro (100K+)' },
]

export default function ProspectionPage() {
  const { planId } = useUsage()

  if (planId !== 'agency') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#12111a] to-[#0a0a0f] p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Fonctionnalité réservée</h1>
          <p className="text-gray-400 mb-6">La prospection Apify est disponible uniquement avec le plan <strong>Agency</strong>.</p>
          <a
            href="/settings/billing"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
          >
            Passer au plan Agency
          </a>
        </div>
      </div>
    )
  }

  const supabase = createClient()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [outreach, setOutreach] = useState<OutreachMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'kanban' | 'outreach' | 'stats' | 'followup'>('kanban')

  // Search modal
  const [showSearch, setShowSearch] = useState(false)
  const [searchMode, setSearchMode] = useState<'hashtags' | 'similar'>('hashtags')
  const [searchParams, setSearchParams] = useState({
    mode: 'hashtags' as 'hashtags' | 'similar',
    platform: 'instagram' as 'instagram' | 'tiktok' | 'both',
    hashtags: [] as string[],
    sourceAccount: '',
    country: 'FR',
    language: 'fr',
    followersMin: 1000,
    followersMax: 30000,
    engagementMin: 2,
    keywords: [] as string[],
    limit: 10,
    hashtagInput: '',
    keywordInput: '',
  })
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [quotaMax] = useState(100)
  const [searchResult, setSearchResult] = useState<string | null>(null)

  // CSV import
  const csvRef = useRef<HTMLInputElement>(null)

  // ── Campaign mode ──
  const [campaignMode, setCampaignMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaignAgencyName, setCampaignAgencyName] = useState('')
  const [campaignAgencyPitch, setCampaignAgencyPitch] = useState('')
  const [campaignTone, setCampaignTone] = useState('chaleureux et direct')
  const [generatingCampaign, setGeneratingCampaign] = useState(false)
  const [campaignMessages, setCampaignMessages] = useState<any[]>([])
  const [campaignStep, setCampaignStep] = useState<'config' | 'review' | 'done'>('config')
  const [editedCampaignMsgs, setEditedCampaignMsgs] = useState<Record<string, string>>({})
  const [queuingCampaign, setQueuingCampaign] = useState(false)

  // ── Follow-up ──
  const [overdueProspects, setOverdueProspects] = useState<any[]>([])
  const [followupDays, setFollowupDays] = useState(5)
  const [loadingFollowup, setLoadingFollowup] = useState(false)
  const [selectedFollowup, setSelectedFollowup] = useState<Set<string>>(new Set())
  const [generatingFollowup, setGeneratingFollowup] = useState(false)

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

  useEffect(() => { 
    loadProspects()
    loadQuota()
  }, [])

  const loadQuota = async () => {
    const res = await fetch('/api/prospection/quota')
    if (res.ok) {
      const { used } = await res.json()
      setQuotaUsed(used || 0)
    }
  }

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

  // ── Search / Scrape (Apify) ──
  const handleSearch = async () => {
    setLoading(true)
    setSearchResult(null)
    try {
      // Validate
      if (searchParams.hashtags.length === 0) {
        setSearchResult('Veuillez ajouter au moins un hashtag')
        setLoading(false)
        return
      }

      const payload = {
        platform: searchParams.platform,
        hashtags: searchParams.hashtags,
        country: searchParams.country,
        language: searchParams.language,
        followersMin: searchParams.followersMin,
        followersMax: searchParams.followersMax,
        engagementMin: searchParams.engagementMin,
        keywords: searchParams.keywords,
        limit: searchParams.limit,
      }

      const res = await fetch('/api/prospection/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        setSearchResult(`${error.error || 'Erreur lors de la recherche'}`)
        setLoading(false)
        return
      }

      const data = await res.json()

      if (data.profiles && data.profiles.length > 0) {
        // Convert API response to Prospect format
        const newProspects: Prospect[] = data.profiles.map((p: any) => ({
          id: p.id,
          username: p.username,
          display_name: p.displayName,
          platform: (p.platform === 'instagram' ? 'Instagram' : 'TikTok') as 'Instagram' | 'TikTok' | 'Twitter',
          profile_url: p.profileUrl,
          avatar_url: p.avatar,
          followers_estimate: p.followers,
          engagement_rate: p.engagementRate,

          bio: p.bio,
          potential_score: Math.ceil(p.score / 20), // Convert 0-100 to 1-5 stars
          status: 'discovered' as ProspectStatus,
          outreach_count: 0,
          geo_country: p.country,
          scrape_mode: searchMode === 'similar' ? 'similar' : 'keyword' as const,
        }))

        // Store in Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: agency } = await supabase
            .from('agencies')
            .select('id')
            .eq('owner_id', user.id)
            .single()

          if (agency) {
            const records = newProspects.map((p) => ({
              ...p,
              agency_id: agency.id,
            }))
            const { data: inserted } = await supabase.from('prospects').insert(records).select('*')
            if (inserted) {
              setProspects((prev) => [...(inserted as Prospect[]), ...prev])
            }
          }
        }

        setSearchResult(`${data.profiles.length} profils trouvés et importés`)
        // Refresh quota after successful import
        await loadQuota()
        setTimeout(() => setShowSearch(false), 2000)
      } else {
        setSearchResult('Aucun profil trouvé avec ces critères')
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
      if (errorMsg.includes('429')) {
        setSearchResult('Quota mensuel atteint')
      } else {
        setSearchResult(`Erreur: ${errorMsg}`)
      }
      // Refresh quota to show updated status
      await loadQuota()
    } finally {
      setLoading(false)
    }
  }

  // ── CSV Import ──
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1) // skip header
    const parsed = lines.map((line) => {
      const [username, platform, followers, engagement, bio] = line.split(',').map((s) => s.trim().replace(/"/g, ''))
      return {
        username: username.startsWith('@') ? username : '@' + username,
        platform: (['Instagram', 'TikTok', 'Twitter'].includes(platform) ? platform : 'Instagram') as Prospect['platform'],
        followers_estimate: parseInt(followers) || 5000,
        engagement_rate: parseFloat(engagement) || 0.04,
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

  // ── Campaign helpers ──
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const selectAll = () => setSelectedIds(new Set(prospects.filter(p => p.status === 'discovered').map(p => p.id)))
  const clearSelection = () => setSelectedIds(new Set())

  const generateCampaign = async () => {
    setGeneratingCampaign(true)
    try {
      const res = await fetch('/api/prospection/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_ids: Array.from(selectedIds),
          tone: campaignTone,
          agency_name: campaignAgencyName,
          agency_pitch: campaignAgencyPitch,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCampaignMessages(data.messages)
        const edited: Record<string, string> = {}
        data.messages.forEach((m: any) => { edited[m.prospect_id] = m.message })
        setEditedCampaignMsgs(edited)
        setCampaignStep('review')
      }
    } catch { /* ignore */ }
    finally { setGeneratingCampaign(false) }
  }

  const queueCampaign = async () => {
    setQueuingCampaign(true)
    let queued = 0
    for (const msg of campaignMessages) {
      const edited = editedCampaignMsgs[msg.prospect_id] || msg.message
      const res = await fetch('/api/prospection/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect_id: msg.prospect_id,
          message: edited,
          platform: msg.prospect.platform,
          ai_generated: true,
        }),
      })
      if (res.ok) queued++
    }
    setProspects(prev => prev.map(p =>
      selectedIds.has(p.id) ? { ...p, status: 'contacted' as ProspectStatus, outreach_count: (p.outreach_count || 0) + 1 } : p
    ))
    setCampaignStep('done')
    setQueuingCampaign(false)
    setTimeout(() => {
      setShowCampaignModal(false)
      setCampaignStep('config')
      setCampaignMessages([])
      clearSelection()
      setCampaignMode(false)
    }, 2500)
  }

  const loadFollowup = async () => {
    setLoadingFollowup(true)
    try {
      const res = await fetch(`/api/prospection/followup?days=${followupDays}`)
      const data = await res.json()
      setOverdueProspects(data.overdue || [])
    } catch { /* ignore */ }
    finally { setLoadingFollowup(false) }
  }

  const generateFollowups = async () => {
    setGeneratingFollowup(true)
    try {
      const ids = Array.from(selectedFollowup)
      const res = await fetch('/api/prospection/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach_ids: ids }),
      })
      const data = await res.json()
      if (data.success) {
        setOverdueProspects(prev => prev.filter(o => !ids.includes(o.id)))
        setSelectedFollowup(new Set())
      }
    } catch { /* ignore */ }
    finally { setGeneratingFollowup(false) }
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

      <PageHeader
        icon={Search}
        title="Trouvez et recrutez vos créatrices"
        subtitle="Prospection et recrutement"
        iconColor="text-green-400"
        iconBg="bg-green-500/10"
      />
        <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-1">
              Prospection de modèles
            </h1>
            <p className="text-gray-400">
              Notre IA scrape Instagram, TikTok & Twitter - puis contacte les modèles automatiquement
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {([
              ['kanban', 'Kanban', null],
              ['outreach', 'Outreach IA', null],
              ['stats', 'Stats', null],
              ['followup', 'Relances', overdueProspects.length > 0 ? overdueProspects.length : null],            ] as [string, string, number | null][]).map(([v, label, badge]) => (
              <button
                key={v}
                onClick={() => {
                  setView(v as any)
                  if (v === 'outreach') loadOutreach()
                  if (v === 'followup') loadFollowup()
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${
                  view === v ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {label}
                {badge !== null && <span className="text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
              </button>
            ))}
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

        {/* ── Campaign toolbar ── */}
        {view === 'kanban' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCampaignMode(!campaignMode); clearSelection() }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                campaignMode ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              <CheckSquare size={14} /> Mode campagne
            </button>
            {campaignMode && (
              <>
                <button onClick={selectAll} className="text-xs text-gray-400 hover:text-white">Tout sélectionner</button>
                <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-white">Désélectionner</button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => { setShowCampaignModal(true); setCampaignStep('config') }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                  >
                    <Bot size={14} /> Lancer campagne ({selectedIds.size})
                  </button>
                )}
              </>
            )}
          </div>
        )}

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
                        campaignMode={campaignMode}
                        selected={selectedIds.has(p.id)}
                        onToggleSelect={toggleSelect}
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
                <p>Aucun message en file - cliquez sur <strong className="text-gray-400">Contacter par IA</strong> sur une carte</p>
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

        {/* ── Stats view ── */}
        {view === 'stats' && (() => {
          const total = prospects.length
          const contacted = prospects.filter(p => p.status !== 'discovered').length
          const discussing = prospects.filter(p => p.status === 'discussing').length
          const signed = prospects.filter(p => p.status === 'signed').length
          const contactRate = total > 0 ? Math.round(contacted / total * 100) : 0
          const replyRate = contacted > 0 ? Math.round(discussing / contacted * 100) : 0
          const signRate = discussing > 0 ? Math.round(signed / discussing * 100) : 0

          const byPlatform = ['Instagram', 'TikTok', 'Twitter'].map(pl => ({
            platform: pl,
            total: prospects.filter(p => p.platform === pl).length,
            signed: prospects.filter(p => p.platform === pl && p.status === 'signed').length,
          }))
          return (
            <div className="space-y-6">
              {/* Funnel */}
              <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <h3 className="font-semibold text-white mb-5 flex items-center gap-2"><BarChart2 size={18} className="text-violet-400" /> Funnel de conversion</h3>
                <div className="flex items-end gap-3">
                  {[
                    { label: 'Scrapés', value: total, color: 'bg-blue-500', pct: 100 },
                    { label: 'Contactés', value: contacted, color: 'bg-amber-500', pct: contactRate },
                    { label: 'Réponse', value: discussing, color: 'bg-violet-500', pct: contacted > 0 ? Math.round(discussing/total*100) : 0 },
                    { label: 'Signées', value: signed, color: 'bg-green-500', pct: total > 0 ? Math.round(signed/total*100) : 0 },
                  ].map((f, i) => (
                    <div key={f.label} className="flex-1 text-center">
                      <div className="relative h-28 flex items-end justify-center mb-2">
                        <div className={`${f.color} rounded-t-lg w-full opacity-80`} style={{ height: `${Math.max(f.pct, 4)}%` }} />
                      </div>
                      <p className="text-2xl font-bold text-white">{f.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.label}</p>
                      <p className="text-xs text-gray-700">{f.pct}%</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
                  {[
                    { label: 'Taux de contact', value: contactRate + '%', color: 'text-amber-400' },
                    { label: 'Taux de réponse', value: replyRate + '%', color: 'text-violet-400' },
                    { label: 'Taux de signature', value: signRate + '%', color: 'text-green-400' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-xl bg-black/20">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* By platform */}
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                  <h4 className="font-semibold text-white mb-4 text-sm">Par plateforme</h4>
                  <div className="space-y-3">
                    {byPlatform.map(p => (
                      <div key={p.platform} className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-20">{PLATFORM_ICON[p.platform]} {p.platform}</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: total > 0 ? `${p.total/total*100}%` : '0%' }} />
                        </div>
                        <span className="text-sm text-white font-semibold w-8 text-right">{p.total}</span>
                        {p.signed > 0 && <span className="text-xs text-green-400">{p.signed} signées</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Follow-up view ── */}
        {view === 'followup' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400">Pas de réponse depuis :</label>
                <select
                  value={followupDays}
                  onChange={e => setFollowupDays(Number(e.target.value))}
                  className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                >
                  {[3,5,7,10,14].map(d => <option key={d} value={d}>{d} jours</option>)}
                </select>
              </div>
              <button onClick={loadFollowup} disabled={loadingFollowup} className="px-4 py-1.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/20 flex items-center gap-2">
                {loadingFollowup ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Actualiser
              </button>
              {selectedFollowup.size > 0 && (
                <button
                  onClick={generateFollowups}
                  disabled={generatingFollowup}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold flex items-center gap-2"
                >
                  {generatingFollowup ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                  Relancer ({selectedFollowup.size})
                </button>
              )}
            </div>

            {overdueProspects.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Bell size={40} className="mx-auto mb-3 opacity-20" />
                <p>Aucune relance nécessaire</p>
                <p className="text-xs mt-1">Tous les prospects contactés ont répondu ou ont été relancer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueProspects.map(o => {
                  const p = o.prospects
                  const daysSince = Math.floor((Date.now() - new Date(o.sent_at).getTime()) / 86400000)
                  return (
                    <div key={o.id} className="flex items-center gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/3 hover:bg-amber-500/5 transition-colors">
                      <button onClick={() => setSelectedFollowup(prev => { const n = new Set(prev); n.has(o.id) ? n.delete(o.id) : n.add(o.id); return n })}>
                        {selectedFollowup.has(o.id) ? <CheckSquare size={18} className="text-amber-400" /> : <Square size={18} className="text-gray-600" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">{p?.username || '-'}</span>
                          <span className="text-xs text-gray-500">{p?.platform && PLATFORM_ICON[p.platform as keyof typeof PLATFORM_ICON]}</span>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-1">{o.message}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-amber-400 text-sm font-semibold">{daysSince}j sans réponse</p>
                        <p className="text-gray-600 text-xs">Envoyé le {new Date(o.sent_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Setup / n8n guide ── */}



      </div>

      {/* ════════════════════════════ SEARCH MODAL ════════════════════════════ */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12111a] border border-violet-500/20 rounded-2xl p-6 w-full max-w-xl shadow-2xl shadow-violet-900/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap size={20} className="text-violet-400" />
                Prospection Apify
              </h2>
              <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Search Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mode de recherche</label>
                <div className="flex gap-2">
                  {(['hashtags', 'similar'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSearchMode(mode)
                        setSearchParams((prev) => ({
                          ...prev,
                          mode,
                          hashtags: [],
                          sourceAccount: '',
                        }))
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        searchMode === mode
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {mode === 'hashtags' ? 'Par hashtags' : 'Compte similaire'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Plateforme</label>
                <div className="flex gap-2">
                  {(['instagram', 'tiktok', 'both'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSearchParams((prev) => ({ ...prev, platform: p }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                        searchParams.platform === p
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {p === 'instagram' ? 'Instagram' : p === 'tiktok' ? 'TikTok' : 'Les deux'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hashtags or Similar Account */}
              {searchMode === 'hashtags' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Hashtags</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {searchParams.hashtags.map((tag) => (
                      <div key={tag} className="px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-medium flex items-center gap-1.5">
                        #{tag}
                        <button
                          onClick={() => setSearchParams((p) => ({
                            ...p,
                            hashtags: p.hashtags.filter((t) => t !== tag),
                          }))}
                          className="text-violet-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ex: lifestyle, fitness"
                      value={searchParams.hashtagInput}
                      onChange={(e) => setSearchParams((p) => ({ ...p, hashtagInput: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchParams.hashtagInput.trim()) {
                          setSearchParams((p) => ({
                            ...p,
                            hashtags: [...p.hashtags, p.hashtagInput.trim().toLowerCase()],
                            hashtagInput: '',
                          }))
                          e.preventDefault()
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => {
                        if (searchParams.hashtagInput.trim()) {
                          setSearchParams((p) => ({
                            ...p,
                            hashtags: [...p.hashtags, p.hashtagInput.trim().toLowerCase()],
                            hashtagInput: '',
                          }))
                        }
                      }}
                      className="px-3 py-2 bg-violet-500/20 border border-violet-500/40 rounded-lg text-violet-300 text-xs hover:bg-violet-500/30"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Compte cible (@username)</label>
                  <input
                    type="text"
                    placeholder="ex: @fitgirl_paris"
                    value={searchParams.sourceAccount}
                    onChange={(e) => setSearchParams((p) => ({ ...p, sourceAccount: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
              )}

              {/* Followers Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Min Followers</label>
                  <input
                    type="number"
                    value={searchParams.followersMin}
                    onChange={(e) => setSearchParams((p) => ({ ...p, followersMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Max Followers</label>
                  <input
                    type="number"
                    value={searchParams.followersMax}
                    onChange={(e) => setSearchParams((p) => ({ ...p, followersMax: parseInt(e.target.value) || 50000 }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:border-violet-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Engagement Min */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Engagement Min (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={searchParams.engagementMin}
                  onChange={(e) => setSearchParams((p) => ({ ...p, engagementMin: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:border-violet-500 focus:outline-none text-sm"
                />
              </div>

              {/* Nombre de profils */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nombre de profils max</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={searchParams.limit}
                  onChange={(e) => setSearchParams((p) => ({ ...p, limit: Math.max(5, Math.min(100, parseInt(e.target.value) || 10)) }))}
                  className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:border-violet-500 focus:outline-none text-sm"
                />
              </div>

              {/* Country & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pays</label>
                  <select
                    value={searchParams.country}
                    onChange={(e) => setSearchParams((p) => ({ ...p, country: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:border-violet-500 focus:outline-none text-sm"
                  >
                    {['FR', 'BE', 'CH', 'MA', 'TN', 'DZ', 'CA', 'BR', 'INTL'].map((c) => (
                      <option key={c} value={c}>
                        {c === 'FR' ? 'France' : c === 'BE' ? 'Belgique' : c === 'CH' ? 'Suisse' : c === 'MA' ? 'Maroc' : c === 'TN' ? 'Tunisie' : c === 'DZ' ? 'Algérie' : c === 'CA' ? 'Canada' : c === 'BR' ? 'Brésil' : 'Tous'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Langue</label>
                  <select
                    value={searchParams.language}
                    onChange={(e) => setSearchParams((p) => ({ ...p, language: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:border-violet-500 focus:outline-none text-sm"
                  >
                    {['fr', 'en', 'es', 'ar', 'pt', 'multi'].map((l) => (
                      <option key={l} value={l}>
                        {l === 'fr' ? 'Français' : l === 'en' ? 'Anglais' : l === 'es' ? 'Espagnol' : l === 'ar' ? 'Arabe' : l === 'pt' ? 'Portugais' : 'Multi'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keywords in Bio (hidden for now) */}
              {false && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mots-clés Bio</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {searchParams.keywords.map((kw) => (
                    <div key={kw} className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-1.5">
                      {kw}
                      <button
                        onClick={() => setSearchParams((p) => ({
                          ...p,
                          keywords: p.keywords.filter((k) => k !== kw),
                        }))}
                        className="text-cyan-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ex: model, brand ambassador"
                    value={searchParams.keywordInput}
                    onChange={(e) => setSearchParams((p) => ({ ...p, keywordInput: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchParams.keywordInput.trim()) {
                        setSearchParams((p) => ({
                          ...p,
                          keywords: [...p.keywords, p.keywordInput.trim()],
                          keywordInput: '',
                        }))
                        e.preventDefault()
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={() => {
                      if (searchParams.keywordInput.trim()) {
                        setSearchParams((p) => ({
                          ...p,
                          keywords: [...p.keywords, p.keywordInput.trim()],
                          keywordInput: '',
                        }))
                      }
                    }}
                    className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs hover:bg-cyan-500/30"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
              )}
            </div>

            {/* Quota display */}
            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quota mensuel</span>
                <span className="text-xs text-gray-400">{quotaUsed} / {quotaMax}</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (quotaUsed / quotaMax) * 100)}%` }} 
                />
              </div>
              {quotaUsed >= quotaMax && (
                <p className="text-xs text-red-400 mt-2">Quota mensuel atteint. Revenez le mois prochain.</p>
              )}
            </div>

            {searchResult && (
              <div className={`mb-4 p-3 rounded-lg border text-sm ${
                searchResult.includes('trouvés')
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {searchResult}
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
                disabled={loading || searchParams.hashtags.length === 0 || quotaUsed >= quotaMax || (searchMode === 'similar' && !searchParams.sourceAccount.trim())}
                title={quotaUsed >= quotaMax ? 'Quota mensuel atteint' : undefined}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {loading ? 'Scraping en cours...' : quotaUsed >= quotaMax ? 'Quota atteint' : 'Lancer la prospection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════ CAMPAIGN MODAL ════════════════════════════ */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12111a] border border-violet-500/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Bot size={20} className="text-violet-400" /> Campagne IA - {selectedIds.size} prospect{selectedIds.size > 1 ? 's' : ''}
              </h3>
              <button onClick={() => { setShowCampaignModal(false); setCampaignStep('config') }} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            {campaignStep === 'config' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-sm text-gray-400">
                  Claude va générer un DM personnalisé pour chacun des <strong className="text-white">{selectedIds.size}</strong> profils sélectionnés.
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Ton agence (optionnel)</label>
                  <input type="text" value={campaignAgencyName} onChange={e => setCampaignAgencyName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none mb-2"
                    placeholder="Nom de l'agence..." />
                  <textarea value={campaignAgencyPitch} onChange={e => setCampaignAgencyPitch(e.target.value)} rows={2}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none resize-none"
                    placeholder="Pitch court (optionnel)..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Ton</label>
                  <div className="flex flex-wrap gap-2">
                    {['chaleureux et direct', 'professionnel', 'décontracté', 'enthousiaste'].map(t => (
                      <button key={t} onClick={() => setCampaignTone(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                          campaignTone === t ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'border-white/10 text-gray-500 hover:border-white/20'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <button onClick={generateCampaign} disabled={generatingCampaign}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {generatingCampaign ? <><Loader2 size={18} className="animate-spin" />Génération en cours...</> : <><Zap size={18} />Générer {selectedIds.size} messages IA</>}
                </button>
              </div>
            )}

            {campaignStep === 'review' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">✏️ Vérifiez et modifiez les messages avant envoi</p>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {campaignMessages.map((msg) => (
                    <div key={msg.prospect_id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                          {msg.prospect.username.slice(1,3).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-white">{msg.prospect.username}</span>
                        <span className="text-xs text-gray-600">{PLATFORM_ICON[msg.prospect.platform as keyof typeof PLATFORM_ICON]}</span>
                      </div>
                      <textarea
                        value={editedCampaignMsgs[msg.prospect_id] || msg.message}
                        onChange={e => setEditedCampaignMsgs(prev => ({ ...prev, [msg.prospect_id]: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCampaignStep('config')} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm">← Recommencer</button>
                  <button onClick={queueCampaign} disabled={queuingCampaign}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {queuingCampaign ? <><Loader2 size={15} className="animate-spin" />File...</> : <><Send size={15} />Mettre en file ({campaignMessages.length})</>}
                  </button>
                </div>
              </div>
            )}

            {campaignStep === 'done' && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
                  <Check size={30} className="text-green-400" />
                </div>
                <p className="text-white font-bold text-lg">{campaignMessages.length} messages en file !</p>
                <p className="text-gray-500 text-sm mt-1">Les prospects sont passés en statut "Contactées"</p>
              </div>
            )}
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
                    Message - modifier si besoin
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
  prospect, onStatusChange, onDelete, onOutreach, campaignMode, selected, onToggleSelect,
}: {
  prospect: Prospect
  onStatusChange: (id: string, s: ProspectStatus) => void
  onDelete: (id: string) => void
  onOutreach: (p: Prospect) => void
  campaignMode?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}) {
  const STATUSES: ProspectStatus[] = ['discovered', 'contacted', 'discussing', 'signed']
  const next = STATUSES[(STATUSES.indexOf(prospect.status) + 1) % STATUSES.length]

  const colors = ['from-violet-600', 'from-cyan-600', 'from-pink-600', 'from-amber-600', 'from-green-600']
  const bg = colors[prospect.username.charCodeAt(1) % colors.length]

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n)

  return (
    <div
      onClick={() => campaignMode && onToggleSelect?.(prospect.id)}
      className={`bg-black/30 rounded-xl p-3.5 border transition-all group ${
        selected ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/30' : 'border-white/5 hover:border-white/10'
      } ${campaignMode ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3 mb-3">
        {campaignMode && (
          <div className="flex-shrink-0 mt-0.5">
            {selected
              ? <CheckSquare size={16} className="text-violet-400" />
              : <Square size={16} className="text-gray-600" />}
          </div>
        )}
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
        <div className="flex items-center gap-1.5">

          {/* Platform status badge */}
          {(prospect as any).platform_status && (
            <span
              className="text-xs font-semibold"
              title={(
                {
                  'not_on_platform': 'Non encore sur les plateformes',
                  'aggregator_detected': 'Agrégateur detecté',
                  'already_on_platform': 'Déjà monetélisée',
                } as Record<string, string>
              )[(prospect as any).platform_status]}
            >
              {(prospect as any).platform_status === 'not_on_platform'
                ? '🟢'
                : (prospect as any).platform_status === 'aggregator_detected'
                ? '🟡'
                : '🔴'}
            </span>
          )}
        </div>
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
  pending: { label: 'En attente', color: 'text-gray-400' },
  sent: { label: 'Envoyé', color: 'text-blue-400' },
  replied: { label: 'A répondu', color: 'text-green-400' },
  no_response: { label: 'Pas de réponse', color: 'text-gray-500' },
  signed: { label: 'Signée', color: 'text-emerald-400' },
  rejected: { label: 'Refus', color: 'text-red-400' },
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
          <span className="font-semibold text-white text-sm">{msg.prospects?.username || '-'}</span>
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
