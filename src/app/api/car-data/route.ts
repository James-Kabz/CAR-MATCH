import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Fetch all distinct brands
    const brands = await prisma.listing.findMany({
      distinct: ['brand'],
      select: { brand: true },
      where: { brand: { not: { equals: "" } } },
      orderBy: { brand: 'asc' }
    })

    // Fetch all distinct models grouped by brand
    const modelsByBrand: Record<string, string[]> = {}
    const brandsWithModels = await prisma.listing.groupBy({
      by: ['brand', 'model'],
      where: { 
        AND: [
          { brand: { not: { equals: "" } } },
          { model: { not: { equals: "" } } }
        ]
      },
      orderBy: { brand: 'asc' }
    })

    brandsWithModels.forEach(item => {
      if (item.brand && item.model) {
        if (!modelsByBrand[item.brand]) {
          modelsByBrand[item.brand] = []
        }
        modelsByBrand[item.brand].push(item.model)
      }
    })

    // Remove duplicates and sort
    Object.keys(modelsByBrand).forEach(brand => {
      modelsByBrand[brand] = [...new Set(modelsByBrand[brand])].sort()
    })

    // Car types (could also be fetched from DB if they're dynamic)
    const carTypes = ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'CONVERTIBLE', 'TRUCK', 'VAN', 'WAGON']

    return NextResponse.json({
        brands: brands ? brands.map(b => b.brand).filter((b): b is string => !!b) : [],
        modelsByBrand,
        carTypes
    })
  } catch (error) {
    console.error("Error fetching car data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}