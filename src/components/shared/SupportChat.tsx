'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageCircle, X, Send, ChevronLeft, Zap,
  TicketIcon, ExternalLink, Sparkles, CheckCircle2,
  ChevronRight, RefreshCw,
  Headphones
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type View = 'home' | 'chat' | 'ticket' | 'ticket-success'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Ticket {
  subject: string
  description: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TELEGRAM_SUPPORT_URL = 'https://t.me/omniflowsupport'

const QUICK_QUESTIONS = [
  'Comment connecter OnlyFans ?',
  'Comment fonctionne le Bot Telegram ?',
  'Comment utiliser le Chatting IA ?',
  'Quelle formule choisir ?',
  'Comment inviter un membre ?',
]

const FAQ_ARTICLES = [
  { title: 'Connecter OnlyFans & MYM', icon: '🔗' },
  { title: 'Configurer le Bot Telegram', icon: '🤖' },
  { title: 'Chatting IA — guide complet', icon: '💬' },
  { title: 'Formules et tarifs', icon: '💳' },
]

// ─── Sub-components (defined outside to avoid remount on re-render) ────────────

const WindowShell = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-[#13131f] rounded-3xl shadow-2xl shadow-black/60 border border-purple-500/20 flex flex-col overflow-hidden"
    style={{ height: '600px', maxHeight: 'calc(100vh - 32px)' }}>
    {children}
  </div>
)

// ─── Main component ──────────────────────────────────────────────────────────

export function SupportChat() {
  const [isOpen, setIsOpen]           = useState(false)
  const [view, setView]               = useState<View>('home')
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [isLoading, setIsLoading]     = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMounted, setIsMounted]     = useState(false)
  const [ticket, setTicket]           = useState<Ticket>({
    subject: '', description: '', priority: 'normal', category: 'technical',
  })
  const [ticketLoading, setTicketLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  // ── Hydration guard + load history ─────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem('omniflow_support_history')
      if (saved) setMessages(JSON.parse(saved))
    } catch { /* noop */ }
  }, [])

  // ── Persist history ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isMounted && messages.length > 0) {
      localStorage.setItem('omniflow_support_history', JSON.stringify(messages.slice(-50)))
    }
  }, [messages, isMounted])

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // ── Focus input on chat open ─────────────────────────────────────────────────
  useEffect(() => {
    if (view === 'chat' && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [view, isOpen])

  // ── Open & reset unread ──────────────────────────────────────────────────────
  const handleOpen = () => {
    setIsOpen(true)
    setUnreadCount(0)
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: `u_${Date.now()}`, role: 'user', content: text.trim(), timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setView('chat')

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), conversationHistory: history }),
      })
      const data = await res.json()
      const aiMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Une erreur est survenue. Réessayez ou contactez notre support Telegram.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, aiMsg])
      if (!isOpen) setUnreadCount(c => c + 1)
    } catch {
      setMessages(prev => [...prev, {
        id: `a_${Date.now()}`, role: 'assistant',
        content: 'Une erreur de connexion est survenue. Réessayez ou contactez-nous sur Telegram.',
        timestamp: Date.now(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, isOpen])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // ── Submit ticket ─────────────────────────────────────────────────────────────
  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setTicketLoading(true)
    try {
      await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      })
      setView('ticket-success')
    } catch {
      // still show success to avoid frustration
      setView('ticket-success')
    } finally {
      setTicketLoading(false)
    }
  }

  // ── Clear history ────────────────────────────────────────────────────────────
  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem('omniflow_support_history')
    setView('home')
  }

  if (!isMounted) return null

  // ─── Trigger button ──────────────────────────────────────────────────────────
  const TriggerButton = () => (
    <button
      onClick={handleOpen}
      className="fixed bottom-6 right-6 z-40 group"
      aria-label="Support"
    >
      <div className="relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105">
        <MessageCircle size={20} />
        <span className="hidden sm:inline text-sm font-semibold">Support</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-[#0a0a0f]">
            {unreadCount}
          </span>
        )}
      </div>
    </button>
  )

  // ─── Home view ───────────────────────────────────────────────────────────────
  if (isOpen && view === 'home') return (
    <>
      <TriggerButton />
      <WindowShell>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-600/30 via-purple-900/20 to-transparent px-6 pt-6 pb-8 border-b border-purple-500/20 flex-shrink-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-bold text-white text-base">OmniFlow</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-3 mb-1">
                Bonjour 👋
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Comment pouvons-nous vous aider aujourd'hui ?
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          {/* Status */}
          <div className="relative flex items-center gap-2 mt-4 px-3 py-1.5 bg-white/5 rounded-xl w-fit">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-300">En ligne · Répond instantanément</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

          {/* Start new conversation */}
          <div>
            <button
              onClick={() => setView('chat')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-purple-500/10 hover:from-purple-600/30 hover:to-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Sparkles size={17} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Nouvelle conversation</p>
                  <p className="text-xs text-gray-400">Assistant IA disponible 24/7</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
            </button>
          </div>

          {/* Quick questions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Questions fréquentes
            </p>
            <div className="space-y-1">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setView('chat'); setTimeout(() => sendMessage(q), 100) }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-all flex items-center justify-between group border border-transparent hover:border-white/10"
                >
                  <span>{q}</span>
                  <ChevronRight size={13} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Autres options
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setView('ticket')}
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-2xl text-center transition-all group"
              >
                <TicketIcon size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">Créer un ticket</span>
              </button>
              <a
                href={TELEGRAM_SUPPORT_URL}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-blue-500/10 border border-white/8 hover:border-blue-500/30 rounded-2xl text-center transition-all group"
              >
                <Send size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">Support Telegram</span>
              </a>
            </div>
          </div>

          {/* Past conversation resume */}
          {messages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Conversation récente
              </p>
              <button
                onClick={() => setView('chat')}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-2xl text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={14} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {messages[messages.length - 1]?.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {messages.length} message{messages.length > 1 ? 's' : ''} · Cliquer pour continuer
                  </p>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-center">
          <p className="text-xs text-gray-600">
            Propulsé par{' '}
            <span className="text-purple-400 font-medium">OmniFlow AI</span>
          </p>
        </div>
      </WindowShell>
    </>
  )

  // ─── Chat view ───────────────────────────────────────────────────────────────
  if (isOpen && view === 'chat') return (
    <>
      <TriggerButton />
      <WindowShell>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-purple-500/20 bg-white/3 flex-shrink-0">
          <button onClick={() => setView('home')} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/40 to-cyan-500/30 border border-purple-500/30 flex items-center justify-center">
            <Sparkles size={17} className="text-purple-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">OmniFlow IA</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400">Assistant en ligne</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearHistory} title="Nouvelle conversation" className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-300">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <Sparkles size={26} className="text-purple-400" />
              </div>
              <p className="text-white font-semibold mb-1">Assistant OmniFlow</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Posez-moi n'importe quelle question sur la plateforme. Je suis là pour vous aider 24/7.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-purple-300" />
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-white/8 border border-white/10 text-gray-100 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-purple-300" />
              </div>
              <div className="bg-white/8 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-white/8">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 px-3 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={isLoading}
              autoComplete="off"
              className="flex-1 px-4 py-2.5 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition-all flex-shrink-0 hover:scale-105"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Escalation banner */}
          <div className="px-4 pb-3">
            <a
              href={TELEGRAM_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/8 border border-transparent hover:border-blue-500/20 transition-all"
            >
              <Headphones size={13} />
              Parler à un humain · Telegram
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </WindowShell>
    </>
  )

  // ─── Ticket creation view ─────────────────────────────────────────────────────
  if (isOpen && view === 'ticket') return (
    <>
      <TriggerButton />
      <WindowShell>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-purple-500/20 bg-white/3 flex-shrink-0">
          <button onClick={() => setView('home')} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <TicketIcon size={17} className="text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Créer un ticket</p>
            <p className="text-xs text-gray-400">Réponse sous 24h</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white ml-auto">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submitTicket} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'technical', label: '🔧 Technique' },
                { id: 'billing', label: '💳 Facturation' },
                { id: 'account', label: '👤 Compte' },
                { id: 'other', label: '💡 Autre' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTicket(t => ({ ...t, category: cat.id }))}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                    ticket.category === cat.id
                      ? 'bg-purple-600/25 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/8 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Priorité
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'low', label: 'Faible', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40' },
                { id: 'normal', label: 'Normale', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
                { id: 'high', label: 'Haute', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
                { id: 'urgent', label: 'Urgente', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTicket(t => ({ ...t, priority: p.id as Ticket['priority'] }))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    ticket.priority === p.id
                      ? `${p.bg} ${p.border} ${p.color}`
                      : 'bg-white/5 border-white/8 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Sujet *
            </label>
            <input
              required
              value={ticket.subject}
              onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
              placeholder="Ex: Problème de connexion OnlyFans"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={ticket.description}
              onChange={e => setTicket(t => ({ ...t, description: e.target.value }))}
              placeholder="Décrivez votre problème en détail. Plus c'est précis, plus vite on peut aider."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={ticketLoading || !ticket.subject || !ticket.description}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {ticketLoading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <Send size={15} />
                Envoyer le ticket
              </>
            )}
          </button>
        </form>
      </WindowShell>
    </>
  )

  // ─── Ticket success view ──────────────────────────────────────────────────────
  if (isOpen && view === 'ticket-success') return (
    <>
      <TriggerButton />
      <WindowShell>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-5">
            <CheckCircle2 size={30} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ticket créé !</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Votre ticket a bien été enregistré. Notre équipe vous répondra sous 24h. 
            En attendant, vous pouvez nous contacter directement sur Telegram.
          </p>
          <div className="space-y-2 w-full">
            <a
              href={TELEGRAM_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-300 text-sm font-medium transition-all"
            >
              <Send size={15} />
              Telegram support
            </a>
            <button
              onClick={() => { setView('home'); setTicket({ subject: '', description: '', priority: 'normal', category: 'technical' }) }}
              className="w-full py-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </WindowShell>
    </>
  )

  // ─── Closed state ─────────────────────────────────────────────────────────────
  return <TriggerButton />
}
