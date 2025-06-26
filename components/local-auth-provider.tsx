"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { LocalAuth, type User } from "@/lib/local-auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within a LocalAuthProvider")
  }
  return context
}

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Initialize default users and check current user
      LocalAuth.initializeDefaultUsers()
      const currentUser = LocalAuth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error initializing auth:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = LocalAuth.login(email, password)
      if (result.success && result.user) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed. Please try again." }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const result = LocalAuth.register(name, email, password)
      if (result.success && result.user) {
        setUser(result.user)
      }
      return result
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Registration failed. Please try again." }
    }
  }

  const logout = () => {
    try {
      LocalAuth.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}
