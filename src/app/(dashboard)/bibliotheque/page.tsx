export default function BibliothequePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Bibliothèque</h1>
        <p className="text-gray-400">Vos ressources et contenus réutilisables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { name: 'Photos', count: 0, icon: '📷' },
          { name: 'Vidéos', count: 0, icon: '🎥' },
          { name: 'Scripts', count: 0, icon: '📝' },
          { name: 'Templates', count: 0, icon: '📄' },
        ].map((cat) => (
          <div
            key={cat.name}
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">{cat.icon}</div>
            <h3 className="font-semibold mb-1">{cat.name}</h3>
            <p className="text-sm text-gray-400">{cat.count} éléments</p>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-gray-400 mb-4">
          Votre bibliothèque est vide. Commencez par ajouter des ressources.
        </p>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold">
          Ajouter une ressource
        </button>
      </div>
    </div>
  )
}
