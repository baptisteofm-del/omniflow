'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { User, CreditCard, Users, Settings2, Loader2 } from 'lucide-react'

// Lazy load tab content components
const ProfileContent = dynamic(() => import('./components/ProfileContent'), { ssr: false })
const BillingContent = dynamic(() => import('./components/BillingContent'), { ssr: false })
const TeamContent = dynamic(() => import('./components/TeamContent'), { ssr: false })
const IntegrationsContent = dynamic(() => import('./components/IntegrationsContent'), { ssr: false })

type TabId = 'profile' | 'billing' | 'team' | 'integrations'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profil', icon: <User size={16} /> },
  { id: 'billing', label: 'Abonnement', icon: <CreditCard size={16} /> },
  { id: 'team', label: 'Équipes', icon: <Users size={16} /> },
  { id: 'integrations', label: 'Intégrations', icon: <Settings2 size={16} /> },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <User size={28} className="text-purple-400" />
              Mon agence
            </h1>
            <p className="text-gray-400 mt-1">Gérez votre profil, abonnement, équipe et intégrations</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-b-purple-400 text-white'
                    : 'border-b-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8">
        <div className="max-w-screen-xl mx-auto">
          {activeTab === 'profile' && <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={32} /></div>}><ProfileContent /></Suspense>}
          {activeTab === 'billing' && <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={32} /></div>}><BillingContent /></Suspense>}
          {activeTab === 'team' && <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={32} /></div>}><TeamContent /></Suspense>}
          {activeTab === 'integrations' && <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={32} /></div>}><IntegrationsContent /></Suspense>}
        </div>
      </div>
    </div>
  )
}
