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

    const userId = session.user.id

    // Get all chat rooms for the user with latest messages
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
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
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ chats: chatRooms })
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { otherUserId } = await request.json()
    const currentUserId = session.user.id

    // Check if chat room already exists between these users
    const existingChatRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                userId: currentUserId,
              },
            },
          },
          {
            users: {
              some: {
                userId: otherUserId,
              },
            },
          },
        ],
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    })

    if (existingChatRoom) {
      return NextResponse.json({ chatRoom: existingChatRoom })
    }

    // Create new chat room
    const newChatRoom = await prisma.chatRoom.create({
      data: {
        users: {
          create: [{ userId: currentUserId }, { userId: otherUserId }],
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ chatRoom: newChatRoom })
  } catch (error) {
    console.error("Error creating chat room:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
