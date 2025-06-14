import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatRoomId, content, listingId } = await request.json();
    const senderId = session.user?.id ?? '';

    // Verify user is part of the chat room
    const chatRoomUser = await prisma.chatRoomUser.findUnique({
      where: {
        userId_chatRoomId: {
          userId: senderId,
          chatRoomId,
        },
      },
    })

    if (!chatRoomUser) {
      return NextResponse.json({ error: "Not a member of this chat room" }, { status: 403 })
    }

    // Create message with optional listing reference
    const message = await prisma.chatMessage.create({
      data: {
        content,
        senderId,
        chatRoomId,
        listingId: listingId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            price: true,
            location: true,
            images: true,
            condition: true,
            carType: true,
          },
        },
      },
    })

    // Update chat room's updatedAt
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
