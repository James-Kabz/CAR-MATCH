"use client"

import { useEffect, useRef, useState } from "react"
import { type Socket } from "socket.io-client"
import io from "socket.io-client"
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<typeof Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        // First, ensure the socket server is running
        await fetch("/api/socket")

        // Create socket connection with proper configuration
        const socket = io({
          path: "/api/socket",
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          timeout: 20000,
        })

        socket.on("connect", () => {
          // console.log("Socket connected:", socket.id)
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
        // console.log("Cleaning up socket connection")
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [])

  // Helper functions for socket operations
  const joinRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-chat", roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-chat", roomId)
    }
  }

  const sendMessage = (data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("send-message", data)
    }
  }

  const sendTyping = (data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing", data)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
  }
}
