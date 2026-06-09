'use client'
import { useState, useEffect } from 'react'
import {
  Copy, Check, Share2, Users, TrendingUp, DollarSign,
  QrCode, Gift
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Logos officiels ──────────────────────────────────────────
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

export default function ReferralContent() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, referralsRes] = await Promise.all([
        fetch('/api/referral/stats'),
        fetch('/api/referral/referrals'),
      ])
      if (!statsRes.ok || !referralsRes.ok) throw new Error('Failed to fetch')
      setStats(await statsRes.json())
      setReferrals((await referralsRes.json()).referrals || [])
    } catch {
      toast.error('Erreur lors du chargement des données de parrainage')
    } finally {
      setLoading(false)
    }
  }

  const referralLink = stats?.referralLink || (stats ? `https://omniflowapp.ai/register?ref=${stats.referralCode}` : '')

  const copyLink = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Lien copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = (platform: 'whatsapp' | 'telegram') => {
    if (!referralLink) return
    const encoded = encodeURIComponent(referralLink)
    const text = encodeURIComponent('Rejoins OmniFlow et gère tes comptes OnlyFans facilement !')
    const urls = {
      whatsapp: `https://wa.me/?text=${text}%20${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${text}`,
    }
    window.open(urls[platform], '_blank')
  }

  const qrUrl = referralLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(referralLink)}`
    : ''

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Mon lien de parrainage */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6">Mon lien de parrainage</h2>

        {stats && (
          <div className="space-y-6">
            {/* Lien */}
            <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
              <p className="text-sm text-gray-400 mb-2">Votre code unique</p>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <code className="flex-1 px-4 py-3 bg-black/30 rounded-lg text-sm text-purple-300 font-mono overflow-x-auto whitespace-nowrap">
                  omniflowapp.ai/register?ref={stats.referralCode}
                </code>
                <button
                  onClick={copyLink}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/30 text-white'
                  }`}
                >
                  {copied ? <><Check size={18} />Copié !</> : <><Copy size={18} />Copier</>}
                </button>
              </div>
            </div>

            {/* Boutons de partage */}
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp */}
              <button
                onClick={() => shareLink('whatsapp')}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#075e54] hover:bg-[#128c7e] text-white font-medium transition-all hover:scale-[1.02] border border-[#128c7e]/30"
              >
                <LogoWhatsApp />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              {/* Telegram */}
              <button
                onClick={() => shareLink('telegram')}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#006699] hover:bg-[#0088cc] text-white font-medium transition-all hover:scale-[1.02] border border-[#0088cc]/30"
              >
                <LogoTelegram />
                <span className="hidden sm:inline">Telegram</span>
              </button>
              {/* QR Code */}
              <button
                onClick={() => setShowQR(!showQR)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] border ${
                  showQR
                    ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
                    : 'bg-white/5 hover:bg-white/8 border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <QrCode size={16} />
                <span className="hidden sm:inline">QR Code</span>
              </button>
            </div>

            {/* QR Code display */}
            {showQR && qrUrl && (
              <div className="bg-black/30 rounded-xl p-6 flex flex-col items-center gap-4 border border-purple-500/20">
                <p className="text-sm text-gray-300">Scannez le code pour partager</p>
                <img src={qrUrl} alt="QR Code de parrainage" className="w-48 h-48 bg-white p-2 rounded-lg" />
                <p className="text-xs text-gray-500">Ce QR code pointe vers votre lien unique</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && (
          <>
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-purple-500/40 transition-all hover:scale-[1.01]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Agences référées</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalReferrals}</p>
                </div>
                <Users className="text-purple-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Total depuis le début</p>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-green-500/40 transition-all hover:scale-[1.01]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Agences actives</p>
                  <p className="text-3xl font-bold mt-2">{stats.activeReferrals}</p>
                </div>
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Abonnées actuellement</p>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-cyan-500/40 transition-all hover:scale-[1.01]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Commission ce mois</p>
                  <p className="text-3xl font-bold mt-2">{stats.monthlyCommission.toFixed(2)}€</p>
                </div>
                <DollarSign className="text-cyan-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Mois courant</p>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-yellow-500/40 transition-all hover:scale-[1.01]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Commission totale</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalCommission.toFixed(2)}€</p>
                </div>
                <DollarSign className="text-yellow-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Tous les temps</p>
            </div>
          </>
        )}
      </div>

      {/* Tableau filleuls */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6">Vos agences référées</h2>

        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Nom</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Statut</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Commission</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-purple-500/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{referral.name}</td>
                    <td className="py-3 px-4 text-gray-300 capitalize">{referral.plan}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'Actif'
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${referral.status === 'Actif' ? 'bg-green-400' : 'bg-gray-500'}`} />
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{referral.joinedAt}</td>
                    <td className="py-3 px-4 text-right text-purple-300 font-bold">{referral.commission.toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto mb-4 text-gray-600" size={40} />
            <p className="text-gray-400">Aucune agence référée pour le moment.</p>
            <p className="text-gray-500 text-sm mt-2">Partagez votre lien pour commencer à gagner des commissions !</p>
          </div>
        )}
      </div>

      {/* Comment ça marche */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-8">Comment ça marche ?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { num: '1', title: 'Partage', desc: "Partagez votre lien de parrainage sur vos réseaux ou à vos contacts" },
            { num: '2', title: "S'inscrire", desc: "L'agence s'inscrit via votre lien et commence son essai gratuit" },
            { num: '3', title: 'Commission', desc: "Vous gagnez 10% de commission à vie tant qu'elle reste abonnée" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                {step.num}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-purple-500/8 border border-purple-500/20 rounded-xl">
          <p className="text-sm text-purple-200">
            <span className="font-bold">Conseil :</span> Plus l'agence reste longtemps abonnée, plus vous gagnez de commissions. Aidez-les à réussir !
          </p>
        </div>
      </div>
    </div>
  )
}
