import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatRoomId = searchParams.get("chatRoomId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    let where: any = {}

    if (chatRoomId) {
      // Find inquiries related to a specific chat room
      // This is a complex query, so we'll find users in the chat room first
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: { users: true },
      })

      if (!chatRoom) {
        return NextResponse.json({ inquiries: [], pagination: { total: 0, page, limit, totalPages: 0 } })
      }

      const userIds = chatRoom.users.map((u) => u.userId)
      where = {
        OR: [
          { buyerId: { in: userIds }, sellerId: { in: userIds } },
          { sellerId: { in: userIds }, buyerId: { in: userIds } },
        ],
      }
    } else {
      // Get inquiries for the current user (as seller)
      where = { sellerId: session.user.id }
    }

    const totalCount = await prisma.inquiry.count({ where })

    const inquiries = await prisma.inquiry.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      inquiries,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching inquiries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sellerId, listingId, message } = await request.json()
    const buyerId = session.user.id

    // Get the listing to include in the inquiry
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.sellerId !== sellerId) {
      return NextResponse.json({ error: "Invalid seller for this listing" }, { status: 400 })
    }

    // Create the inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        message,
        buyerId: buyerId!,
        sellerId: listing.sellerId,
        listingId,
      },
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

    // Create or find existing chat room
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                userId: buyerId,
              },
            },
          },
          {
            users: {
              some: {
                userId: sellerId,
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
            create: [{ userId: buyerId }, { userId: sellerId }],
          },
        },
      })
    }

    // Create initial chat message with the listing attached
    await prisma.chatMessage.create({
      data: {
        content: message,
        senderId: buyerId!,
        chatRoomId: chatRoom.id,
        listingId: listingId, // Automatically attach the car listing to the inquiry message
      },
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error creating inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
