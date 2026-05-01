'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchNotifications() }, [])

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  async function markAllRead() {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        toast.success('All notifications marked as read')
      }
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="text-teal-700">
            <CheckCheck className="w-4 h-4 mr-2" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">We&apos;ll let you know when something important happens</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-teal-50/30' : ''}`}
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-gray-200' : 'bg-teal-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        {format(new Date(notif.createdAt), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {notif.link && (
                        <Link href={notif.link} className="text-xs text-teal-700 hover:underline">
                          View Details →
                        </Link>
                      )}
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2 text-gray-500"
                          onClick={() => markRead(notif.id)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
