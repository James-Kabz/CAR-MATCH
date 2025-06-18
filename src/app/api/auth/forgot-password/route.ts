import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST( request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return NextResponse.json({
                message: "If an account with this email exists, we've sent a password reset link.",
            })
        }

        // password reset token
        const passwordResetToken = crypto.randomBytes(32).toString('hex')
        const passwordResetExpires = new Date(Date.now() + 3600) // 1 hour from now

        // update user with reset token
        await prisma.user.update({
            where: { id: user.id},
            data: {
                passwordResetToken,
                passwordResetExpires
            },
        })

        // send password reset email

        try {
            await sendPasswordResetEmail(email, passwordResetToken)
        }catch (error) {
            return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
        }

        return NextResponse.json({ message: "If an account with this email exists, we've sent a password reset link." })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}