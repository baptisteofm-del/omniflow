'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

interface Message {
  type: 'user' | 'ai'
  content: string
  delay?: number
}

interface Conversation {
  id: number
  name: string
  lastMessage: string
  avatar: string
}

const conversations: Conversation[] = [
  { id: 1, name: 'Emma', lastMessage: 't\'es dispo ce soir ? 🔥', avatar: '👩' },
  { id: 2, name: 'Sophie', lastMessage: 'envois-moi un preview...', avatar: '💁' },
  { id: 3, name: 'Léa', lastMessage: 'j\'aime trop ton contenu 😍', avatar: '🎀' },
]

const messageSequence: Message[] = [
  { type: 'user', content: 't\'es dispo ce soir ? 🔥', delay: 0 },
  { type: 'ai', content: 'Toujours pour toi 😈 j\'ai quelque chose de spécial... tu veux voir ? 👀', delay: 1500 },
  { type: 'user', content: 'c\'est quoi ?', delay: 3000 },
  { type: 'ai', content: 'Une surprise exclusive... seulement pour toi babe 💋', delay: 4500 },
  { type: 'user', content: 'combien ?', delay: 6000 },
  { type: 'ai', content: 'Pour toi c\'est 15€ seulement, accès immédiat ❤️‍🔥', delay: 7500 },
]

export function DemoChattingIA() {
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversation, setActiveConversation] = useState(0)
  const [activeConversations, setActiveConversations] = useState(3)
  const [messagesPerHour, setMessagesPerHour] = useState(47)
  const [engagement, setEngagement] = useState(89)
  const [revenue, setRevenue] = useState(420)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    const runSequence = () => {
      setMessages([])
      messageSequence.forEach((msg) => {
        const timer = setTimeout(() => {
          setMessages((prev) => [...prev, msg])
        }, msg.delay)
        timers.push(timer)
      })

      // Update stats
      const statsTimer = setTimeout(() => {
        setMessagesPerHour((prev) => prev + Math.floor(Math.random() * 5))
        setEngagement((prev) => Math.min(prev + Math.floor(Math.random() * 2), 99))
        setRevenue((prev) => prev + Math.floor(Math.random() * 50))
      }, 4000)
      timers.push(statsTimer)

      // Reset
      const resetTimer = setTimeout(() => {
        setMessages([])
      }, 9000)
      timers.push(resetTimer)
    }

    runSequence()
    const interval = setInterval(runSequence, 11000)

    return () => {
      clearInterval(interval)
      timers.forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full perspective"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{ rotateX: -5, rotateY: 5 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0a0a10] shadow-2xl"
             style={{ boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
          {/* Mac window bar */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium ml-auto">Chatting IA</span>
          </div>

          {/* Content */}
          <div className="flex h-[500px]">
            {/* Left: Conversations list */}
            <div className="w-1/4 border-r border-purple-500/20 bg-gradient-to-b from-slate-900 to-slate-800/50 p-4 space-y-2 overflow-y-auto">
              {conversations.map((conv, idx) => (
                <motion.div
                  key={conv.id}
                  onClick={() => setActiveConversation(idx)}
                  whileHover={{ x: 4 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    activeConversation === idx
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-gray-600/20 bg-gray-900/20 hover:bg-gray-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{conv.avatar}</span>
                    <span className="text-sm font-semibold text-white truncate">{conv.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                </motion.div>
              ))}
            </div>

            {/* Center: Chat */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900/50 to-slate-800/30">
              {/* Chat header */}
              <div className="border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{conversations[activeConversation].avatar}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{conversations[activeConversation].name}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs text-gray-400">IA Active 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                        msg.type === 'user'
                          ? 'bg-purple-500/30 border border-purple-500/50 text-gray-100'
                          : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {messages.length > 0 && messages[messages.length - 1]?.type === 'ai' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="text-xs text-gray-500">
                      ✓ Message reçu et en cours d'exécution
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="w-1/4 border-l border-purple-500/20 bg-gradient-to-b from-slate-900 to-slate-800/50 p-4 space-y-4 flex flex-col">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Messages/h</p>
                <motion.p
                  key={messagesPerHour}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-cyan-400"
                >
                  {messagesPerHour}
                </motion.p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Taux engagement</p>
                <motion.p
                  key={engagement}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-green-400"
                >
                  {engagement}%
                </motion.p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Revenue générée</p>
                <motion.p
                  key={revenue}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-pink-400"
                >
                  ${revenue}
                </motion.p>
              </div>

              <div className="mt-auto pt-4 border-t border-purple-500/20">
                <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-semibold">IA en ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
