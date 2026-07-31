'use client'
import { useState } from 'react'
import { Search, Plus, Send, Settings, MoreVertical, AlertCircle } from 'lucide-react'

export default function ChattingIAPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedFan, setSelectedFan] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const models = [
    { id: '1', name: 'Mimi', platform: 'OnlyFans', status: 'connected', ca: '€8,234', followers: '2,450' },
    { id: '2', name: 'Sophie', platform: 'OnlyFans', status: 'connected', ca: '€12,500', followers: '3,890' },
    { id: '3', name: 'Laura', platform: 'MYM', status: 'pending', ca: '€0', followers: '0' },
  ]

  const fans = [
    { id: '1', name: 'John', lastMsg: 'Hey, how are you?', unread: true, ltv: '€450' },
    { id: '2', name: 'Mike', lastMsg: 'Thanks for the PPV!', unread: false, ltv: '€1,200' },
    { id: '3', name: 'Alex', lastMsg: 'Can you send...', unread: true, ltv: '€320' },
  ]

  const conversations = [
    { id: '1', author: 'John', text: 'Hey, how are you?', time: '2m ago', isAI: false },
    { id: '2', author: 'System', text: 'IA Suggestion: "Doing great! How about you?"', time: 'now', isAI: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Chatting IA</h1>
        <p className="text-gray-400 mt-2">Assistant IA pour vos conversations avec les fans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Mes créatrices</h2>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {models.map((model) => (
              <button key={model.id} onClick={() => setSelectedModel(model.id)} className={`w-full p-3 rounded-lg text-left transition-all ${selectedModel === model.id ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-gray-800/50'}`}>
                <p className="font-medium text-sm">{model.name}</p>
                <p className="text-xs text-gray-400 mt-1">{model.platform}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-auto">
          <div className="mb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Chercher..." className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" />
            </div>
          </div>
          {selectedModel ? <div className="space-y-2">{fans.map((fan) => (<button key={fan.id} onClick={() => setSelectedFan(fan.id)} className={`w-full p-3 rounded-lg text-left text-sm ${selectedFan === fan.id ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-gray-800/50'}`}>{fan.name}</button>))}</div> : <p className="text-gray-400 text-sm text-center mt-8">Sélectionnez une créatrice</p>}
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col">{selectedFan ? <div className="flex-1 flex items-center justify-center"><p className="text-gray-400">Interface de chat à développer</p></div> : <div className="flex items-center justify-center h-full text-gray-400"><p>Sélectionnez un fan pour commencer</p></div>}</div>
      </div>
    </div>
  )
}
