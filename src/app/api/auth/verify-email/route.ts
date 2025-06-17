import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest)
{
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
        }

        // find user with this verification token
        const user = await prisma.user.findUnique({
            where: {
                emailVerificationToken: token
            }
        }) 

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
        }

        // update user's emailVerified field to true
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                emailVerified: new Date(),
                emailVerificationToken: null
            }
        })

        return NextResponse.json({ message: "Email verified successfully" })
    } catch (error)
    {
        console.error("Error verifying email",error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}