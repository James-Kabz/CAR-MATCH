import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ inquiryId: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inquiryId } = await params

    console.log("Fetching inquiry:", inquiryId)

    // Get the inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
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
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!inquiry) {
      console.error("Inquiry not found:", inquiryId)
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    console.log("Found inquiry:", inquiry.id, "for listing:", inquiry.listing.title)

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error("Error fetching inquiry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
