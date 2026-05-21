export const metadata = { title: 'Politique de confidentialité — Omniflow' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Politique de confidentialité</h1>
        <p className="text-gray-500 mb-10">Dernière mise à jour : mai 2025</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Données collectées</h2>
            <p>Omniflow collecte les données suivantes :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-400">
              <li>Informations de compte : email, nom de l'agence, mot de passe (hashé)</li>
              <li>Données de facturation : traitées par Paddle/NOWPayments, non stockées chez nous</li>
              <li>Clés API tierces : AdsPower, GeeLark, Telegram (chiffrées en base)</li>
              <li>Données d'utilisation : logs d'activité, statistiques d'usage</li>
              <li>Contenu créé via le Service : vidéos, posts schedulés, rapports</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-400">
              <li>Fournir et améliorer le Service</li>
              <li>Gérer votre abonnement et la facturation</li>
              <li>Vous envoyer des notifications importantes (sécurité, facturation)</li>
              <li>Assurer le support client</li>
              <li>Respecter nos obligations légales</li>
            </ul>
            <p className="mt-3">Nous ne vendons jamais vos données à des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Stockage et sécurité</h2>
            <p>Vos données sont stockées sur les serveurs de Supabase (infrastructure Postgres chiffrée). Les clés API tierces sont chiffrées au repos. Nous appliquons le principe du moindre privilège pour l'accès aux données. Chaque agence ne peut accéder qu'à ses propres données (Row Level Security).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Partage des données</h2>
            <p>Nous partageons vos données uniquement avec :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-400">
              <li><strong>Supabase</strong> — stockage et authentification</li>
              <li><strong>Paddle / NOWPayments</strong> — traitement des paiements</li>
              <li><strong>Vercel</strong> — hébergement de l'application</li>
              <li><strong>Plain</strong> — support client</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-400">
              <li><strong>Accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Rectification</strong> : corriger des données inexactes</li>
              <li><strong>Effacement</strong> : supprimer votre compte et vos données</li>
              <li><strong>Portabilité</strong> : exporter vos données</li>
              <li><strong>Opposition</strong> : vous opposer à certains traitements</li>
            </ul>
            <p className="mt-3">Pour exercer ces droits : <strong>privacy@omniflowapp.ai</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
            <p>Omniflow utilise uniquement des cookies essentiels au fonctionnement du Service (session d'authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact DPO</h2>
            <p>Responsable du traitement : Omniflow — <strong>privacy@omniflowapp.ai</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
