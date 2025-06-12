import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ inquiryId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { response } = await request.json()
    const userId = session.user.id
    const { inquiryId } = await params

    // Get the inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        listing: true,
        buyer: true,
        seller: true,
      }
    })

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    // Check if user is the seller
    if (inquiry.sellerId !== userId) {
      return NextResponse.json({ error: "Not authorized to respond to this inquiry" }, { status: 403 })
    }

    // Create a chat room if it doesn't exist
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                userId: inquiry.buyerId,
              },
            },
          },
          {
            users: {
              some: {
                userId: inquiry.sellerId,
              },
            },
          },
        ],
      },
    })

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          users: {
            create: [{ userId: inquiry.buyerId }, { userId: inquiry.sellerId }],
          },
        },
      })
    }

    // Send the response as a message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        content: response,
        senderId: userId,
        chatRoomId: chatRoom.id,
        listingId: inquiry.listingId
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

    // Update inquiry status
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: "RESPONDED" },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: true,
      },
    })

    return NextResponse.json({
      inquiry: updatedInquiry,
      chatRoomId: chatRoom.id,
      message: chatMessage,
    })
  } catch (error) {
    console.error("Error responding to inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}