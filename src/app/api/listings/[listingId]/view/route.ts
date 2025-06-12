import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) {
  try {
    const { listingId } = await params

    // Increment the view count
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating view count:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
