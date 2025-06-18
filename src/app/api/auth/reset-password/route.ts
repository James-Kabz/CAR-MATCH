import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
        }

        // Add password validation
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        })

         if (!user) {
            // Check if token exists but is expired
            const expiredUser = await prisma.user.findFirst({
                where: {
                    passwordResetToken: token,
                },
            })

            if (expiredUser) {
                return NextResponse.json(
                    { error: "Reset token has expired. Please request a new password reset." },
                    { status: 400 },
                )
            }

            return NextResponse.json({ error: "Invalid reset token. Please request a new password reset." }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            },
        })

        return NextResponse.json({ message: "Password reset successfully" })
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}