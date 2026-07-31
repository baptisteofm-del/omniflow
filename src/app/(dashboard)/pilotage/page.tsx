export default function PilotagePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Pilotage</h1>
        <p className="text-gray-400">Vos KPIs et métriques de performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Objectifs du mois</h3>
          <div className="space-y-4">
            {[
              { name: 'Revenus', current: 0, target: 10000, unit: '€' },
              { name: 'Nouvelles créatrices', current: 0, target: 5, unit: '' },
              { name: 'Conversions', current: 0, target: 100, unit: '' },
            ].map((obj) => (
              <div key={obj.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{obj.name}</span>
                  <span className="text-gray-400">
                    {obj.current}{obj.unit} / {obj.target}{obj.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    style={{ width: `${(obj.current / obj.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Performance globale</h3>
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Les graphiques apparaîtront ici</p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-gray-400">
          Connectez vos comptes pour voir vos métriques en temps réel.
        </p>
      </div>
    </div>
  )
}
