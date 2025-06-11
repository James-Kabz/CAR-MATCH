"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { notificationService } from "@/lib/notifications"

export function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)

      // Show prompt if permission is default and user hasn't dismissed it
      const dismissed = localStorage.getItem("notification-prompt-dismissed")
      if (Notification.permission === "default" && !dismissed) {
        setShowPrompt(true)
      }
    }
  }, [])

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission()
    setPermission(Notification.permission)

    if (granted) {
      setShowPrompt(false)
      // Show a test notification
      notificationService.showNotification("Notifications Enabled!", {
        body: "You'll now receive notifications for new messages and inquiries.",
      })
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("notification-prompt-dismissed", "true")
  }

  if (!showPrompt || permission !== "default") {
    return null
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Enable Notifications</h3>
              <p className="text-sm text-blue-700 mt-1">
                Get notified instantly when you receive new messages or inquiries about your listings.
              </p>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" onClick={handleRequestPermission}>
                  Enable Notifications
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
