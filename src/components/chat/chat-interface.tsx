"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Send, Loader2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/store/chat-store"
import { useSocket } from "@/hooks/use-socket"
import { notificationService } from "@/lib/notifications"
import { addInAppNotification } from "@/components/in-app-notifications"

export function ChatInterface() {
  const { data: session } = useSession()
  const { activeChat, fetchChats, sendMessage, markAsRead } = useChatStore()
  const {
    socket,
    isConnected,
    isProduction,
    joinRoom,
    leaveRoom,
    sendMessage: socketSendMessage,
    sendTyping,
  } = useSocket()
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set())
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout>(null)
  const currentChatIdRef = useRef<string | null>(null)
  const hasInitializedRef = useRef(false)

  // Memoize current user ID to prevent unnecessary re-renders
  const currentUserId = useMemo(() => session?.user?.id, [session?.user?.id])

  // Memoize other user data
  const otherUser = useMemo(() => {
    return activeChat?.users.find((u) => u.user.id !== currentUserId)?.user
  }, [activeChat?.users, currentUserId])

  // Fetch chats only once on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      fetchChats()
    }
  }, []) // Empty dependency array - only run once

  // Set up polling for production or real-time updates for development
  useEffect(() => {
    if (!activeChat?.id) return

    if (isProduction) {
      // Use polling in production
      console.log("Setting up polling for chat updates")
      pollingIntervalRef.current = setInterval(() => {
        fetchChats()
      }, 3000) // Poll every 3 seconds

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    } else {
      // Use real-time updates in development
      if (!socket || !isConnected) return

      // Leave previous room if exists
      if (currentChatIdRef.current && currentChatIdRef.current !== activeChat.id) {
        leaveRoom(currentChatIdRef.current)
        setTypingUsers([])
      }

      // Join new room
      currentChatIdRef.current = activeChat.id
      joinRoom(activeChat.id)
      // setProcessedMessageIds(new Set())

      return () => {
        if (currentChatIdRef.current) {
          leaveRoom(currentChatIdRef.current)
        }
      }
    }
  }, [activeChat?.id, isProduction, socket, isConnected, joinRoom, leaveRoom, fetchChats])

  // Handle socket events (development only)
  useEffect(() => {
    if (isProduction || !socket || !isConnected) return

    const handleNewMessage = (data: any) => {
      console.log("Received new message:", data)
      if (data.chatRoomId === activeChat?.id) {
        fetchChats()

        // Show notifications if the message is not from the current user
        if (data.senderId !== currentUserId && otherUser) {
          // Browser notification
          notificationService.showMessageNotification(otherUser.name || "Someone", data.content, () => {
            window.focus()
          })

          // In-app notification
          addInAppNotification({
            type: "message",
            title: `New message from ${otherUser.name}`,
            message: data.content.length > 50 ? `${data.content.substring(0, 50)}...` : data.content,
            onClick: () => {
              // Already in chat, just focus
              window.focus()
            },
          })
        }
      }
    }

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId]
          } else {
            return prev.filter((id) => id !== data.userId)
          }
        })
      }
    }

    socket.on("new-message", handleNewMessage)
    socket.on("user-typing", handleUserTyping)

    return () => {
      socket.off("new-message", handleNewMessage)
      socket.off("user-typing", handleUserTyping)
    }
  }, [socket, isConnected, isProduction, activeChat?.id, currentUserId, fetchChats, otherUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && activeChat?.messages?.length !== lastMessageCount) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      setLastMessageCount(activeChat?.messages?.length || 0)
    }
  }, [activeChat?.messages?.length, lastMessageCount])

  // Mark unread messages as read - optimized to prevent loops
  useEffect(() => {
    if (!activeChat?.messages || !currentUserId) return

    const unreadMessages = activeChat.messages.filter(
      (msg) => !msg.isRead && msg.sender.id !== currentUserId && !processedMessageIds.has(msg.id),
    )

    if (unreadMessages.length === 0) return

    // Mark messages as processed immediately to prevent re-processing
    const newProcessedIds = new Set(processedMessageIds)
    unreadMessages.forEach((msg) => newProcessedIds.add(msg.id))
    setProcessedMessageIds(newProcessedIds)

    // Process messages asynchronously
    const processMessages = async () => {
      try {
        await Promise.all(
          unreadMessages.map(async (msg) => {
            try {
              await markAsRead(msg.id)
            } catch (error) {
              console.error(`Failed to mark message ${msg.id} as read:`, error)
              // Remove from processed set if failed
              setProcessedMessageIds((prev) => {
                const newSet = new Set(prev)
                newSet.delete(msg.id)
                return newSet
              })
            }
          }),
        )
      } catch (error) {
        console.error("Error processing read status:", error)
      }
    }

    processMessages()
  }, [activeChat?.messages, currentUserId, markAsRead, processedMessageIds])

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!message.trim() || !activeChat) return

      setIsLoading(true)

      try {
        // Send message to database
        await sendMessage(message)

        // Show success notification
        addInAppNotification({
          type: "success",
          title: "Message Sent",
          message: `Your message was sent to ${otherUser?.name}`,
        })

        // In development, emit via socket for real-time updates
        if (!isProduction && isConnected) {
          socketSendMessage({
            chatRoomId: activeChat.id,
            content: message,
            senderId: currentUserId,
          })
        } else {
          // In production, refresh the chat immediately
          setTimeout(() => {
            fetchChats()
          }, 500)
        }

        setMessage("")

        // Stop typing indicator (development only)
        if (!isProduction && isTyping) {
          setIsTyping(false)
          sendTyping({
            chatRoomId: activeChat.id,
            userId: currentUserId,
            isTyping: false,
          })
        }
      } catch (error) {
        console.error("Error sending message:", error)
        addInAppNotification({
          type: "error",
          title: "Message Failed",
          message: "Failed to send your message. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      message,
      activeChat,
      isProduction,
      isConnected,
      sendMessage,
      socketSendMessage,
      currentUserId,
      isTyping,
      sendTyping,
      fetchChats,
      otherUser,
    ],
  )

  const handleTyping = useCallback(
    (value: string) => {
      setMessage(value)

      // Typing indicators only work in development with socket.io
      if (isProduction || !socket || !activeChat || !currentUserId || !isConnected) return

      // Send typing indicator
      if (!isTyping && value.length > 0) {
        setIsTyping(true)
        sendTyping({
          chatRoomId: activeChat.id,
          userId: currentUserId,
          isTyping: true,
        })
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false)
          sendTyping({
            chatRoomId: activeChat.id,
            userId: currentUserId,
            isTyping: false,
          })
        }
      }, 1000)
    },
    [socket, activeChat, currentUserId, isConnected, isTyping, sendTyping, isProduction],
  )

  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
        <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={otherUser?.image || ""} alt={otherUser?.name || ""} />
            <AvatarFallback>{otherUser?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{otherUser?.name}</h3>
            <p className="text-xs text-gray-500">{otherUser?.email}</p>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center">
          {isProduction ? (
            <Badge variant="secondary" className="text-blue-600">
              Polling Mode
            </Badge>
          ) : isConnected ? (
            <Badge variant="secondary" className="text-green-600">
              <Wifi className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {!activeChat.messages || activeChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          activeChat.messages.map((msg) => {
            const isCurrentUser = msg.sender.id === currentUserId
            return (
              <div key={msg.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src={msg.sender.image || ""} alt={msg.sender.name || ""} />
                    <AvatarFallback>{msg.sender.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    isCurrentUser ? "bg-blue-600 text-white" : "bg-white border"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                    {format(new Date(msg.createdAt), "p")}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator (development only) */}
        {!isProduction && typingUsers.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex items-center">
          <Input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 mr-2"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
