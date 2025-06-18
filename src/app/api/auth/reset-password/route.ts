import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
        }

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(), //token hasn't expired
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
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
    } catch (error){
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}