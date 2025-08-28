'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Shield, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const { userRole, logout } = useAuth()
  const { setTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between bg-background px-4 md:px-6 border-b">
      <div className="flex items-center gap-4">
        <Link className="flex items-center gap-2 text-lg font-semibold" href="/home">
          <Shield className="w-6 h-6" />
          <span>Office Accounting</span>
        </Link>
        <span className="text-sm text-muted-foreground">
          {userRole === 'admin' ? 'Admin' : 'Cashier'} Dashboard
        </span>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="md:hidden" size="icon" variant="outline">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="grid gap-4 p-4">
            <Link
              className="flex items-center gap-2 text-lg font-semibold"
              href={userRole === 'admin' ? '/admin/dashboard' : '/cashier/dashboard'}
            >
              Dashboard
            </Link>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}