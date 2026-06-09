'use client'

import { useState, useEffect } from 'react'
import {
  TicketIcon, Clock, CheckCircle2, AlertCircle, XCircle,
  RefreshCw, Filter, ChevronDown, Send, Sparkles,
  TrendingUp, Users, Inbox
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  description: string
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  user_email?: string
  created_at: string
  resolved_at?: string
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  new:      { label: 'Nouveau',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',   icon: Inbox },
  open:     { label: 'Ouvert',     color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: AlertCircle },
  pending:  { label: 'En attente', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  resolved: { label: 'Résolu',     color: 'bg-green-500/20 text-green-400 border-green-500/30',  icon: CheckCircle2 },
  closed:   { label: 'Fermé',      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',    icon: XCircle },
}

const PRIORITY_CONFIG = {
  low:    { label: 'Faible',  color: 'text-gray-400',  dot: 'bg-gray-400' },
  normal: { label: 'Normale', color: 'text-blue-400',  dot: 'bg-blue-400' },
  high:   { label: 'Haute',   color: 'text-amber-400', dot: 'bg-amber-400' },
  urgent: { label: 'Urgente', color: 'text-red-400',   dot: 'bg-red-400' },
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupportDashboardPage() {
  const [tickets, setTickets]         = useState<Ticket[]>([])
  const [loading, setLoading]         = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [filterStatus, setFilterStatus]     = useState<string>('all')
  const [updating, setUpdating]       = useState<string | null>(null)
  const [stats, setStats]             = useState({
    new: 0, open: 0, pending: 0, resolved: 0, urgent: 0,
  })

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const url = filterStatus !== 'all' ? `/api/support/tickets?status=${filterStatus}` : '/api/support/tickets'
      const res = await fetch(url)
      const data = await res.json()
      if (data.tickets) {
        setTickets(data.tickets)
        // Compute stats from all tickets
        const all = data.tickets as Ticket[]
        setStats({
          new:      all.filter(t => t.status === 'new').length,
          open:     all.filter(t => t.status === 'open').length,
          pending:  all.filter(t => t.status === 'pending').length,
          resolved: all.filter(t => t.status === 'resolved').length,
          urgent:   all.filter(t => t.priority === 'urgent' && !['resolved','closed'].includes(t.status)).length,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [filterStatus])

  const updateTicket = async (id: string, patch: { status?: string; priority?: string }) => {
    setUpdating(id)
    try {
      await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      await fetchTickets()
      if (selectedTicket?.id === id) {
        setSelectedTicket(t => t ? { ...t, ...patch } as Ticket : null)
      }
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  // ─── Stats cards ────────────────────────────────────────────────────────────
  const StatCard = ({ icon: Icon, label, value, accent }: {
    icon: React.ElementType; label: string; value: number; accent: string
  }) => (
    <div className={cn('glass rounded-2xl p-5 border border-white/5 flex items-center gap-4')}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', accent)}>
        <Icon size={20} className="text-white/80" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <TicketIcon size={24} className="text-purple-400" />
            Centre de Support
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gestion des tickets et conversations</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://t.me/omniflowsupport"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium transition-all"
          >
            <Send size={14} />
            Telegram Support
          </a>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm font-medium transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Inbox}       label="Nouveaux"   value={stats.new}      accent="bg-blue-500/20" />
        <StatCard icon={AlertCircle} label="Ouverts"    value={stats.open}     accent="bg-purple-500/20" />
        <StatCard icon={Clock}       label="En attente" value={stats.pending}   accent="bg-amber-500/20" />
        <StatCard icon={CheckCircle2}label="Résolus"    value={stats.resolved}  accent="bg-green-500/20" />
        <StatCard icon={TrendingUp}  label="Urgents"    value={stats.urgent}    accent="bg-red-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket list */}
        <div className="lg:col-span-1">
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4">
            <Filter size={14} className="text-gray-500" />
            <div className="flex gap-1 overflow-x-auto pb-1">
              {['all', 'new', 'open', 'pending', 'resolved', 'closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                    filterStatus === s
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  {s === 'all' ? 'Tous' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket cards */}
          <div className="space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={20} className="animate-spin text-gray-500" />
              </div>
            )}
            {!loading && tickets.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <TicketIcon size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun ticket</p>
              </div>
            )}
            {tickets.map(ticket => {
              const statusCfg   = STATUS_CONFIG[ticket.status]
              const priorityCfg = PRIORITY_CONFIG[ticket.priority]
              const isSelected  = selectedTicket?.id === ticket.id

              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all',
                    isSelected
                      ? 'bg-purple-600/15 border-purple-500/40'
                      : 'glass border-white/5 hover:border-white/15 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full', priorityCfg.dot)} />
                      <span className={cn('text-xs', priorityCfg.color)}>{priorityCfg.label}</span>
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{ticket.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">{ticket.ticket_number}</span>
                    <span className="text-xs text-gray-600">{formatDate(ticket.created_at)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Ticket detail */}
        <div className="lg:col-span-2">
          {!selectedTicket ? (
            <div className="glass rounded-3xl border border-white/5 h-full flex flex-col items-center justify-center text-center p-12">
              <Sparkles size={32} className="text-purple-400/40 mb-4" />
              <p className="text-gray-400 font-medium">Sélectionnez un ticket</p>
              <p className="text-gray-600 text-sm mt-1">pour voir les détails et gérer son statut</p>
            </div>
          ) : (
            <div className="glass rounded-3xl border border-white/5 overflow-hidden">
              {/* Detail header */}
              <div className="px-6 py-5 border-b border-white/8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 font-mono">{selectedTicket.ticket_number}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', STATUS_CONFIG[selectedTicket.status].color)}>
                        {STATUS_CONFIG[selectedTicket.status].label}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">{selectedTicket.subject}</h2>
                    {selectedTicket.user_email && (
                      <p className="text-sm text-gray-400 mt-0.5">{selectedTicket.user_email}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-6 py-5 border-b border-white/8">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Actions */}
              <div className="px-6 py-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status update */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Statut</label>
                    <div className="space-y-1.5">
                      {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(s => (
                        <button
                          key={s}
                          disabled={updating === selectedTicket.id}
                          onClick={() => updateTicket(selectedTicket.id, { status: s })}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                            selectedTicket.status === s
                              ? STATUS_CONFIG[s].color
                              : 'bg-white/5 border-white/8 text-gray-400 hover:text-white hover:bg-white/10'
                          )}
                        >
                          {(() => { const Icon = STATUS_CONFIG[s].icon; return <Icon size={12} /> })()}
                          {STATUS_CONFIG[s].label}
                          {updating === selectedTicket.id && selectedTicket.status === s && (
                            <RefreshCw size={10} className="ml-auto animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority update */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Priorité</label>
                    <div className="space-y-1.5">
                      {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map(p => (
                        <button
                          key={p}
                          disabled={updating === selectedTicket.id}
                          onClick={() => updateTicket(selectedTicket.id, { priority: p })}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                            selectedTicket.priority === p
                              ? `${PRIORITY_CONFIG[p].color} bg-white/10 border-white/20`
                              : 'bg-white/5 border-white/8 text-gray-400 hover:text-white hover:bg-white/10'
                          )}
                        >
                          <span className={cn('w-2 h-2 rounded-full', PRIORITY_CONFIG[p].dot)} />
                          {PRIORITY_CONFIG[p].label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Telegram reply */}
                    <div className="mt-4">
                      <label className="text-xs text-gray-400 mb-2 block">Réponse rapide</label>
                      <a
                        href={`https://t.me/omniflowsupport`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-medium transition-all"
                      >
                        <Send size={12} />
                        Répondre via Telegram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
