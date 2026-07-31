'use client'
import { useState, useEffect } from 'react'
import { Search, Plus, Send, Settings, RefreshCw, AlertCircle } from 'lucide-react'

export default function ChattingIAPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedFan, setSelectedFan] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isOpening, setIsOpening] = useState(false)

  // Animation d'ouverture du Chatting
  useEffect(() => {
    setIsOpening(true)
    const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==')
    audio.play().catch(() => {})
    setTimeout(() => setIsOpening(false), 500)
  }, [])

  const models = [
    { id: '1', name: 'Victoriavet', conversations: 45, unread: 8, status: 'ACTIVE' },
    { id: '2', name: 'Oliviabot', conversations: 32, unread: 3, status: 'ACTIVE' },
    { id: '3', name: 'Maddy_secret', conversations: 28, unread: 0, status: 'IDLE' },
  ]

  const fans = [
    { id: '1', name: '@Czxalx', lastMsg: 'Hey babe...', unread: true, time: '2m' },
    { id: '2', name: '@Matt_2713', lastMsg: 'Thanks for the...', unread: false, time: '5m' },
    { id: '3', name: '@Jordan_87', lastMsg: 'Can you send...', unread: true, time: '10m' },
    { id: '4', name: '@Jonathan_408', lastMsg: 'Love your content', unread: false, time: '15m' },
    { id: '5', name: '@Kotirhoporf', lastMsg: 'Hi there!', unread: true, time: '20m' },
  ]

  const conversations = [
    { id: '1', author: '@Czxalx', text: 'Hey babe, can you send me some PPV content?', time: '2m ago', isAI: false },
    { id: '2', author: 'IA', text: 'Thanks for the message! I\'d love to share exclusive content with you. Which type interests you?', time: 'now', isAI: true },
  ]

  return (
    <div className={`space-y-6 transition-all duration-500 ${isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cockpit</h1>
          <p className="text-gray-400 mt-2">Assistant IA pour vos conversations</p>
        </div>
        <button className="p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[700px]">
        {/* 1. Models List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">CONVERSATIONS</p>
              <p className="text-2xl font-bold">150</p>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <Plus size={18} />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button className="flex-1 px-3 py-1 text-xs font-semibold text-gray-400 hover:bg-gray-800 rounded transition">SFW</button>
            <button className="flex-1 px-3 py-1 text-xs font-semibold text-gray-400 hover:bg-gray-800 rounded transition">Stats</button>
          </div>

          <div className="space-y-2 flex-1 overflow-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedModel === model.id
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <p className="font-medium text-sm">{model.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">{model.conversations} convos</p>
                  {model.unread > 0 && <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{model.unread}</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-4 pt-4 text-xs text-gray-400">
            <p>Plateforme MYM · opérationnel</p>
          </div>
        </div>

        {/* 2. Fans List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col overflow-hidden">
          <div className="mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Chercher..."
                className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {selectedModel ? (
            <div className="space-y-1 flex-1 overflow-auto">
              {fans.map((fan) => (
                <button
                  key={fan.id}
                  onClick={() => setSelectedFan(fan.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedFan === fan.id
                      ? 'bg-purple-600/20 border border-purple-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{fan.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-1">{fan.lastMsg}</p>
                    </div>
                    {fan.unread && <div className="w-2 h-2 bg-red-600 rounded-full mt-1 flex-shrink-0 ml-2"></div>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center">
              Sélectionnez une créatrice
            </div>
          )}
        </div>

        {/* 3. Conversation */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
          {selectedFan ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{fans.find(f => f.id === selectedFan)?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Session Active</p>
                </div>
                <button className="p-2 hover:bg-gray-800 rounded-lg transition">
                  <Settings size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {conversations.map((conv) => (
                  <div key={conv.id} className={`flex ${conv.isAI ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      conv.isAI
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="text-sm">{conv.text}</p>
                      <p className="text-xs mt-1 opacity-70">{conv.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800 space-y-3">
                {/* IA Suggestions */}
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-semibold mb-2">💡 Suggestions IA</p>
                  <div className="space-y-1">
                    <button className="w-full text-left text-xs p-2 rounded hover:bg-blue-500/10 transition truncate">
                      "Thanks for subscribing! Check my exclusive..."
                    </button>
                    <button className="w-full text-left text-xs p-2 rounded hover:bg-blue-500/10 transition truncate">
                      "What kind of content would you like to see?"
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <AlertCircle size={32} className="text-gray-600" />
              <div className="text-center">
                <p className="font-medium mb-2">Sélectionne une conversation</p>
                <p className="text-xs">Clique sur un fan pour commencer</p>
              </div>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                → Ouvrir le premier non lu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      {selectedFan && (
        <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3 text-sm text-green-400">
          <p className="font-semibold">✓ ACHAT DÉTECTÉ • +10€ • @CZXALX • 2 minutes ago</p>
        </div>
      )}
    </div>
  )
}
