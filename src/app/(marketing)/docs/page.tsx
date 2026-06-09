'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Menu, X } from 'lucide-react'

const sections = [
  { id: 'quickstart', label: 'Démarrage rapide' },
  { id: 'tools', label: 'Connecter vos outils' },
  { id: 'models', label: 'Gestion des modèles' },
  { id: 'posting', label: 'Contenu & Posting' },
  { id: 'kling', label: 'Génération IA' },
  { id: 'finances', label: 'Finances' },
  { id: 'faq', label: 'FAQ rapide' },
  { id: 'affiliation', label: 'Affiliation' },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case 'quickstart':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Démarrage rapide</h2>
            <div className="space-y-4 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Créez votre compte</h4>
                    <p className="text-sm">Inscrivez-vous sur omniflowapp.ai et confirmez votre email.</p>
                  </div>
                </div>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Accédez aux intégrations</h4>
                    <p className="text-sm">Allez dans Paramètres → Intégrations pour connecter vos outils.</p>
                  </div>
                </div>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Connectez AdsPower ou GeeLark</h4>
                    <p className="text-sm">Collez votre clé API et testez la connexion.</p>
                  </div>
                </div>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Ajoutez vos modèles</h4>
                    <p className="text-sm">Créez un nouveau modèle et associez leurs profils.</p>
                  </div>
                </div>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold">5</div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Programmez votre premier post</h4>
                    <p className="text-sm">Allez dans Posting automatique et créez votre premier post!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'tools':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Connecter vos outils</h2>
            <div className="space-y-8 text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">AdsPower</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Ouvrez AdsPower sur votre PC</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Allez dans Paramètres → API</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Copiez votre clé API</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Dans OmniFlow : Paramètres → Intégrations → AdsPower</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Collez votre clé et l'URL locale (http://local.adspower.net:50325)</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Cliquez "Tester la connexion"</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">GeeLark</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Connectez-vous sur geelark.com</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Menu → API → Générer une clé</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Dans OmniFlow : Paramètres → Intégrations → GeeLark</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Collez votre clé API</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Telegram Bot</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Ouvrez Telegram → cherchez @BotFather</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Tapez /newbot → suivez les instructions</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Copiez le token fourni</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Dans OmniFlow : Paramètres → Intégrations → Telegram</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Collez votre token</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'models':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Gestion des modèles</h2>
            <div className="space-y-6 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <p className="mb-4">Pour ajouter et gérer vos modèles OnlyFans :</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Allez dans "Comptes & Modèles"</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Cliquez "Ajouter un modèle"</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Renseignez le nom et la plateforme principale</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Associez un profil AdsPower ou GeeLark</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Le modèle est maintenant prêt pour le posting!</li>
                </ul>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-sm text-cyan-300"><strong>Conseil:</strong> Vous pouvez associer plusieurs profils à un modèle pour gérer plusieurs comptes en parallèle.</p>
              </div>
            </div>
          </div>
        )
      case 'posting':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Contenu & Posting</h2>
            <div className="space-y-6 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Programmer un post automatique</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Allez dans "Posting automatique"</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Cliquez "Nouveau post"</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Sélectionnez le modèle et la plateforme</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Choisissez la date et l'heure</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> OmniFlow exécute automatiquement le post</li>
                </ul>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-3">Veille Trends</h3>
                <p className="text-sm">Utilisez la section "Veille Trends" pour découvrir les tendances Instagram les plus performantes. Notre système apprend de vos likes/dislikes pour affiner les recommandations.</p>
              </div>
            </div>
          </div>
        )
      case 'kling':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Génération IA (Kling)</h2>
            <div className="space-y-6 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Comment générer une vidéo IA</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Allez dans "Génération IA"</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Rédigez votre prompt en anglais pour de meilleurs résultats</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Choisissez la durée (5s ou 10s) et le format (9:16 recommandé)</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Cliquez "Générer" — prêt en 2-4 minutes</li>
                </ul>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-sm text-purple-300"><strong>Note:</strong> Le format 9:16 est idéal pour Instagram Reels et TikTok. L'anglais donne de meilleurs résultats que le français.</p>
              </div>
            </div>
          </div>
        )
      case 'finances':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Finances</h2>
            <div className="space-y-6 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Dashboard Financier</h3>
                <p className="mb-4 text-sm">OmniFlow vous offre une vue complète de vos revenus et dépenses :</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Revenus OnlyFans en temps réel</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Frais de plateforme et charges</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Bénéfices nets par modèle</li>
                  <li className="flex gap-2"><span className="text-cyan-400">•</span> Historique complet et exports CSV</li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'faq':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">FAQ rapide</h2>
            <div className="space-y-4 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h4 className="font-bold text-white mb-2">Quelle est la limite de modèles ?</h4>
                <p className="text-sm">Il n'y a aucune limite ! Gérez autant de modèles que vous le souhaitez.</p>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h4 className="font-bold text-white mb-2">Puis-je programmer mes posts en avance ?</h4>
                <p className="text-sm">Oui ! Programmez vos posts jusqu'à 30 jours à l'avance avec OmniFlow.</p>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h4 className="font-bold text-white mb-2">OmniFlow fonctionne-t-il 24/7 ?</h4>
                <p className="text-sm">Oui ! Vos posts seront publiés automatiquement même si vous dormez.</p>
              </div>
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h4 className="font-bold text-white mb-2">Comment contacter le support ?</h4>
                <p className="text-sm">Visitez notre page <Link href="/contact" className="text-cyan-400 hover:text-cyan-300">Contact</Link> pour rejoindre notre support Telegram ou envoyer un message.</p>
              </div>
            </div>
          </div>
        )
      case 'affiliation':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-6">Affiliation</h2>
            <div className="space-y-6 text-gray-300">
              <div className="glass p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Gagnez de l'argent en parlant d'OmniFlow</h3>
                <p className="text-sm mb-4">Notre programme d'affiliation vous permet de gagner 30% de commission à vie sur chaque client référé.</p>
                <Link
                  href="/affiliation"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  En savoir plus <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Documentation OmniFlow</h1>
          <p className="text-xl text-gray-400">Tout ce dont vous avez besoin pour démarrer et maîtriser OmniFlow</p>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 mb-6 px-4 py-2 glass rounded-lg border border-purple-500/20"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="text-sm font-medium">Menu</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`md:col-span-1 ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
            <div className="glass p-6 rounded-xl border border-purple-500/20 h-fit sticky top-24">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                      activeSection === section.id
                        ? 'glass bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-white'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-purple-500/10'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="glass p-8 rounded-xl border border-purple-500/20">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
