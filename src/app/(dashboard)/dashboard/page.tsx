export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Revenus du mois', value: '0 €', trend: '+0%' },
          { label: 'Créatrices actives', value: '0', trend: '+0' },
          { label: 'Messages envoyés', value: '0', trend: '+0%' },
          { label: 'Taux de conversion', value: '0%', trend: '+0%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all"
          >
            <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold mb-2">{stat.value}</p>
            <p className="text-sm text-green-400">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-gray-400">
          Les données apparaîtront ici une fois vos comptes connectés.
        </p>
      </div>
    </div>
  )
}
