'use client'

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { SiteHeader } from "@/components/site-header"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

interface props {
  children: React.ReactNode
}

function DashboardContent({ children }: props) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function DashboardLayout({ children}: props) {
  return (
      <QueryClientProvider client={queryClient}>
      <DashboardContent>
      {children}
       </DashboardContent>
        </QueryClientProvider>
  
  )
}
