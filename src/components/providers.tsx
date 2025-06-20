"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"

const queryClient = new QueryClient()
export function Providers({
  children,
  session
}: {
  children: React.ReactNode
  session?: any
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
      {children}
    </SessionProvider>
    </QueryClientProvider>
  )
}