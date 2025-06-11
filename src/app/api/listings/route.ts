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

    const { title, brand, model, year, price, condition, carType, mileage, description, location, images } =
      await request.json()

    const listing = await prisma.listing.create({
      data: {
        title,
        brand,
        model,
        year: Number.parseInt(year),
        price: Number.parseInt(price),
        condition,
        carType,
        mileage: mileage ? Number.parseInt(mileage) : null,
        description,
        location,
        images: images || [],
        sellerId: session.user.id ?? "",
      },
    })

    return NextResponse.json({ listing })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    const where = sellerId ? { sellerId } : { isActive: true }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
