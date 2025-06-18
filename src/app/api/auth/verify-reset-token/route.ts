import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 })
        }

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
            },
        })

        if (!user) {
            return NextResponse.json({ valid: false, expired: false }, { status: 200 })
        }

        const isExpired = user.passwordResetExpires && user.passwordResetExpires < new Date()

        return NextResponse.json({
            valid: !isExpired,
            expired: isExpired
        }, { status: 200 })
    } catch (error) {
        console.error('Token validation error:', error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}