'use client'
import { useState, useEffect } from 'react'
import { Send, Plus, Trash2, CheckCircle2, XCircle, Loader2, Bot, Users, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

interface TelegramBot {
  id: string
  model_name: string
  channel_id: string
  channel_name: string
  posts_per_day: number
  is_active: boolean
  last_post_at?: string
  total_posts: number
}

const mockBots: TelegramBot[] = [
  { id: '1', model_name: 'Carla', channel_id: '-1001234567890', channel_name: '🔥 Carla VIP', posts_per_day: 5, is_active: true, last_post_at: 'Il y a 2h', total_posts: 142 },
  { id: '2', model_name: 'Victoria', channel_id: '-1009876543210', channel_name: '💫 Victoria OF', posts_per_day: 3, is_active: true, last_post_at: 'Il y a 45min', total_posts: 89 },
]

export default function TelegramPage() {
  const [bots, setBots] = useState<TelegramBot[]>(mockBots)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState<string | null>(null)
  const [form, setForm] = useState({
    model_name: '',
    channel_id: '',
    channel_name: '',
    posts_per_day: 5,
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setBots(prev => [...prev, {
      id: Date.now().toString(),
      ...form,
      is_active: true,
      total_posts: 0,
    }])
    setShowForm(false)
    setForm({ model_name: '', channel_id: '', channel_name: '', posts_per_day: 5 })
    toast.success('Bot configuré ✅')
    setLoading(false)
  }

  const handleTest = async (botId: string) => {
    setTestLoading(botId)
    await new Promise(r => setTimeout(r, 1500))
    toast.success('Message test envoyé dans le canal ✅')
    setTestLoading(null)
  }

  const handleToggle = (botId: string) => {
    setBots(prev => prev.map(b => b.id === botId ? { ...b, is_active: !b.is_active } : b))
  }

  const handleDelete = (botId: string) => {
    setBots(prev => prev.filter(b => b.id !== botId))
    toast.success('Bot supprimé')
  }

  const activeBots = bots.filter(b => b.is_active).length
  const totalPostsToday = bots.reduce((sum, b) => sum + (b.is_active ? b.posts_per_day : 0), 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Send size={22} className="text-blue-400" />
            Bots Telegram
          </h1>
          <p className="text-gray-400 mt-1">Publiez automatiquement dans les canaux de vos modèles</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl font-medium hover:opacity-90 transition-all">
          <Plus size={18} />
          Ajouter un bot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Bots actifs', value: activeBots, icon: Bot, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Canaux gérés', value: bots.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Posts/jour auto', value: totalPostsToday, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Posts total', value: bots.reduce((s, b) => s + b.total_posts, 0), icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={cn('text-2xl font-bold mb-1', s.color)}>{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Guide connexion bot */}
      <div className="glass rounded-2xl p-5 mb-6 border border-blue-500/20">
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <Bot size={16} /> Configuration du bot OmniFlow
        </h3>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal ml-4">
          <li>Ton bot Telegram <strong className="text-white">@omniflowapp_bot</strong> est déjà créé ✅</li>
          <li>Ajoute <strong className="text-white">@omniflowapp_bot</strong> comme <strong>admin</strong> dans le canal de ton modèle</li>
          <li>Récupère l'ID du canal (envoie un message dans le canal puis vérifie via @getidsbot)</li>
          <li>Configure ci-dessous et active le bot</li>
        </ol>
      </div>

      {/* Liste des bots */}
      <div className="space-y-4">
        {bots.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-500">
            <Bot size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Aucun bot configuré</p>
            <p className="text-sm mt-1">Ajoutez votre premier bot pour commencer l'automatisation</p>
          </div>
        ) : bots.map(bot => (
          <div key={bot.id} className={cn('glass rounded-2xl p-5 border transition-all',
            bot.is_active ? 'border-blue-500/20' : 'border-white/5 opacity-60')}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                  'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400')}>
                  {bot.model_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{bot.model_name}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      bot.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                      {bot.is_active ? '● Actif' : '○ Inactif'}
                    </span>
                  </div>
                  <div className="text-sm text-blue-400 mt-0.5">{bot.channel_name}</div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span><Zap size={11} className="inline mr-1" />{bot.posts_per_day} posts/jour</span>
                    {bot.last_post_at && <span><Clock size={11} className="inline mr-1" />Dernier post : {bot.last_post_at}</span>}
                    <span>{bot.total_posts} posts au total</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleTest(bot.id)} disabled={testLoading === bot.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-blue-400 hover:border-blue-500/40 transition-all">
                  {testLoading === bot.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Tester
                </button>
                <button onClick={() => handleToggle(bot.id)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    bot.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30')}>
                  {bot.is_active ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => handleDelete(bot.id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal ajout */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Bot size={20} className="text-blue-400" />
              Configurer un bot
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Modèle</label>
                  <input required value={form.model_name}
                    onChange={e => setForm({...form, model_name: e.target.value})}
                    placeholder="Carla"
                    className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Posts/jour</label>
                  <input type="number" min={1} max={20} value={form.posts_per_day}
                    onChange={e => setForm({...form, posts_per_day: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nom du canal</label>
                <input required value={form.channel_name}
                  onChange={e => setForm({...form, channel_name: e.target.value})}
                  placeholder="🔥 Carla VIP"
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">ID du canal Telegram</label>
                <input required value={form.channel_id}
                  onChange={e => setForm({...form, channel_id: e.target.value})}
                  placeholder="-1001234567890"
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60" />
                <p className="text-xs text-gray-600 mt-1">Utilise @getidsbot pour trouver l'ID</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-semibold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  ✓ Activer le bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
