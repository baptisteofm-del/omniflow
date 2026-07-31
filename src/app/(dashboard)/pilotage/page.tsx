'use client'
export default function PilottagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pilotage</h1>
        <p className="text-gray-400 mt-2">Administrez votre agence</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-gray-700">Créatrices</div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-gray-700">Équipe</div>
      </div>
    </div>
  )
}
