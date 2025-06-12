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
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    let sellerId = searchParams.get("sellerId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Filtering parameters
    const search = searchParams.get("search") || ""
    const brand = searchParams.get("brand") || ""
    const carType = searchParams.get("carType") || ""
    const condition = searchParams.get("condition") || ""
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const location = searchParams.get("location") || ""

    // Handle the special case for current user
    if (sellerId === "?current" || sellerId === "current") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      sellerId = session.user.id
    }

    // Build where clause with filters
    const where: any = sellerId ? { sellerId } : { isActive: true }

    // Case-insensitive search across title, brand, and model
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ]
    }

    // Case-insensitive brand filter
    if (brand && brand !== "all") {
      where.brand = { equals: brand, mode: "insensitive" }
    }

    // Car type filter
    if (carType && carType !== "all") {
      where.carType = carType
    }

    // Condition filter
    if (condition && condition !== "all") {
      where.condition = condition
    }

    // Price range filters
    if (minPrice) {
      where.price = { ...where.price, gte: Number.parseInt(minPrice) }
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: Number.parseInt(maxPrice) }
    }

    // Case-insensitive location filter
    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    // Get total count for pagination
    const totalCount = await prisma.listing.count({ where })

    // Get paginated listings
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
      skip,
      take: limit,
    })

    return NextResponse.json({
      listings,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
