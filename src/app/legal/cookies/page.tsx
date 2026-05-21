export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Politique de cookies</h1>
          <p className="text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="glass p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-gray-300 leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre navigateur. Il permet aux sites web de mémoriser vos préférences et votre activité. Les cookies ne contiennent pas de virus et ne peuvent pas exécuter du code.
            </p>
          </div>

          {/* Section 2 */}
          <div className="glass p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">2. Cookies que nous utilisons</h2>
            <p className="text-gray-300 mb-6">Omniflow utilise les cookies suivants pour fonctionner correctement :</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Nom du cookie</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Finalité</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4 text-gray-400">sb-auth-token</td>
                    <td className="py-3 px-4 text-gray-400">Authentification Supabase</td>
                    <td className="py-3 px-4 text-gray-400">Session</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4 text-gray-400">sb-refresh-token</td>
                    <td className="py-3 px-4 text-gray-400">Renouvellement de la session</td>
                    <td className="py-3 px-4 text-gray-400">7 jours</td>
                  </tr>
                  <tr className="border-b border-purple-500/10">
                    <td className="py-3 px-4 text-gray-400">_vercel_analytics</td>
                    <td className="py-3 px-4 text-gray-400">Performance anonyme du site</td>
                    <td className="py-3 px-4 text-gray-400">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">3. Cookies tiers</h2>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-cyan-300 text-sm">
                ✓ <strong>Omniflow ne contient aucun cookie publicitaire ou de tracking tiers.</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Nous respectons votre vie privée et ne partageons aucune donnée avec des tiers à des fins publicitaires.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="glass p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">4. Gestion des cookies</h2>
            <p className="text-gray-300 mb-6">Vous pouvez gérer ou supprimer les cookies via les paramètres de votre navigateur :</p>
            
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔍 Google Chrome</h4>
                <p className="text-gray-400 text-sm">Paramètres → Confidentialité et sécurité → Cookies et données de sites</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🦊 Mozilla Firefox</h4>
                <p className="text-gray-400 text-sm">Paramètres → Vie privée et sécurité → Cookies et données de sites</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🍎 Safari</h4>
                <p className="text-gray-400 text-sm">Préférences → Confidentialité → Gérer les données de site</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <strong>⚠️ Attention :</strong> Désactiver les cookies essentiels peut affecter le fonctionnement d'Omniflow. Nous vous recommandons de maintenir les cookies d'authentification activés.
            </p>
          </div>

          {/* Section 5 */}
          <div className="glass p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact</h2>
            <p className="text-gray-300 mb-4">
              Des questions sur nos cookies ? Nous sommes là pour vous aider.
            </p>
            <div className="space-y-2 text-gray-400">
              <p>📧 <strong>Email :</strong> privacy@omniflowapp.ai</p>
              <p>💬 <strong>Telegram :</strong> @omniflowsupport</p>
            </div>
          </div>

          {/* Last updated */}
          <div className="text-center pt-8 border-t border-purple-500/20">
            <p className="text-gray-500 text-sm">
              © 2025 Omniflow. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
