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

  setActiveChat: (chatId) => {
    if (!chatId) {
      set({ activeChat: null })
      return
    }

    const chat = get().chats.find((c) => c.id === chatId)
    set({ activeChat: chat || null })
  },

  fetchChats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/chats")
      if (!response.ok) throw new Error("Failed to fetch chats")

      const data = await response.json()
      const chats = data.chats || []

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
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  markAsRead: async (messageId) => {
    try {
      await fetch(`/api/chats/messages/${messageId}/read`, {
        method: "PUT",
      })

      // Update local state
      const { chats, activeChat } = get()

      const updatedChats = chats.map((chat) => ({
        ...chat,
        messages: chat.messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)),
      }))

      let updatedActiveChat = null
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
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  addMessage: (message) => {
    const { activeChat, chats } = get()

    if (activeChat && activeChat.id === message.chatRoomId) {
      // Add to active chat if it matches
      const updatedActiveChat = {
        ...activeChat,
        messages: [...activeChat.messages, message],
      }
      set({ activeChat: updatedActiveChat })
    }

    // Update the chat in the chats list
    const updatedChats = chats.map((chat) => {
      if (chat.id === message.chatRoomId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          updatedAt: new Date(),
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
