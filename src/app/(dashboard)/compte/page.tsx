import { createClient } from '@/lib/supabase/server'

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mon compte</h1>
        <p className="text-gray-400">Gérez vos informations personnelles et abonnement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infos personnelles */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <p className="text-white">{user?.email || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">ID Utilisateur</label>
              <p className="text-white font-mono text-xs">{user?.id || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Créé le</label>
              <p className="text-white">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Abonnement */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Abonnement</h3>
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-4">
            <p className="text-sm text-gray-400 mb-1">Plan actuel</p>
            <p className="text-2xl font-bold">Free</p>
          </div>
          <button className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold">
            Passer au plan Pro
          </button>
        </div>

        {/* Sécurité */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Sécurité</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
              Changer le mot de passe
            </button>
            <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
              Activer la 2FA
            </button>
          </div>
        </div>

        {/* Zone dangereuse */}
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
          <h3 className="text-lg font-semibold mb-4 text-red-400">Zone dangereuse</h3>
          <button className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}
