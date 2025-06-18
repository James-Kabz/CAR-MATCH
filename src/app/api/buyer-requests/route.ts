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

    const { minBudget, maxBudget, brand, model, carType } = await request.json()

    // Validate required fields
    if (minBudget === undefined || maxBudget === undefined) {
      return NextResponse.json(
        { error: "Budget range is required" },
        { status: 400 }
      )
    }

    // Convert to numbers if they're strings
    const minBudgetNum = typeof minBudget === 'string' ? parseInt(minBudget) : minBudget
    const maxBudgetNum = typeof maxBudget === 'string' ? parseInt(maxBudget) : maxBudget

    // Validate budget values
    if (isNaN(minBudgetNum) || isNaN(maxBudgetNum)) {
      return NextResponse.json(
        { error: "Invalid budget values" },
        { status: 400 }
      )
    }

    if (minBudgetNum < 0 || maxBudgetNum < 0) {
      return NextResponse.json(
        { error: "Budget values cannot be negative" },
        { status: 400 }
      )
    }

    if (minBudgetNum > maxBudgetNum) {
      return NextResponse.json(
        { error: "Minimum budget cannot be greater than maximum budget" },
        { status: 400 }
      )
    }

    const buyerRequest = await prisma.buyerRequest.create({
      data: {
        minBudget: Number.parseInt(minBudgetNum),
        maxBudget: Number.parseInt(maxBudgetNum),
        brand: brand || null, // Store as null if empty string
        model: model || null,
        carType: carType || null,
        buyerId: session.user.id ?? "",
        location: "",
      },
    })

    return NextResponse.json({ buyerRequest })
  } catch (error) {
    console.error("Error creating buyer request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requests = await prisma.buyerRequest.findMany({
      where: {
        buyerId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching buyer requests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}