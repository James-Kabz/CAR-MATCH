import { create } from "zustand"
import type { ChatMessage, ChatRoom, User } from "@prisma/client"

type ChatRoomWithUsers = ChatRoom & {
  users: { user: User }[]
  messages: (ChatMessage & { sender: User })[]
}

interface ChatState {
  activeChat: ChatRoomWithUsers | null
  chats: ChatRoomWithUsers[]
  isLoading: boolean
  error: string | null
  lastFetchTime: number
  isProduction: boolean
  setActiveChat: (chatId: string | null) => void
  fetchChats: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  addMessage: (message: ChatMessage & { sender: User }) => void
  updateChatLastMessage: (chatRoomId: string, message: ChatMessage & { sender: User }) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeChat: null,
  chats: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,
  isProduction:
    typeof window !== "undefined" &&
    (process.env.NODE_ENV === "production" || window.location.hostname !== "localhost"),

  setActiveChat: (chatId) => {
    if (!chatId) {
      set({ activeChat: null })
      return
    }

    const chat = get().chats.find((c) => c.id === chatId)
    set({ activeChat: chat || null })
  },

  fetchChats: async () => {
    const now = Date.now()
    const { lastFetchTime, isLoading, isProduction } = get()

    // Adjust debounce time based on environment
    const debounceTime = isProduction ? 1000 : 2000

    // Prevent fetching too frequently (debounce)
    if (isLoading || now - lastFetchTime < debounceTime) {
      return
    }

    set({ isLoading: true, error: null, lastFetchTime: now })

    try {
      const response = await fetch("/api/chats", {
        cache: "no-store", // Ensure fresh data in production
      })
      if (!response.ok) throw new Error("Failed to fetch chats")

      const data = await response.json()
      const chats = data.chats || []

      // Update chats
      set({ chats, isLoading: false })

      // Update active chat if it exists in the new data
      const { activeChat } = get()
      if (activeChat) {
        const updatedActiveChat = chats.find((c: ChatRoomWithUsers) => c.id === activeChat.id)
        if (updatedActiveChat) {
          set({ activeChat: updatedActiveChat })
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false })
    }
  },

  sendMessage: async (content) => {
    const activeChat = get().activeChat
    if (!activeChat) return

    try {
      const response = await fetch("/api/chats/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatRoomId: activeChat.id, content }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const { message } = await response.json()

      // Add message to local state immediately for better UX
      get().addMessage(message)
      get().updateChatLastMessage(activeChat.id, message)
    } catch (error) {
      console.error("Error sending message:", error)
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  markAsRead: async (messageId) => {
    try {
      const response = await fetch(`/api/chats/messages/${messageId}/read`, {
        method: "PUT",
      })

      if (!response.ok) {
        // If the message doesn't exist or is already read, don't throw an error
        if (response.status === 404) {
          console.warn(`Message ${messageId} not found or already processed`)
          return
        }
        throw new Error(`Failed to mark message as read: ${response.status}`)
      }

      // Update local state optimistically
      const { chats, activeChat } = get()

      const updatedChats = chats.map((chat) => ({
        ...chat,
        messages: chat.messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)),
      }))

      let updatedActiveChat = activeChat
      if (activeChat) {
        updatedActiveChat = {
          ...activeChat,
          messages: activeChat.messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)),
        }
      }

      set({
        chats: updatedChats,
        activeChat: updatedActiveChat,
      })
    } catch (error) {
      console.error("Error marking message as read:", error)
      // Don't set error state for read status failures to avoid UI disruption
    }
  },

  addMessage: (message) => {
    const { activeChat, chats } = get()

    // Update active chat if it matches
    if (activeChat && activeChat.id === message.chatRoomId) {
      const messageExists = activeChat.messages.some((msg) => msg.id === message.id)
      if (!messageExists) {
        const updatedActiveChat = {
          ...activeChat,
          messages: [...activeChat.messages, message],
        }
        set({ activeChat: updatedActiveChat })
      }
    }

    // Update the chat in the chats list
    const updatedChats = chats.map((chat) => {
      if (chat.id === message.chatRoomId) {
        const messageExists = chat.messages.some((msg) => msg.id === message.id)
        if (!messageExists) {
          return {
            ...chat,
            messages: [...chat.messages, message],
            updatedAt: new Date(),
          }
        }
      }
      return chat
    })

    set({ chats: updatedChats })
  },

  updateChatLastMessage: (chatRoomId, message) => {
    const { chats } = get()

    const updatedChats = chats
      .map((chat) => {
        if (chat.id === chatRoomId) {
          return {
            ...chat,
            updatedAt: new Date(),
          }
        }
        return chat
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    set({ chats: updatedChats })
  },
}))
