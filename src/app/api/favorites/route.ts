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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const userId = session.user.id

    // Get total count for pagination
    const totalCount = await prisma.favorite.count({ where: { userId } })

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      favorites,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listingId } = await request.json()
    const userId = session.user?.id ?? '';

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json({ error: "Listing already favorited" }, { status: 400 })
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        listingId,
      },
      include: {
        listing: true,
      },
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
