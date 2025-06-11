import type { Server as NetServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...")

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: process.env.NODE_ENV === "production" ? process.env.NEXTAUTH_URL || false : ["https://car-match-7pgs.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      allowEIO3: true,
      transports: ["websocket", "polling"],
    })

    res.socket.server.io = io

    io.on("connection", (socket) => {
      // console.log("Socket connected:", socket.id)

      // Handle joining chat rooms
      socket.on("join-chat", (chatRoomId: string) => {
        socket.join(`chat:${chatRoomId}`)
      })

      // Handle leaving chat rooms
      socket.on("leave-chat", (chatRoomId: string) => {
        socket.leave(`chat:${chatRoomId}`)
      })

      // Handle new messages
      socket.on("send-message", (data) => {
        // Broadcast to all users in the chat room
        io.to(`chat:${data.chatRoomId}`).emit("new-message", data)
      })

      // Handle typing indicators
      socket.on("typing", (data) => {
        // Send typing indicator to other users in the room (not the sender)
        socket.to(`chat:${data.chatRoomId}`).emit("user-typing", {
          userId: data.userId,
          isTyping: data.isTyping,
        })
      })

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", socket.id, "Reason:", reason)
      })

      // Handle errors
      socket.on("error", (error) => {
        console.error("Socket error:", error)
      })
    })

    console.log("Socket.io server initialized successfully")
  } else {
    console.log("Socket.io server already running")
  }

  return res.socket.server.io
}
