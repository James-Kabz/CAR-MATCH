"use client"

export class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = "default"

  private constructor() {
    if (typeof window !== "undefined") {
      this.permission = Notification.permission
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (this.permission === "granted") {
      return true
    }

    if (this.permission === "denied") {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  canShowNotifications(): boolean {
    return typeof window !== "undefined" && "Notification" in window && this.permission === "granted"
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (!this.canShowNotifications()) {
      console.warn("Cannot show notification - permission not granted")
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error("Error showing notification:", error)
      return null
    }
  }

  showMessageNotification(senderName: string, message: string, onClick?: () => void) {
    const notification = this.showNotification(`New message from ${senderName}`, {
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      tag: "new-message",
      requireInteraction: false,
    })

    if (notification && onClick) {
      notification.onclick = () => {
        onClick()
        notification.close()
      }
    }

    return notification
  }

  showInquiryNotification(buyerName: string, listingTitle: string, onClick?: () => void) {
    const notification = this.showNotification("New Inquiry Received", {
      body: `${buyerName} is interested in "${listingTitle}"`,
      tag: "new-inquiry",
      requireInteraction: false,
    })

    if (notification && onClick) {
      notification.onclick = () => {
        onClick()
        notification.close()
      }
    }

    return notification
  }
}

export const notificationService = NotificationService.getInstance()
