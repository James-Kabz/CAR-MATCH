import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest ,{ params }: { params: Promise<{ listingId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listingId } = await params
    const { title, brand, model, year, price, condition, carType, mileage, description, location, isActive, images } =
      await request.json()

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to edit this listing" }, { status: 403 })
    }

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        brand,
        model,
        year,
        price,
        condition,
        carType,
        mileage,
        description,
        location,
        isActive,
        images: images || [],
      },
    })

    return NextResponse.json({ listing: updatedListing })
  } catch (error) {
    console.error("Error updating listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest ) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pathname } = new URL(request.url);
    const listingId = pathname.split("/").pop();

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this listing" }, { status: 403 })
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id: listingId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
