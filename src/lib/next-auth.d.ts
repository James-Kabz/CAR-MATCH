import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    id?: string
  }

  interface Session {
    user?: {
      id?: string
      role?: string
      lastMessageReadAt?: Date
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
  }
}
