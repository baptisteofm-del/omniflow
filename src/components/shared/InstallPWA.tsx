'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    // Check if app was installed (on iOS, this won't work perfectly)
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check localStorage for dismissal
    const isDismissedRecently = localStorage.getItem('pwa_install_dismissed')
    if (isDismissedRecently) {
      setIsDismissed(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      // Show the install prompt
      await installPrompt.prompt()

      // Wait for user choice
      const { outcome } = await installPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)

      // Reset the state
      setInstallPrompt(null)
      setIsVisible(false)

      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
    } catch (error) {
      console.error('Install prompt error:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // Remember dismissal for 7 days
    localStorage.setItem('pwa_install_dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000))
  }

  // Don't show if already installed or dismissed
  if (!isVisible || isInstalled || isDismissed || !installPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold flex items-center gap-2 mb-1">
              <Download size={18} />
              Installez OmniFlow
            </h3>
            <p className="text-sm text-white/90">
              Accédez à OmniFlow comme une vraie app sur votre téléphone
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/95 transition-colors text-sm"
          >
            Installer
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors text-sm"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}
