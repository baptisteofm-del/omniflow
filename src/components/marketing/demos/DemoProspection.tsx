'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Creator {
  id: number
  name: string
  avatar: string
  stats: string
  compatibility: number
}

const creators: Creator[] = [
  { id: 1, name: 'Marie', avatar: '👩‍🦰', stats: '2.4K subs', compatibility: 92 },
  { id: 2, name: 'Sophie', avatar: '👩', stats: '1.8K subs', compatibility: 78 },
  { id: 3, name: 'Jessica', avatar: '👱', stats: '3.1K subs', compatibility: 85 },
]

const contactMessages = [
  'Salut ! J\'aime ton univers. On pourrait collaborer ? 💫',
  'Hey, intéressée par une col exclusif ? 🎬',
  'Tes contenus sont incroyables ! Suis fan 🔥',
]

export function DemoProspection() {
  const [searchText, setSearchText] = useState('')
  const [displayedCreators, setDisplayedCreators] = useState<Creator[]>([])
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const [messageSent, setMessageSent] = useState(false)
  const [totalAnalyzed, setTotalAnalyzed] = useState(127)
  const [qualifiedContacts, setQualifiedContacts] = useState(12)
  const [searchProgress, setSearchProgress] = useState(0)
  const [showSearch, setShowSearch] = useState(true)

  const displaySearch = 'Créatrices OnlyFans 18-25 ans'

  useEffect(() => {
    const sequence = () => {
      setShowSearch(true)
      setSearchText('')
      setDisplayedCreators([])
      setSelectedCreator(null)
      setMessageSent(false)
      setSearchProgress(0)

      // Typewriter search
      let idx = 0
      const typeInterval = setInterval(() => {
        if (idx <= displaySearch.length) {
          setSearchText(displaySearch.substring(0, idx))
          idx++
        } else {
          clearInterval(typeInterval)
          setSearchProgress(0)

          // Start cascade display
          setTimeout(() => {
            creators.forEach((creator, i) => {
              setTimeout(() => {
                setDisplayedCreators((prev) => [...prev, creator])
                setTotalAnalyzed((prev) => prev + Math.floor(Math.random() * 5))
              }, i * 300)
            })
          }, 500)

          // Select first creator
          setTimeout(() => {
            setSelectedCreator(creators[0])
            setMessageIndex(Math.floor(Math.random() * contactMessages.length))
          }, 1500)

          // Send message
          setTimeout(() => {
            setMessageSent(true)
            setQualifiedContacts((prev) => prev + 1)
          }, 3500)

          // Reset
          setTimeout(() => {
            setShowSearch(false)
          }, 5500)
        }
      }, 40)

      return () => clearInterval(typeInterval)
    }

    sequence()
    const interval = setInterval(sequence, 8000)
    return () => clearInterval(interval)
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
            <span className="text-gray-400 text-xs font-medium ml-auto">Prospection</span>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 min-h-[500px]">
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: showSearch ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <label className="text-xs font-semibold text-gray-400 uppercase">Recherche</label>
              <div className="p-3 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur">
                <p className="text-gray-200 font-mono text-sm">
                  {searchText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-1 h-4 bg-purple-500 ml-1"
                  />
                </p>
              </div>
            </motion.div>

            {/* Results grid */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-4">
                Profils trouvés ({displayedCreators.length})
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {displayedCreators.map((creator, idx) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedCreator(creator)}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedCreator?.id === creator.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-gray-600/30 bg-gray-900/30 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">{creator.avatar}</span>
                      <div className="text-center">
                        <p className="font-semibold text-white text-sm">{creator.name}</p>
                        <p className="text-xs text-gray-400">{creator.stats}</p>
                      </div>

                      {/* Compatibility score */}
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Compatibilité</span>
                          <span className="text-xs font-semibold text-cyan-400">{creator.compatibility}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${creator.compatibility}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact message area */}
              {selectedCreator && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-purple-500/20 pt-6 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase">
                      Message de prise de contact
                    </label>
                    <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur min-h-16">
                      <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-gray-200 text-sm leading-relaxed"
                      >
                        {contactMessages[messageIndex]}
                      </motion.p>
                    </div>
                  </div>

                  {/* Send button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      messageSent
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-purple-300 hover:from-purple-500/40 hover:to-cyan-500/40'
                    }`}
                  >
                    {messageSent ? (
                      <>
                        <span>✓ Envoyé</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Envoyer la démarche
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Stats footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-t border-purple-500/20 pt-6 grid grid-cols-2 gap-4"
            >
              <div>
                <p className="text-xs text-gray-400 mb-2">Profils analysés</p>
                <motion.p
                  key={totalAnalyzed}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-cyan-400"
                >
                  {totalAnalyzed}
                </motion.p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Contacts qualifiés</p>
                <motion.p
                  key={qualifiedContacts}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-green-400"
                >
                  {qualifiedContacts}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
