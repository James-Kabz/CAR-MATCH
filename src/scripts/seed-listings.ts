import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Enhanced car data based on Kai & Karo inventory and Kenyan market
const KENYA_CAR_BRANDS = [
  {
    name: "Toyota",
    models: [
      "Mark X", "Harrier", "Land Cruiser", "Prado", "RAV4", "Camry", "Corolla",
      "Vitz", "Allion", "Premio", "Fielder", "Vanguard", "Rush", "Wish",
      "Probox", "Succeed", "Hiace", "Hilux", "Fortuner", "C-HR"
    ]
  },
  {
    name: "Mazda",
    models: [
      "CX-5", "Atenza", "Axela", "Demio", "CX-3", "CX-7", "Biante",
      "Premacy", "Tribute", "Verisa", "Carol", "AZ-Wagon", "Bongo"
    ]
  },
  {
    name: "Nissan",
    models: [
      "X-Trail", "Juke", "Note", "March", "Tiida", "Sylphy", "Teana",
      "Fuga", "Murano", "Pathfinder", "Patrol", "Navara", "NV200",
      "Wingroad", "AD Van", "Bluebird", "Sunny"
    ]
  },
  {
    name: "Subaru",
    models: [
      "Forester", "Legacy", "Outback", "Impreza", "XV", "Exiga",
      "Tribeca", "Levorg", "WRX", "BRZ"
    ]
  },
  {
    name: "Honda",
    models: [
      "Fit", "Vezel", "CR-V", "HR-V", "Civic", "Accord", "Insight",
      "Freed", "Stream", "Step WGN", "Pilot", "Ridgeline"
    ]
  },
  {
    name: "BMW",
    models: [
      "X5", "X3", "X1", "X6", "3 Series", "5 Series", "7 Series",
      "1 Series", "2 Series", "4 Series", "6 Series", "i3", "i8"
    ]
  },
  {
    name: "Mercedes-Benz",
    models: [
      "C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class",
      "B-Class", "CLA", "GLA", "G-Class", "ML-Class", "GLK"
    ]
  },
  {
    name: "Audi",
    models: [
      "Q5", "Q7", "Q3", "A4", "A6", "A3", "A8", "Q8", "A5", "A7",
      "TT", "R8", "e-tron"
    ]
  },
  {
    name: "Lexus",
    models: [
      "LX570", "RX", "NX", "LX", "IS", "ES", "GS", "LS", "UX",
      "GX", "CT", "RC", "LC"
    ]
  },
  {
    name: "Volkswagen",
    models: [
      "Golf", "Passat", "Tiguan", "Touareg", "Polo", "Jetta",
      "Beetle", "Touran", "Sharan", "Caddy"
    ]
  },
  {
    name: "Mitsubishi",
    models: [
      "Pajero", "Outlander", "ASX", "Lancer", "Galant", "Colt",
      "L200", "Delica", "Grandis", "Eclipse"
    ]
  },
  {
    name: "Land Rover",
    models: [
      "Range Rover", "Range Rover Sport", "Discovery", "Defender",
      "Freelander", "Evoque", "Velar"
    ]
  },
  {
    name: "Porsche",
    models: [
      "Cayenne", "Macan", "Panamera", "911", "Boxster", "Cayman"
    ]
  },
  {
    name: "Hyundai",
    models: [
      "Tucson", "Santa Fe", "Elantra", "Sonata", "i10", "i20",
      "i30", "ix35", "Creta", "Venue"
    ]
  },
  {
    name: "Kia",
    models: [
      "Sportage", "Sorento", "Cerato", "Rio", "Picanto", "Soul",
      "Optima", "Carnival", "Stinger"
    ]
  },
  {
    name: "Peugeot",
    models: [
      "2008", "3008", "5008", "208", "308", "408", "508", "Partner"
    ]
  }
]

