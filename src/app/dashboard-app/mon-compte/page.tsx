'use client'
import { Trophy } from 'lucide-react'
export default function MonComptePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mon compte</h1>
        <p className="text-gray-400 mt-2">Vos statistiques personnelles</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6"><p className="text-gray-400 text-sm mb-2">Meilleur CA</p><p className="text-2xl font-bold">€45,230</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6"><p className="text-gray-400 text-sm mb-2">Créatrices</p><p className="text-2xl font-bold">3</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6"><p className="text-gray-400 text-sm mb-2">Plus gros PPV</p><p className="text-2xl font-bold">€1,890</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6"><p className="text-gray-400 text-sm mb-2">Total CA</p><p className="text-2xl font-bold">€156K</p></div>
      </div>
    </div>
  )
}
