"use client"

import { useState, useEffect } from "react"
import { X, Bell, MessageCircle, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface InAppNotification {
  id: string
  type: "message" | "enquiry" | "success" | "error" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  count?: number // For grouped notifications
  onClick?: () => void
}

interface InAppNotificationsProps {
  className?: string
  mobile?: boolean
  initialUnreadMessages?: number
  initialUnreadEnquiries?: number
}

export function InAppNotifications({
  className,
  mobile = false,
  initialUnreadMessages = 0,
  initialUnreadEnquiries = 0,
}: InAppNotificationsProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages)
  const [unreadEnquiries, setUnreadEnquiries] = useState(initialUnreadEnquiries)

  // Initialize with counts if provided
  useEffect(() => {
    if (initialUnreadMessages > 0) {
      addNotification({
        type: "message",
        title: "Unread Messages",
        message: `You have ${initialUnreadMessages} unread messages`,
        count: initialUnreadMessages,
      })
    }
    if (initialUnreadEnquiries > 0) {
      addNotification({
        type: "enquiry",
        title: "New Enquiries",
        message: `You have ${initialUnreadEnquiries} new enquiries`,
        count: initialUnreadEnquiries,
      })
    }
  }, [initialUnreadMessages, initialUnreadEnquiries])

  const addNotification = (notification: Omit<InAppNotification, "id" | "timestamp" | "read">) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => {
      // For message/enquiry counts, update existing notification if exists
      if (notification.type === "message" || notification.type === "enquiry") {
        const existingIndex = prev.findIndex(n => n.type === notification.type)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = {
            ...newNotification,
            count: (notification.count || 0) + (updated[existingIndex].count || 0)
          }
          return updated
        }
      }
      return [newNotification, ...prev.slice(0, 9)] // Keep only 10 notifications
    })

    // Update counts
    if (notification.type === "message") {
      setUnreadMessages(prev => prev + (notification.count || 1))
    } else if (notification.type === "enquiry") {
      setUnreadEnquiries(prev => prev + (notification.count || 1))
    }

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

  const markAsRead = (id: string, type?: "message" | "enquiry") => {
    setNotifications((prev) => 
      prev.map((n) => 
        n.id === id ? { ...n, read: true } : n
      )
    )
    
    if (type === "message") {
      setUnreadMessages(0)
    } else if (type === "enquiry") {
      setUnreadEnquiries(0)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadMessages(0)
    setUnreadEnquiries(0)
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const totalUnreadCount = unreadCount + unreadMessages + unreadEnquiries

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4" />
      case "enquiry":
        return <Car className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "message":
        return "text-blue-600"
      case "enquiry":
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
      <Button 
        variant="ghost" 
        size={mobile ? "icon" : "sm"} 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {totalUnreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className={`absolute ${mobile ? 'left-0' : 'right-0'} top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50`}>
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={totalUnreadCount === 0}
              >
                Mark all as read
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && unreadMessages === 0 && unreadEnquiries === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {/* Unread messages summary */}
                {unreadMessages > 0 && (
                  <div
                    className="p-3 border-b hover:bg-gray-50 cursor-pointer bg-blue-50"
                    onClick={() => {
                      markAsRead('messages', 'message')
                      // Add your navigation to messages page here
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <div className="text-blue-600 mt-0.5">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">Unread Messages</p>
                          <p className="text-sm text-gray-600">
                            You have {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {unreadMessages}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Unread enquiries summary */}
                {unreadEnquiries > 0 && (
                  <div
                    className="p-3 border-b hover:bg-gray-50 cursor-pointer bg-green-50"
                    onClick={() => {
                      markAsRead('enquiries', 'enquiry')
                      // Add your navigation to enquiries page here
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <div className="text-green-600 mt-0.5">
                          <Car className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">New Enquiries</p>
                          <p className="text-sm text-gray-600">
                            You have {unreadEnquiries} new enquir{unreadEnquiries !== 1 ? 'ies' : 'y'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {unreadEnquiries}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Other notifications */}
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-gray-50" : ""}`}
                    onClick={() => {
                      markAsRead(notification.id, notification.type === 'message' ? 'message' : notification.type === 'enquiry' ? 'enquiry' : undefined)
                      notification.onClick?.()
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <div className={`mt-0.5 ${getColor(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {notification.count && notification.count > 1 && (
                        <Badge variant="secondary" className="ml-2">
                          {notification.count}
                        </Badge>
                      )}
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
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to add notifications from anywhere in the app
export const addInAppNotification = (notification: {
  type: "message" | "enquiry" | "success" | "error" | "info"
  title: string
  message: string
  count?: number
  onClick?: () => void
}) => {
  if ((window as any).addInAppNotification) {
    ;(window as any).addInAppNotification(notification)
  }
}

// Helper function to update message count
export const updateMessageCount = (count: number) => {
  if ((window as any).addInAppNotification) {
    ;(window as any).addInAppNotification({
      type: "message",
      title: "Unread Messages",
      message: `You have ${count} unread message${count !== 1 ? 's' : ''}`,
      count,
    })
  }
}

// Helper function to update enquiry count
export const updateEnquiryCount = (count: number) => {
  if ((window as any).addInAppNotification) {
    ;(window as any).addInAppNotification({
      type: "enquiry",
      title: "New Enquiries",
      message: `You have ${count} new enquir${count !== 1 ? 'ies' : 'y'}`,
      count,
    })
  }
}