enum Condition {
  NEW = "NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

enum CarType {
  SEDAN = "SEDAN",
  SUV = "SUV",
  HATCHBACK = "HATCHBACK",
  COUPE = "COUPE",
  CONVERTIBLE = "CONVERTIBLE",
  TRUCK = "TRUCK",
  VAN = "VAN",
  WAGON = "WAGON",
}

const CONDITIONS = Object.values(Condition)
const CAR_TYPES = Object.values(CarType)

// Kenyan cities and locations (expanded)
const KENYA_LOCATIONS = [
  "Nairobi, Kenya",
  "Westlands, Nairobi",
  "Parklands, Nairobi", 
  "Kilimani, Nairobi",
  "Karen, Nairobi",
  "Lavington, Nairobi",
  "Mombasa, Kenya",
]

// Exchange rate: 1 USD = 130 KES (current market rate)
const USD_TO_KES_RATE = 130

async function seedKenyaCarListings(count: number) {
  console.log(`🚗 Starting to seed ${count} Kenya market car listings...`)

  // Get all seller users
  const sellers = await prisma.user.findMany({
    where: {
      role: "SELLER",
    },
  })

  if (sellers.length === 0) {
    console.error("❌ No sellers found in the database. Please create at least one seller user first.")
    return
  }

  console.log(`👤 Found ${sellers.length} sellers in the database.`)

  const listings = []

  for (let i = 0; i < count; i++) {
    // Pick a random brand and model
    const brandData = faker.helpers.arrayElement(KENYA_CAR_BRANDS)
    const brand = brandData.name
    const model = faker.helpers.arrayElement(brandData.models)

    // Generate realistic year based on Kenya import patterns
    const currentYear = new Date().getFullYear()
    const yearDistribution = [
      ...Array(2).fill(currentYear), // Brand new (rare)
      ...Array(3).fill(currentYear - 1), // 1 year old
      ...Array(5).fill(currentYear - 2), // 2 years old
      ...Array(8).fill(currentYear - 3), // 3 years old
      ...Array(10).fill(currentYear - 4), // 4 years old (common)
      ...Array(12).fill(currentYear - 5), // 5 years old (very common)
      ...Array(10).fill(currentYear - 6), // 6 years old
      ...Array(8).fill(currentYear - 7), // 7 years old
      ...Array(6).fill(currentYear - 8), // 8 years old
      ...Array(4).fill(currentYear - 9), // 9 years old
      ...Array(3).fill(currentYear - 10), // 10 years old
      ...Array(2).fill(currentYear - 12), // 12 years old
      ...Array(1).fill(currentYear - 15), // 15 years old
    ]
    const year = faker.helpers.arrayElement(yearDistribution)

    // Generate price based on Kenya market conditions
    const basePrice = getKenyaBasePrice(brand, model)
    const condition = faker.helpers.arrayElement(CONDITIONS)
    const conditionMultiplier = getConditionMultiplier(condition)
    const ageDepreciation = Math.max(0.3, 1 - (currentYear - year) * 0.07) // Kenya market depreciation
    
    // Convert to KES and round to nearest 50,000 KES for realistic pricing
    const priceInUSD = basePrice * conditionMultiplier * ageDepreciation
    const priceInKES = Math.round((priceInUSD * USD_TO_KES_RATE) / 50000) * 50000

    // Generate mileage based on age and Kenya driving conditions
    const averageMileagePerYear = 15000 // Higher due to Kenya road conditions
    const mileageVariance = faker.number.int({ min: -5000, max: 8000 })
    const ageMileage = Math.max(0, (currentYear - year) * averageMileagePerYear)
    const conditionMileageAdjustment = getConditionMileageAdjustment(condition)
    const mileage = Math.max(0, ageMileage + mileageVariance + conditionMileageAdjustment)

    // Get car type for the model
    const carType = getCarTypeForModel(model) || faker.helpers.arrayElement(CAR_TYPES)

    // Generate Kenya-specific title
    const titlePrefixes = [
      "Immaculate", "Well-maintained", "Low mileage", "Excellent", "Clean",
      "Fresh import", "Local used", "Recently imported", "Pristine", "Quality"
    ]
    
    const titleSufffix = [
      "- Quick Sale", "- Best Price", "- Genuine Mileage", "- Must See",
      "- Call Now", "- Serious Buyers", "- Cash or Hire Purchase",
      "- Bank Finance Available", "- Trade-in Welcome"
    ]

    const titlePrefix = faker.helpers.maybe(() => faker.helpers.arrayElement(titlePrefixes), { probability: 0.4 })
    const titleSuffix = faker.helpers.maybe(() => faker.helpers.arrayElement(titleSufffix), { probability: 0.5 })

    const title = [titlePrefix, `${year} ${brand} ${model}`, titleSuffix].filter(Boolean).join(" ")

    // Generate Kenya-specific description
    const kenyaFeatures = [
      faker.helpers.maybe(() => "Leather seats", { probability: 0.4 }),
      faker.helpers.maybe(() => "Sunroof/Moonroof", { probability: 0.3 }),
      faker.helpers.maybe(() => "Navigation system", { probability: 0.35 }),
      faker.helpers.maybe(() => "Reverse camera", { probability: 0.6 }),
      faker.helpers.maybe(() => "Bluetooth & USB", { probability: 0.7 }),
      faker.helpers.maybe(() => "Power windows", { probability: 0.8 }),
      faker.helpers.maybe(() => "Central locking", { probability: 0.75 }),
      faker.helpers.maybe(() => "Air conditioning", { probability: 0.9 }),
      faker.helpers.maybe(() => "Alloy wheels", { probability: 0.5 }),
      faker.helpers.maybe(() => "Electric seats", { probability: 0.3 }),
      faker.helpers.maybe(() => "Third row seating", { probability: carType === CarType.SUV ? 0.4 : 0 }),
      faker.helpers.maybe(() => "4WD/AWD", { probability: ["SUV", "TRUCK"].includes(carType) ? 0.6 : 0.1 }),
      faker.helpers.maybe(() => "Premium sound system", { probability: 0.25 }),
      faker.helpers.maybe(() => "Keyless entry/start", { probability: 0.4 }),
    ].filter(Boolean)

    const kenyaConditionNotes = [
      faker.helpers.maybe(() => "Fresh import from Japan", { probability: 0.3 }),
      faker.helpers.maybe(() => "Local used, well maintained", { probability: 0.2 }),
      faker.helpers.maybe(() => "Service records available", { probability: 0.4 }),
      faker.helpers.maybe(() => "Recently serviced", { probability: 0.6 }),
      faker.helpers.maybe(() => "New tyres fitted", { probability: 0.3 }),
      faker.helpers.maybe(() => "Battery recently replaced", { probability: 0.2 }),
      faker.helpers.maybe(() => "Accident-free", { probability: 0.7 }),
      faker.helpers.maybe(() => "Single owner", { probability: 0.3 }),
    ].filter(Boolean)

    const paymentOptions = faker.helpers.maybe(
      () => faker.helpers.arrayElement([
        "Cash sale preferred",
        "Bank finance can be arranged", 
        "Hire purchase available",
        "Trade-in accepted",
        "Flexible payment terms",
        "Quick sale needed"
      ]),
      { probability: 0.6 }
    )

    const contactInfo = faker.helpers.maybe(
      () => faker.helpers.arrayElement([
        "Call for viewing appointment",
        "WhatsApp for quick response",
        "Serious buyers only",
        "Available for test drive",
        "Viewing by appointment",
        "More photos available on request"
      ]),
      { probability: 0.8 }
    )

    const description = [
      `${year} ${brand} ${model} in ${condition.toLowerCase()} condition with ${mileage.toLocaleString()} km.`,
      kenyaFeatures.length > 0 ? `Features: ${kenyaFeatures.join(", ")}.` : "",
      kenyaConditionNotes.length > 0 ? kenyaConditionNotes.join(". ") + "." : "",
      paymentOptions,
      contactInfo,
      `Price: KES ${priceInKES.toLocaleString()}`
    ].filter(Boolean).join("\n\n")

    // Pick a random seller
    const seller = faker.helpers.arrayElement(sellers)

    // Create listing object
    listings.push({
      title,
      brand,
      model,
      year,
      price: priceInKES,
      condition,
      carType,
      mileage,
      description,
      location: faker.helpers.arrayElement(KENYA_LOCATIONS),
      images: [], // Empty array as per your schema
      isActive: true,
      sellerId: seller.id,
      views: faker.number.int({ min: 0, max: 150 }), // Random view count
    })

    if ((i + 1) % 10 === 0) {
      console.log(`📝 Generated ${i + 1} listings... (Latest: ${brand} ${model} - KES ${priceInKES.toLocaleString()})`)
    }
  }

  // Insert listings in batches
  const BATCH_SIZE = 25
  for (let i = 0; i < listings.length; i += BATCH_SIZE) {
    const batch = listings.slice(i, i + BATCH_SIZE)
    await prisma.listing.createMany({
      data: batch,
    })
    console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(listings.length / BATCH_SIZE)}`)
  }

  console.log(`🎉 Successfully seeded ${count} Kenya car market listings!`)
  
  // Show pricing summary
  const prices = listings.map(l => l.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  
  console.log(`💰 Price range: KES ${minPrice.toLocaleString()} - KES ${maxPrice.toLocaleString()}`)
  console.log(`📊 Average price: KES ${avgPrice.toLocaleString()}`)
  
  // Show brand distribution
  const brandCounts = listings.reduce((acc, listing) => {
    acc[listing.brand] = (acc[listing.brand] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log("🏷️  Brand distribution:")
  Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([brand, count]) => {
      console.log(`   ${brand}: ${count} listings`)
    })
}

// Helper functions for Kenya market pricing
function getKenyaBasePrice(brand: string, model: string): number {
  // Luxury brands
  const luxuryBrands = ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Land Rover"]
  const premiumModels = ["Land Cruiser", "Prado", "Harrier", "X-Trail", "Forester", "Legacy", "Pajero"]
  
  // Base prices in USD (Kenya market oriented)
  if (luxuryBrands.includes(brand)) {
    if (brand === "Porsche") return faker.number.int({ min: 60000, max: 150000 })
    if (brand === "Land Rover") return faker.number.int({ min: 45000, max: 120000 })
    return faker.number.int({ min: 35000, max: 85000 })
  }
  
  if (premiumModels.includes(model)) {
    return faker.number.int({ min: 25000, max: 55000 })
  }
  
  // Popular Japanese brands
  const popularBrands = ["Toyota", "Nissan", "Honda", "Mazda", "Subaru"]
  if (popularBrands.includes(brand)) {
    return faker.number.int({ min: 15000, max: 40000 })
  }
  
  // Korean brands
  const koreanBrands = ["Hyundai", "Kia"]
  if (koreanBrands.includes(brand)) {
    return faker.number.int({ min: 12000, max: 35000 })
  }
  
  // European brands
  const europeanBrands = ["Volkswagen", "Peugeot"]
  if (europeanBrands.includes(brand)) {
    return faker.number.int({ min: 18000, max: 42000 })
  }
  
  // Default
  return faker.number.int({ min: 15000, max: 35000 })
}

function getConditionMultiplier(condition: Condition): number {
  switch (condition) {
    case Condition.NEW: return 1.0
    case Condition.EXCELLENT: return 0.92
    case Condition.GOOD: return 0.82
    case Condition.FAIR: return 0.68
    case Condition.POOR: return 0.52
    default: return 0.75
  }
}

function getConditionMileageAdjustment(condition: Condition): number {
  switch (condition) {
    case Condition.NEW: return -12000
    case Condition.EXCELLENT: return -6000
    case Condition.GOOD: return 0
    case Condition.FAIR: return 12000
    case Condition.POOR: return 30000
    default: return 0
  }
}

function getCarTypeForModel(model: string): CarType | null {
  const modelTypeMap: Record<string, CarType> = {
    // SUVs
    "X-Trail": CarType.SUV, "Harrier": CarType.SUV, "RAV4": CarType.SUV, "CR-V": CarType.SUV,
    "CX-5": CarType.SUV, "CX-7": CarType.SUV, "Forester": CarType.SUV, "Outback": CarType.SUV,
    "X5": CarType.SUV, "X3": CarType.SUV, "X1": CarType.SUV, "X6": CarType.SUV,
    "GLC": CarType.SUV, "GLE": CarType.SUV, "GLS": CarType.SUV, "GLA": CarType.SUV,
    "Q5": CarType.SUV, "Q7": CarType.SUV, "Q3": CarType.SUV, "Q8": CarType.SUV,
    "RX": CarType.SUV, "NX": CarType.SUV, "LX": CarType.SUV, "LX570": CarType.SUV, "GX": CarType.SUV, "UX": CarType.SUV,
    "Tiguan": CarType.SUV, "Touareg": CarType.SUV, "Pajero": CarType.SUV, "Outlander": CarType.SUV, "ASX": CarType.SUV,
    "Range Rover": CarType.SUV, "Discovery": CarType.SUV, "Freelander": CarType.SUV, "Evoque": CarType.SUV,
    "Cayenne": CarType.SUV, "Macan": CarType.SUV, "Tucson": CarType.SUV, "Santa Fe": CarType.SUV,
    "Sportage": CarType.SUV, "Sorento": CarType.SUV, "3008": CarType.SUV, "5008": CarType.SUV, "2008": CarType.SUV,
    "Land Cruiser": CarType.SUV, "Prado": CarType.SUV, "Fortuner": CarType.SUV, "Rush": CarType.SUV,
    "Vanguard": CarType.SUV, "C-HR": CarType.SUV, "Vezel": CarType.SUV, "HR-V": CarType.SUV,
    "Juke": CarType.SUV, "Murano": CarType.SUV, "Pathfinder": CarType.SUV, "Patrol": CarType.SUV,
    "XV": CarType.SUV, "Tribeca": CarType.SUV,

    // Sedans  
    "Mark X": CarType.SEDAN, "Allion": CarType.SEDAN, "Premio": CarType.SEDAN, "Camry": CarType.SEDAN,
    "Atenza": CarType.SEDAN, "Axela": CarType.SEDAN, "Sylphy": CarType.SEDAN, "Teana": CarType.SEDAN,
    "Fuga": CarType.SEDAN, "Bluebird": CarType.SEDAN, "Sunny": CarType.SEDAN,
    "Legacy": CarType.SEDAN, "Impreza": CarType.SEDAN, "WRX": CarType.SEDAN,
    "Civic": CarType.SEDAN, "Accord": CarType.SEDAN, "Insight": CarType.SEDAN,
    "3 Series": CarType.SEDAN, "5 Series": CarType.SEDAN, "7 Series": CarType.SEDAN,
    "C-Class": CarType.SEDAN, "E-Class": CarType.SEDAN, "S-Class": CarType.SEDAN,
    "A4": CarType.SEDAN, "A6": CarType.SEDAN, "A8": CarType.SEDAN,
    "IS": CarType.SEDAN, "ES": CarType.SEDAN, "GS": CarType.SEDAN, "LS": CarType.SEDAN,
    "Passat": CarType.SEDAN, "Jetta": CarType.SEDAN, "Lancer": CarType.SEDAN, "Galant": CarType.SEDAN,
    "Elantra": CarType.SEDAN, "Sonata": CarType.SEDAN, "Cerato": CarType.SEDAN, "Optima": CarType.SEDAN,

    // Hatchbacks
    "Vitz": CarType.HATCHBACK, "Corolla": CarType.HATCHBACK, "Fit": CarType.HATCHBACK,
    "Demio": CarType.HATCHBACK, "Note": CarType.HATCHBACK, "March": CarType.HATCHBACK, "Tiida": CarType.HATCHBACK,
    "1 Series": CarType.HATCHBACK, "A-Class": CarType.HATCHBACK, "A3": CarType.HATCHBACK,
    "Golf": CarType.HATCHBACK, "Polo": CarType.HATCHBACK, "i10": CarType.HATCHBACK, "i20": CarType.HATCHBACK, "i30": CarType.HATCHBACK,
    "Rio": CarType.HATCHBACK, "Picanto": CarType.HATCHBACK, "Soul": CarType.HATCHBACK,
    "208": CarType.HATCHBACK, "308": CarType.HATCHBACK, "Carol": CarType.HATCHBACK, "Verisa": CarType.HATCHBACK,
    "Colt": CarType.HATCHBACK,

    // Wagons/Estates
    "Fielder": CarType.WAGON, "Wingroad": CarType.WAGON, "AD Van": CarType.WAGON,
    "Levorg": CarType.WAGON, "Stream": CarType.WAGON,

    // Vans
    "Hiace": CarType.VAN, "Probox": CarType.VAN, "Succeed": CarType.VAN, "NV200": CarType.VAN,
    "Freed": CarType.VAN, "Step WGN": CarType.VAN, "Biante": CarType.VAN, "Premacy": CarType.VAN,
    "Delica": CarType.VAN, "Grandis": CarType.VAN, "Wish": CarType.VAN, "Exiga": CarType.VAN,
    "Partner": CarType.VAN, "Caddy": CarType.VAN, "Touran": CarType.VAN, "Sharan": CarType.VAN,
    "Carnival": CarType.VAN, "Bongo": CarType.VAN,

    // Trucks
    "Hilux": CarType.TRUCK, "Navara": CarType.TRUCK, "L200": CarType.TRUCK, "Ridgeline": CarType.TRUCK,

    // Coupes/Sports
    "BRZ": CarType.COUPE, "911": CarType.COUPE, "Panamera": CarType.COUPE,
    "2 Series": CarType.COUPE, "4 Series": CarType.COUPE, "6 Series": CarType.COUPE,
    "CLA": CarType.COUPE, "A5": CarType.COUPE, "A7": CarType.COUPE, "TT": CarType.COUPE, "R8": CarType.COUPE,
    "RC": CarType.COUPE, "LC": CarType.COUPE, "Eclipse": CarType.COUPE, "Stinger": CarType.COUPE,

    // Convertibles
    "Boxster": CarType.CONVERTIBLE, "Cayman": CarType.CONVERTIBLE, "Beetle": CarType.CONVERTIBLE,
  }

  return modelTypeMap[model] || null
}

// Run the seed function
const COUNT = 150 // Number of listings to create

seedKenyaCarListings(COUNT)
  .catch((e) => {
    console.error("❌ Error seeding Kenya car listings:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })