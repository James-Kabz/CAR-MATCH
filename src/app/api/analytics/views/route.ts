import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        views: true,
      },
      orderBy: {
        views: 'desc',
      },
      take: 10, // Get top 10 most viewed listings
    })

    return NextResponse.json(listings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch views data" },
      { status: 500 }
    )
  }
}