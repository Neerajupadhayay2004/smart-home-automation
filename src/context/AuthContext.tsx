"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import ReactNativeBiometrics from "react-native-biometrics"

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  login: (email: string, password: string) => Promise<boolean>
  loginWithBiometrics: () => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      const userData = await AsyncStorage.getItem("userData")

      if (token && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      const response = await fetch("https://your-api.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        await AsyncStorage.setItem("authToken", data.token)
        await AsyncStorage.setItem("userData", JSON.stringify(data.user))

        setIsAuthenticated(true)
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const loginWithBiometrics = async (): Promise<boolean> => {
    try {
      const rnBiometrics = new ReactNativeBiometrics()
      const { available, biometryType } = await rnBiometrics.isSensorAvailable()

      if (available) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: "Authenticate to access Smart Home",
        })

        if (success) {
          // Use stored credentials for biometric login
          const storedUser = await AsyncStorage.getItem("biometricUser")
          if (storedUser) {
            setIsAuthenticated(true)
            setUser(JSON.parse(storedUser))
            return true
          }
        }
      }
      return false
    } catch (error) {
      console.error("Biometric login error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["authToken", "userData"])
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        loginWithBiometrics,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
