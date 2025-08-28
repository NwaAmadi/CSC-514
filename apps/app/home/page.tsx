"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, userRole, logout } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>You are logged in as {userRole}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              {userRole === "admin" && (
                <Link href="/admin/dashboard">
                  <Button className="w-full" size="lg">
                    Go to Admin Dashboard
                  </Button>
                </Link>
              )}
              {userRole === "cashier" && (
                <Link href="/cashier/dashboard">
                  <Button className="w-full" size="lg">
                    Go to Cashier Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={logout} className="w-full bg-transparent">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Office Accounting System</h1>
          <p className="text-xl text-muted-foreground">Secure system for administrators and cashiers</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>Access administrative features and manage cashiers</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/login">
                <Button className="w-full" size="lg">
                  Login as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl">Cashier Login</CardTitle>
              <CardDescription>View cashier details and transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cashier/login">
                <Button variant="secondary" className="w-full" size="lg">
                  Login as Cashier
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
