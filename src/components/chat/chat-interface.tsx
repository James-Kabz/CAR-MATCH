"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Send, Loader2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/store/chat-store"
import { useSocket } from "@/hooks/use-socket"

export function ChatInterface() {
  const { data: session } = useSession()
  const { activeChat, chats, fetchChats, sendMessage, markAsRead } = useChatStore()
  const { socket, isConnected } = useSocket()
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null)

  // Join chat room when active chat changes
  useEffect(() => {
    if (!socket || !activeChat) return

    console.log("Joining chat room:", activeChat.id)
    socket.emit("join-chat", activeChat.id)

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      console.log("Received new message:", data)
      fetchChats()
    }

    // Listen for typing indicators
    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== session?.user?.id) {
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
      socket.emit("leave-chat", activeChat.id)
      socket.off("new-message", handleNewMessage)
      socket.off("user-typing", handleUserTyping)
    }
  }, [socket, activeChat, fetchChats, session])

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages])

  // Mark unread messages as read
  useEffect(() => {
    if (!activeChat || !session?.user) return

    const unreadMessages = activeChat.messages.filter((msg) => !msg.isRead && msg.sender.id !== session?.user?.id)

    unreadMessages.forEach((msg) => {
      markAsRead(msg.id)
    })
  }, [activeChat, session, markAsRead])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeChat || !socket) return

    setIsLoading(true)

    try {
      await sendMessage(message)

      // Emit the message via socket for real-time updates
      socket.emit("send-message", {
        chatRoomId: activeChat.id,
        content: message,
        senderId: session?.user?.id,
      })

      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTyping = (value: string) => {
    setMessage(value)

    if (!socket || !activeChat || !session?.user) return

    // Send typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      socket.emit("typing", {
        chatRoomId: activeChat.id,
        userId: session.user.id,
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
        socket.emit("typing", {
          chatRoomId: activeChat.id,
          userId: session.user!.id,
          isTyping: false,
        })
      }
    }, 1000)
  }

  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
        <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
      </div>
    )
  }

  const otherUser = activeChat.users.find((u) => u.user.id !== session?.user?.id)?.user

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
          {isConnected ? (
            <Badge variant="secondary" className="text-green-600">
              <Wifi className="h-3 w-3 mr-1" />
              Connected
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
        {activeChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          activeChat.messages.map((msg) => {
            const isCurrentUser = msg.sender.id === session?.user?.id
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

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
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
            disabled={isLoading || !isConnected}
          />
          <Button type="submit" size="icon" disabled={isLoading || !message.trim() || !isConnected}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
