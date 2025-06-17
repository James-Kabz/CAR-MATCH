import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, phone, location } = await request.json()

    console.log("Registration attempt:", { name, email, role, phone, location })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)


    const emailVerificationToken = crypto.randomBytes(32).toString("hex")

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
        location,
        emailVerificationToken
      },
    })

    try {
      await sendVerificationEmail(email, emailVerificationToken)
    } catch (emailError){
      console.error("Error sending verification email:", emailError)
    }
    // console.log("User created successfully:", user.id)

    return NextResponse.json({
      message: "User created successfully. Please check your email to verify your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
