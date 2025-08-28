'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthState, UserRole } from '@/types'

interface AuthContextType extends AuthState {
  login: (password: string, email: string) => Promise<void>
  logout: () => Promise<void>
  signUp: (password: string, email: string, role: UserRole, username: string, mobileNumber: string, address: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
  })

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user
      if (user) {
        setAuthState({
          isAuthenticated: true,
          userRole: user.user_metadata.role || null,
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          userRole: null,
        })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (password: string, email: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signUp = async (password: string, email: string, role: UserRole, username: string, mobileNumber: string, address: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          username,
          mobile_number: mobileNumber,
          address,
        },
      },
    })
    if (error) throw error
    return { data, error }
  }

  return <AuthContext.Provider value={{ ...authState, login, logout, signUp }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
