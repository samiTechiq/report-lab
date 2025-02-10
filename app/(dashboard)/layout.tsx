'use client'

import { SiteHeader } from "@/components/site-header"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"

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
  useEffect(() => {
    const handleWheel = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.type === "number") {
            target.blur();
        }
    };

    document.addEventListener("wheel", handleWheel);
    return () => document.removeEventListener("wheel", handleWheel);
}, []);
  return (
      <QueryClientProvider client={queryClient}>
      <DashboardContent>
      {children}
       </DashboardContent>
        </QueryClientProvider>
  
  )
}
