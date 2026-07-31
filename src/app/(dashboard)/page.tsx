'use client'
import { AlertCircle } from 'lucide-react'

export default function RecrutementPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recrutement</h1>
        <p className="text-gray-400 mt-2">Trouvez de nouvelles créatrices</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-600" />
        <h2 className="text-xl font-semibold mb-2">Section en développement</h2>
        <p className="text-gray-400">Cette section sera disponible très bientôt. Revenez-nous visiter! 🚀</p>
      </div>
    </div>
  )
}
