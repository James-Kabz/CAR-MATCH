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
    const role = session.user.role
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let where = {}

    if (role === "BUYER") {
      where = { buyerId: userId }
    } else if (role === "SELLER") {
      where = { sellerId: userId }
    }

    if (status) {
      where = { ...where, status }
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ inquiries })
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

    if (session.user.role !== "BUYER") {
      return NextResponse.json({ error: "Only buyers can create inquiries" }, { status: 403 })
    }

    const { listingId, message } = await request.json()
    const buyerId = session.user.id

    // Get the listing to find the seller
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        message,
        buyerId,
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
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error creating inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
