import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: { favoriteId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { favoriteId } = params
    const userId = session.user.id

    // Check if favorite exists and belongs to user
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
    })

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 })
    }

    if (favorite.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to remove this favorite" }, { status: 403 })
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: { id: favoriteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
