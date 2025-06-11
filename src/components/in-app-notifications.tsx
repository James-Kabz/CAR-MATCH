"use client"

import { useState, useEffect } from "react"
import { X, Bell, MessageCircle, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface InAppNotification {
  id: string
  type: "message" | "inquiry" | "success" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  onClick?: () => void
}

interface InAppNotificationsProps {
  className?: string
}

export function InAppNotifications({ className }: InAppNotificationsProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Add notification function that can be called from anywhere
  const addNotification = (notification: Omit<InAppNotification, "id" | "timestamp" | "read">) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]) // Keep only 10 notifications

    // Auto-remove after 5 seconds for success/error notifications
    if (notification.type === "success" || notification.type === "error") {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
      }, 5000)
    }
  }

  // Expose the addNotification function globally
  useEffect(() => {
    ;(window as any).addInAppNotification = addNotification
    return () => {
      delete (window as any).addInAppNotification
    }
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4" />
      case "inquiry":
        return <Car className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "message":
        return "text-blue-600"
      case "inquiry":
        return "text-green-600"
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => {
                    markAsRead(notification.id)
                    notification.onClick?.()
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      <div className={`mt-0.5 ${getColor(notification.type)}`}>{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to add notifications from anywhere in the app
export const addInAppNotification = (notification: {
  type: "message" | "inquiry" | "success" | "error"
  title: string
  message: string
  onClick?: () => void
}) => {
  if ((window as any).addInAppNotification) {
    ;(window as any).addInAppNotification(notification)
  }
}
