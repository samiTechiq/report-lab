"use client"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import Cookies from 'js-cookie';
import { STORAGE_KEY } from "@/lib/utils";
import { Menu, LogOut, User, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePWA } from "@/hooks/use-pwa"

export function SiteHeader() {
  const { user } = useAuth()
  const { isInstallable, isInstalled, install } = usePWA()
  const handleSignOut = async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      Cookies.remove(STORAGE_KEY);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">Report Lab</span>
          </Link>
          {user && (
           <div className="hidden md:block"> 
            <nav className="flex items-center space-x-6 ">
              <Link
                href="/reports"
                className="transition-colors hover:text-foreground/80"
              >
                Reports
              </Link>
            </nav>
           </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isInstallable && !isInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={install}
              className="hidden md:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          )}
          {user ? (
            <>
              {/* Desktop view */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
              
              {/* Mobile view */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <Link href="/">
              <Button variant="ghost" className="text-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
