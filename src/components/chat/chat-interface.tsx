"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Send, Loader2, Wifi, WifiOff, Car, DollarSign, MapPin, Info, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChatStore } from "@/store/chat-store"
import { useSocket } from "@/hooks/use-socket"
import { notificationService } from "@/lib/notifications"
import { addInAppNotification } from "@/components/in-app-notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [selectedListingId, setSelectedListingId] = useState<string>("")
  const [availableListings, setAvailableListings] = useState<any[]>([])
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

  // Fetch available listings for the current user
  useEffect(() => {
    const fetchListings = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/listings?sellerId=current`)
        const data = await response.json()
        setAvailableListings(data.listings || [])
      } catch (error) {
        console.error("Error fetching listings:", error)
      }
    }

    fetchListings()
  }, [session?.user?.id])

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
        // Send message to database with optional listing reference
        const messageData = {
          chatRoomId: activeChat.id,
          content: message,
          listingId: selectedListingId || null,
        }

        const response = await fetch("/api/chats/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messageData),
        })

        if (!response.ok) throw new Error("Failed to send message")

        const { message: newMessage } = await response.json()

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
            listingId: selectedListingId || null,
          })
        } else {
          // In production, refresh the chat immediately
          setTimeout(() => {
            fetchChats()
          }, 500)
        }

        setMessage("")
        setSelectedListingId("")

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
      selectedListingId,
      isProduction,
      isConnected,
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
            // Check if message has listing data (after migration)
            const hasListing = msg.listing && typeof msg.listing === "object"

            return (
              <div key={msg.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src={msg.sender.image || ""} alt={msg.sender.name || ""} />
                    <AvatarFallback>{msg.sender.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Car information card attached to message */}
                  {hasListing && (
                    <Card className={`mb-2 ${isCurrentUser ? "bg-blue-50" : "bg-white"} border`}>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                              {msg.listing?.images && msg.listing.images.length > 0 ? (
                                <img
                                  src={msg.listing?.images[0] || "/placeholder.svg"}
                                  alt={msg.listing?.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Car className="h-full w-full p-2 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 truncate">{msg.listing?.title}</h4>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Car className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {msg.listing?.year} {msg.listing?.brand} {msg.listing?.model}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <DollarSign className="h-3 w-3 mr-1" />
                              <span>KES {msg.listing?.price.toLocaleString()}</span>
                              <MapPin className="h-3 w-3 ml-2 mr-1" />
                              <span className="truncate">{msg.listing?.location}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => window.open(`/listings?id=${msg.listing?.id}`, "_blank")}
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Show listing ID if listing data not loaded yet */}
                  {msg.listingId && !hasListing && (
                    <Card className={`mb-2 ${isCurrentUser ? "bg-blue-50" : "bg-white"} border`}>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Car className="h-8 w-8 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Car information loading...</p>
                            <p className="text-xs text-gray-400">ID: {msg.listingId}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message bubble */}
                  <div className={`p-3 rounded-lg ${isCurrentUser ? "bg-blue-600 text-white" : "bg-white border"}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                      {format(new Date(msg.createdAt), "p")}
                    </p>
                  </div>
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
        {/* Car selection dropdown */}
        {availableListings.length > 0 && (
          <div className="mb-3">
            <Select value={selectedListingId || "none"} onValueChange={setSelectedListingId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Attach a car to this message (optional)">
                  {selectedListingId && selectedListingId !== "none" ? (
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2" />
                      {availableListings.find((l) => l.id === selectedListingId)?.title}
                    </div>
                  ) : (
                    <span className="text-gray-500">No car attached</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No car attached</SelectItem>
                {availableListings.map((listing) => (
                  <SelectItem key={listing.id} value={listing.id}>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      {listing.title} - KES {listing.price.toLocaleString()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
