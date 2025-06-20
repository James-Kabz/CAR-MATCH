"use client"

import { useEffect, useRef, useState } from "react"
import { type Socket } from "socket.io-client"
import io from "socket.io-client"

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [isProduction, setIsProduction] = useState(false)
  const socketRef = useRef<typeof Socket | null>(null)

  useEffect(() => {
    // Check if we're in production
    const isProd = process.env.NODE_ENV === "production" || window.location.hostname !== "localhost"
    setIsProduction(isProd)

    // In production, we'll skip socket.io and use polling instead
    if (isProd) {
      console.log("Production environment detected - using polling instead of WebSockets")
      setIsConnected(false)
      return
    }

    // Initialize socket connection only in development
    const initSocket = async () => {
      try {
        // First, ensure the socket server is running
        const response = await fetch("/api/socket")
        if (!response.ok) {
          console.warn("Socket server not available, skipping real-time features")
          return
        }

        // Create socket connection with proper configuration
        const socket = io({
          path: "/api/socket",
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
          forceNew: true,
        })

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id)
          setIsConnected(true)
        })

        socket.on("disconnect", (reason: string) => {
          console.log("Socket disconnected:", reason)
          setIsConnected(false)
        })

        socket.on("connect_error", (error: string) => {
          // console.error("Socket connection error:", error)
          setIsConnected(false)
        })

        socket.on("reconnect", (attemptNumber: string) => {
          console.log("Socket reconnected after", attemptNumber, "attempts")
          setIsConnected(true)
        })

        socket.on("reconnect_error", (error: string) => {
          console.error("Socket reconnection error:", error)
        })

        socketRef.current = socket
      } catch (error) {
        console.error("Failed to initialize socket:", error)
        setIsConnected(false)
      }
    }

    initSocket()

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection")
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [])

  // Helper functions for socket operations
  const joinRoom = (roomId: string) => {
    if (socketRef.current && isConnected && !isProduction) {
      socketRef.current.emit("join-chat", roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && isConnected && !isProduction) {
      socketRef.current.emit("leave-chat", roomId)
    }
  }

  const sendMessage = (data: any) => {
    if (socketRef.current && isConnected && !isProduction) {
      socketRef.current.emit("send-message", data)
    }
  }

  const sendTyping = (data: any) => {
    if (socketRef.current && isConnected && !isProduction) {
      socketRef.current.emit("typing", data)
    }
  }

  return {
    socket: socketRef.current,
    isConnected: !isProduction && isConnected, // Always false in production
    isProduction,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
  }
}
