"use client"

import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { useChatStore } from "@/store/chat-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { InlineLoading } from "@/app/loading"

export function ChatSidebar() {
  const { data: session } = useSession()
  const { chats, activeChat, setActiveChat, isLoading } = useChatStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-lg p-4">
        <InlineLoading
          message="Loading chats..."
          size="md"
          className="text-blue-600"
        />
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-600 text-center">
          When you contact sellers or receive inquiries, your conversations will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-medium">Messages</h3>
      </div>
      <div className="overflow-y-auto h-[calc(600px-57px)]">
        {chats.map((chat) => {
          const otherUser = chat.users.find((u) => u.user.id !== session?.user?.id)?.user

          const lastMessage = chat.messages[chat.messages.length - 1]

          const unreadCount = chat.messages.filter((msg) => !msg.isRead && msg.sender.id !== session?.user?.id).length

          return (
            <div
              key={chat.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${activeChat?.id === chat.id ? "bg-blue-50" : ""
                }`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={otherUser?.image || ""} alt={otherUser?.name || ""} />
                  <AvatarFallback>{otherUser?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium truncate">{otherUser?.name}</h4>
                    {lastMessage && (
                      <span className="text-xs text-gray-500">{format(new Date(lastMessage.createdAt), "MMM d")}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate">
                      {lastMessage
                        ? `${lastMessage.sender.id === session?.user?.id ? "You: " : ""}${lastMessage.content}`
                        : "No messages yet"}
                    </p>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
