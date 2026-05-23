'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, Users, TrendingUp, DollarSign, QrCode, ArrowUpRight, Link2, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// ── Logos officiels SVG ──────────────────────────────────────
const LogoX = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)

const LogoWhatsApp = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const LogoTelegram = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

interface ReferralStats {
  referralCode: string
  referralLink: string
  totalReferrals: number
  activeReferrals: number
  monthlyCommission: number
  totalCommission: number
}

interface Referral {
  id: string
  name: string
  plan: string
  status: string
  joinedAt: string
  commission: number
}

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', agency: 'Agency' }
const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n)

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, referralsRes] = await Promise.all([
        fetch('/api/referral/stats'),
        fetch('/api/referral/referrals'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (referralsRes.ok) setReferrals((await referralsRes.json()).referrals || [])
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const copy = (type: 'link' | 'code') => {
    const text = type === 'link' ? (stats?.referralLink || '') : (stats?.referralCode || '')
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(type === 'link' ? 'Lien copié' : 'Code copié')
    setTimeout(() => setCopied(null), 2000)
  }

  const share = (platform: 'twitter' | 'whatsapp' | 'telegram') => {
    if (!stats?.referralLink) return
    const url = encodeURIComponent(stats.referralLink)
    const msg = encodeURIComponent('Rejoins OmniFlow — le SaaS qui automatise la gestion des agences OnlyFans. 10% de réduction sur ton premier mois avec mon code.')
    const urls = {
      twitter:  `https://twitter.com/intent/tweet?text=${msg}&url=${url}`,
      whatsapp: `https://wa.me/?text=${msg}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${msg}`,
    }
    window.open(urls[platform], '_blank')
  }

  const conversionRate = stats && stats.totalReferrals > 0
    ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100)
    : 0

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Programme de parrainage</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gagnez <span className="text-purple-400 font-semibold">10% de commission à vie</span> sur chaque agence référée</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-purple-300 font-medium">Programme actif</span>
        </div>
      </div>

      {/* ── LIEN & CODE ── */}
      {stats && (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-transparent">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Link2 size={15} className="text-purple-400" />
              Votre lien de parrainage
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Code */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-xs text-gray-500 flex-shrink-0">Code :</span>
                <code className="text-sm font-mono font-bold text-purple-300 tracking-widest">{stats.referralCode}</code>
              </div>
              <button onClick={() => copy('code')}
                className={cn('flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex-shrink-0',
                  copied === 'code' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10')}>
                {copied === 'code' ? <Check size={13} /> : <Copy size={13} />}
                {copied === 'code' ? 'Copié' : 'Copier'}
              </button>
            </div>

            {/* Lien complet */}
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                <span className="text-xs text-gray-500 font-mono truncate block">{stats.referralLink}</span>
              </div>
              <button onClick={() => copy('link')}
                className={cn('flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0',
                  copied === 'link' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90')}>
                {copied === 'link' ? <Check size={13} /> : <Copy size={13} />}
                {copied === 'link' ? 'Copié' : 'Copier le lien'}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs text-gray-600 mr-1">Partager :</span>
              <button onClick={() => share('twitter')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white text-xs font-medium hover:bg-white/10 hover:border-white/20 transition-all group">
                <LogoX />
                <span>X / Twitter</span>
              </button>
              <button onClick={() => share('whatsapp')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#075e54] border border-[#128c7e]/40 text-white text-xs font-medium hover:bg-[#128c7e] transition-all">
                <LogoWhatsApp />
                <span>WhatsApp</span>
              </button>
              <button onClick={() => share('telegram')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#006699] border border-[#0088cc]/40 text-white text-xs font-medium hover:bg-[#0088cc] transition-all">
                <LogoTelegram />
                <span>Telegram</span>
              </button>
              <button onClick={() => setShowQR(!showQR)}
                className={cn('flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all',
                  showQR ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10')}>
                <QrCode size={14} />
                <span>QR Code</span>
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <div className="flex items-center gap-6 p-4 bg-white/3 border border-white/5 rounded-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(stats.referralLink)}&bgcolor=0d0d14&color=ffffff&format=png`}
                  alt="QR Code"
                  className="w-24 h-24 rounded-lg flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-white mb-1">QR Code de parrainage</p>
                  <p className="text-xs text-gray-500">Faites scanner ce code pour partager votre lien rapidement</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Agences référées', value: stats.totalReferrals.toString(), sub: 'total depuis le début', icon: Users, color: 'text-purple-400', accent: 'border-purple-500/15 hover:border-purple-500/30' },
            { label: 'Agences actives', value: stats.activeReferrals.toString(), sub: `${conversionRate}% de conversion`, icon: TrendingUp, color: 'text-green-400', accent: 'border-green-500/15 hover:border-green-500/30' },
            { label: 'Commission du mois', value: fmt(stats.monthlyCommission), sub: 'mois courant', icon: DollarSign, color: 'text-cyan-400', accent: 'border-cyan-500/15 hover:border-cyan-500/30' },
            { label: 'Commission totale', value: fmt(stats.totalCommission), sub: 'depuis le début', icon: Wallet, color: 'text-yellow-400', accent: 'border-yellow-500/15 hover:border-yellow-500/30' },
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={cn('glass rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.01]', card.accent)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-white/5 rounded-xl"><Icon size={15} className={card.color} /></div>
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
                <div className="text-xs text-gray-700 mt-0.5">{card.sub}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── TABLEAU AFFILIÉS ── */}
      <div className="glass rounded-2xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users size={15} className="text-purple-400" />
            Agences référées
          </h2>
          {referrals.length > 0 && (
            <span className="text-xs text-gray-600">{referrals.length} agence{referrals.length > 1 ? 's' : ''}</span>
          )}
        </div>
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left px-6 py-3 font-medium">Agence</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-right px-6 py-3 font-medium">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {ref.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm text-white font-medium">{ref.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{PLAN_LABELS[ref.plan] || ref.plan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                        ref.status === 'Actif'
                          ? 'bg-green-500/10 text-green-300 border-green-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', ref.status === 'Actif' ? 'bg-green-400' : 'bg-gray-500')} />
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 tabular-nums">{ref.joinedAt}</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-purple-300 tabular-nums">{fmt(ref.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={20} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Aucune agence référée pour le moment</p>
            <p className="text-xs text-gray-700 mt-1">Partagez votre lien pour commencer à générer des commissions</p>
          </div>
        )}
      </div>

      {/* ── COMMENT ÇA MARCHE ── */}
      <div className="glass rounded-2xl border border-white/5 p-6">
        <h2 className="text-sm font-semibold text-white mb-6">Comment ça marche</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Partagez', desc: 'Envoyez votre lien ou code à vos contacts et réseaux.' },
            { step: '02', title: 'Inscription', desc: 'L\'agence s\'inscrit via votre lien et démarre son abonnement.' },
            { step: '03', title: 'Commission', desc: 'Vous recevez 10% de leur abonnement chaque mois, à vie.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-4 bg-white/3 border border-white/5 rounded-xl hover:border-purple-500/20 transition-all">
              <div className="text-2xl font-bold text-white/10 tabular-nums flex-shrink-0 leading-none">{item.step}</div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 px-4 py-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-purple-300 font-semibold">Commission à vie :</span> tant que l'agence reste abonnée, vous percevez 10% de son abonnement mensuel. Aidez-les à réussir pour maximiser vos revenus.
          </p>
        </div>
      </div>

    </div>
  )
}
