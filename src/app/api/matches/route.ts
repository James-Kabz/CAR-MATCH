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

    const { requestId } = await request.json()

    // Get buyer request
    const buyerRequest = await prisma.buyerRequest.findUnique({
      where: { id: requestId },
      include: { buyer: true },
    })

    if (!buyerRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Find matching listings
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        price: {
          gte: buyerRequest.minBudget,
          lte: buyerRequest.maxBudget,
        },
        ...(buyerRequest.brand && { brand: buyerRequest.brand }),
        ...(buyerRequest.model && { model: buyerRequest.model }),
        ...(buyerRequest.carType && { carType: buyerRequest.carType }),
        location: {
          contains: buyerRequest.location,
          mode: "insensitive",
        },
      },
      include: {
        seller: true,
      },
    })

    // Calculate match scores and create matches
    const matches = []

    for (const listing of listings) {
      let score = 0.5 // Base score

      // Price match scoring
      const priceRange = buyerRequest.maxBudget - buyerRequest.minBudget
      const priceDiff = Math.abs(listing.price - (buyerRequest.minBudget + buyerRequest.maxBudget) / 2)
      const priceScore = Math.max(0, 1 - priceDiff / priceRange)
      score += priceScore * 0.3

      // Brand/model exact match
      if (buyerRequest.brand && listing.brand.toLowerCase() === buyerRequest.brand.toLowerCase()) {
        score += 0.2
      }
      if (buyerRequest.model && listing.model.toLowerCase() === buyerRequest.model.toLowerCase()) {
        score += 0.2
      }

      // Car type match
      if (buyerRequest.carType && listing.carType === buyerRequest.carType) {
        score += 0.15
      }

      // Location proximity (simplified)
      if (listing.location.toLowerCase().includes(buyerRequest.location.toLowerCase())) {
        score += 0.15
      }

      // Create or update match
      const existingMatch = await prisma.match.findUnique({
        where: {
          buyerId_listingId_requestId: {
            buyerId: buyerRequest.buyerId,
            listingId: listing.id,
            requestId: requestId,
          },
        },
      })

      if (!existingMatch) {
        const match = await prisma.match.create({
          data: {
            buyerId: buyerRequest.buyerId,
            listingId: listing.id,
            requestId: requestId,
            score: Math.min(score, 1),
          },
          include: {
            listing: {
              include: {
                seller: true,
              },
            },
          },
        })
        matches.push(match)
      }
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("Matching error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || session.user.id

    const matches = await prisma.match.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        listing: {
          include: {
            seller: true,
          },
        },
        request: true,
      },
      orderBy: {
        score: "desc",
      },
    })

    return NextResponse.json({ matches })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
