'use client'
import { useState, useEffect } from 'react'
import {
  Copy, Check, Share2, Users, TrendingUp, DollarSign, 
  MessageCircle, Mail, Phone, QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralStats {
  referralCode: string
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

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, referralsRes] = await Promise.all([
        fetch('/api/referral/stats'),
        fetch('/api/referral/referrals'),
      ])

      if (!statsRes.ok || !referralsRes.ok) throw new Error('Failed to fetch')

      const statsData = await statsRes.json()
      const referralsData = await referralsRes.json()

      setStats(statsData)
      setReferrals(referralsData.referrals || [])
    } catch (error) {
      console.error('Error fetching referral data:', error)
      toast.error('Erreur lors du chargement des données de parrainage')
    } finally {
      setLoading(false)
    }
  }

  const referralLink = stats ? `https://omniflowapp.ai/register?ref=${stats.referralCode}` : ''

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLink = (platform: string) => {
    if (!referralLink) return

    const encoded = encodeURIComponent(referralLink)
    const text = encodeURIComponent('Rejoins OmniFlow et gère tes comptes OnlyFans facilement!')

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      whatsapp: `https://wa.me/?text=${text}%20${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${text}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank')
    }
  }

  const qrUrl = stats
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(referralLink)}`
    : ''

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="h-32 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Programme de Parrainage</h1>
        <p className="text-gray-400 mt-1">Gagne jusqu'à 10% de commission à vie sur chaque agence référée</p>
      </div>

      {/* Mon lien de parrainage */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold mb-6">Mon lien de parrainage</h2>

        {stats && (
          <div className="space-y-6">
            {/* Link display */}
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
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copié!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => shareLink('twitter')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-medium transition-colors"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Twitter</span>
              </button>
              <button
                onClick={() => shareLink('whatsapp')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium transition-colors"
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => shareLink('telegram')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0088cc] hover:bg-[#0077B3] text-white font-medium transition-colors"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Telegram</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-medium transition-colors border border-purple-500/30"
              >
                <QrCode size={16} />
                <span className="hidden sm:inline">QR Code</span>
              </button>
            </div>

            {/* QR Code */}
            {showQR && qrUrl && (
              <div className="bg-black/30 rounded-xl p-6 flex flex-col items-center gap-4">
                <p className="text-sm text-gray-300">Scannez le code pour partager</p>
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-48 h-48 bg-white p-2 rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && (
          <>
            <div className="glass rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Agences référées</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalReferrals}</p>
                </div>
                <Users className="text-purple-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Total depuis le début</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Agences actives</p>
                  <p className="text-3xl font-bold mt-2">{stats.activeReferrals}</p>
                </div>
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Abonnées actuellement</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Commission ce mois</p>
                  <p className="text-3xl font-bold mt-2">{stats.monthlyCommission.toFixed(2)}€</p>
                </div>
                <DollarSign className="text-cyan-400" size={24} />
              </div>
              <p className="text-xs text-gray-500">Mois courant</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-purple-500/20">
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

      {/* Tableau des filleuls */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-purple-500/20">
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
                    <td className="py-3 px-4 text-gray-300">{referral.plan}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'Actif'
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                      }`}>
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
      <div className="glass rounded-2xl p-6 sm:p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold mb-8">Comment ça marche ?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-lg mb-2">Partage</h3>
            <p className="text-gray-400 text-sm">
              Partagez votre lien de parrainage sur vos réseaux ou à vos contacts
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">S'inscrire</h3>
            <p className="text-gray-400 text-sm">
              L'agence s'inscrit via votre lien et commence son essai gratuit
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Commission</h3>
            <p className="text-gray-400 text-sm">
              Vous gagnez 10% de commission à vie tant qu'elle reste abonnée
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg">
          <p className="text-sm text-purple-200">
            <span className="font-bold">💡 Conseil :</span> Plus l'agence reste longtemps abonnée, plus vous gagnez de commissions. Aidez-les à réussir !
          </p>
        </div>
      </div>
    </div>
  )
}
