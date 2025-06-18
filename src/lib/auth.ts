import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthErrorCodes } from "./auth-errors"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(AuthErrorCodes.INVALID_CREDENTIALS)
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          // include: {
          //   role: true,
          // },
        })

        if (!user) {
          throw new Error(AuthErrorCodes.INVALID_CREDENTIALS)
        }

        if (!user.emailVerified)
        {
          throw new Error(AuthErrorCodes.EMAIL_NOT_VERIFIED)
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "")

        if (!isPasswordValid) {
          throw new Error(AuthErrorCodes.INVALID_CREDENTIALS)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
