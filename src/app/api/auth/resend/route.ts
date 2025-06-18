import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"
import { resendVerificationEmail } from "@/lib/email";

export async function POST( request: NextRequest ) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const  user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
        }

        const newToken = crypto.randomBytes(32).toString("hex")
        const expires  = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                emailVerificationToken: newToken,
                emailVerificationTokenExpires: expires
            }
        })

        await resendVerificationEmail(email, newToken)

        return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}