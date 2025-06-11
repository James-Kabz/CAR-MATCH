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

    const { minBudget, maxBudget, brand, model, carType, location } = await request.json()

    const buyerRequest = await prisma.buyerRequest.create({
      data: {
        minBudget: Number.parseInt(minBudget),
        maxBudget: Number.parseInt(maxBudget),
        brand,
        model,
        carType,
        location,
        buyerId: session.user.id ?? "",
      },
    })

    return NextResponse.json({ buyerRequest })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
