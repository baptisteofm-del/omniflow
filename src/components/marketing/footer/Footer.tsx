import Link from 'next/link'
import Image from 'next/image'

const links = {
  Produit: [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Affiliation', href: '/affiliation' },
    { label: 'À propos', href: '/about' },
  ],
  Légal: [
    { label: 'CGU', href: '/legal/terms' },
    { label: 'Politique de confidentialité', href: '/legal/privacy' },
    { label: 'Cookies', href: '/legal/cookies' },
  ],
  Support: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Contact', href: '/contact' },
    { label: 'Statut', href: '/status' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-purple-500/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Image src="/logo.svg" alt="Omniflow" width={130} height={32} />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              La plateforme tout-en-un pour automatiser et scaler votre agence OnlyFans.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-300 mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-purple-500/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2025 Omniflow. Tous droits réservés.
          </p>
          <p className="text-gray-600 text-sm">
            Fait avec ❤️ pour les agences qui veulent scaler
          </p>
        </div>
      </div>
    </footer>
  )
}
