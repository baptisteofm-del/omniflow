export default function ChattingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Chatting IA</h1>
        <p className="text-gray-400">Automatisez vos conversations avec l'IA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-semibold mb-2">Conversations actives</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold mb-2">Réponses IA</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="text-lg font-semibold mb-2">Taux de conversion</h3>
          <p className="text-3xl font-bold">0%</p>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-gray-400 mb-4">
          Configurez votre premier chatbot IA pour commencer à automatiser vos conversations.
        </p>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold">
          Créer un chatbot
        </button>
      </div>
    </div>
  )
}
