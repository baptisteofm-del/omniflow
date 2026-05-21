'use client'

import { useEffect, useState } from 'react'
import { Bell, Loader2, CheckCircle, Zap, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message?: string
  read: boolean
  created_at: string
  action_url?: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setMarking(notificationId)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      if (!res.ok) throw new Error('Failed to mark as read')

      await loadNotifications()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur')
    } finally {
      setMarking(null)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post_published':
        return <CheckCircle size={16} className="text-green-400" />
      case 'ai_ready':
        return <Zap size={16} className="text-yellow-400" />
      case 'fan_at_risk':
        return <AlertCircle size={16} className="text-red-400" />
      default:
        return <Bell size={16} className="text-purple-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'post_published':
        return 'bg-green-500/10 border-green-500/20'
      case 'ai_ready':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'fan_at_risk':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-purple-500/10 border-purple-500/20'
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'à l\'instant'
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`
    return `il y a ${Math.floor(seconds / 86400)}j`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 glass rounded-2xl border border-purple-500/20 shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 p-4 border-b border-purple-500/20 bg-white/5 backdrop-blur">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-purple-300 mt-1">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-400" size={20} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell size={24} className="mx-auto mb-2 opacity-50" />
              <p>Pas de notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-purple-500/10">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    notif.read ? '' : 'bg-purple-500/10'
                  }`}
                  onClick={() => notif.action_url && window.open(notif.action_url)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{notif.title}</p>
                      {notif.message && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{timeAgo(notif.created_at)}</p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          markAsRead(notif.id)
                        }}
                        disabled={marking === notif.id}
                        className="p-1 text-purple-400 hover:bg-purple-500/20 rounded transition-colors flex-shrink-0"
                      >
                        {marking === notif.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
