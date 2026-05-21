'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Load conversation history from localStorage
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('support_chat_history')
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save conversation history to localStorage
  useEffect(() => {
    if (isMounted && messages.length > 0) {
      localStorage.setItem('support_chat_history', JSON.stringify(messages))
    }
  }, [messages, isMounted])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la requête')
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error('Erreur de connexion. Veuillez réessayer.')
      console.error(error)
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = () => {
    setMessages([])
    localStorage.removeItem('support_chat_history')
    toast.success('Historique effacé')
  }

  if (!isMounted) return null

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-full shadow-lg transition-all duration-200 ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline text-sm font-medium">Support</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-32px)] bg-[#1a1a2e] rounded-lg shadow-2xl border border-purple-500/30 flex flex-col h-[600px] max-h-[calc(100vh-48px)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-transparent">
            <div>
              <h3 className="font-semibold text-white">Support OmniFlow</h3>
              <p className="text-xs text-gray-400">Réponses instantanées 24h/24</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <MessageCircle size={40} className="opacity-50 mb-2" />
                <p className="text-sm">Bonjour ! 👋</p>
                <p className="text-xs">Comment puis-je vous aider ?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-white/10 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-gray-100 px-4 py-2 rounded-lg rounded-bl-none text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-purple-500/20 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Footer */}
          {messages.length > 0 && (
            <div className="px-4 py-2 border-t border-purple-500/20 text-xs text-gray-500 flex justify-between items-center">
              <p>{messages.length} messages</p>
              <button
                onClick={handleClearHistory}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
