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

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase()} })

        if (!user) {
            return NextResponse.json({
                message: "If an account with this email exists, we've sent a password reset link.",
            })
        }

        // password reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000)

        // update user with reset token
        await prisma.user.update({
            where: { id: user.id},
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            },
        })

        // send password reset email

        try {
            await sendPasswordResetEmail(email, resetToken)
        }catch (error) {
            return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
        }

        return NextResponse.json({ message: "If an account with this email exists, we've sent a password reset link." })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}