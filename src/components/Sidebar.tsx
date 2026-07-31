'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  MessageSquare,
  Library,
  Sliders,
  Settings,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Recrutement', href: '/recrutement' },
    { icon: Megaphone, label: 'Marketing', href: '/marketing' },
    { icon: MessageSquare, label: 'Chatting IA', href: '/chatting-ia' },
    { icon: Library, label: 'Banque de ressources', href: '/banque-ressources' },
    { icon: Sliders, label: 'Pilotage', href: '/pilotage' },
    { icon: Settings, label: 'Mon compte', href: '/mon-compte' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
          OmniFlow
        </h1>
        <p className="text-xs text-gray-500 mt-1">Agence Manager</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/mon-compte"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-900/50 transition-all"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
            BA
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200">Baptiste</p>
            <p className="text-xs text-gray-500">Agence Manager</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
