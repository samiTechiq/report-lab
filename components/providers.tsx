'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { UserProvider } from "@/context/user-context"
import { SupervisorProvider } from "@/context/supervisor-context"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"



export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <SupervisorProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system" 
              enableSystem
              disableTransitionOnChange
              storageKey="report-lab-theme"
            >
              <div className="min-h-screen bg-background">
                {children}
                <Toaster />
              </div>
            </ThemeProvider>
          </SupervisorProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
