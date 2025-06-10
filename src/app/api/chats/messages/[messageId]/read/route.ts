import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messageId } = params
    const userId = session.user.id

    // Get the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        chatRoom: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is part of the chat room
    const isUserInChatRoom = message.chatRoom.users.some((user) => user.userId === userId)
    if (!isUserInChatRoom) {
      return NextResponse.json({ error: "Not authorized to access this message" }, { status: 403 })
    }

    // Don't mark your own messages as read
    if (message.senderId === userId) {
      return NextResponse.json({ message })
    }

    // Mark message as read
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isRead: true },
    })

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error("Error marking message as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
