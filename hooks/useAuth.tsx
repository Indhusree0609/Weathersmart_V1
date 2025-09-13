"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, authService } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")

        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 10000),
        )

        const {
          data: { session },
          error,
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any

        if (error) {
          console.error("Session error:", error)

          // Handle invalid refresh token specifically
          if (error.message?.includes("Invalid Refresh Token") || error.message?.includes("Refresh Token Not Found")) {
            console.log("Invalid refresh token detected, clearing session...")
            await supabase.auth.signOut()
            if (mounted) {
              setUser(null)
              setError(null) // Don't show error for invalid tokens, just sign out
            }
            return
          }

          setError(`Authentication error: ${error.message}`)
        } else {
          console.log("Session loaded:", !!session?.user)
          if (mounted) {
            setUser(session?.user ?? null)
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          // Handle timeout or network errors
          if (error instanceof Error && error.message === "Session fetch timeout") {
            setError("Connection timeout. Please check your internet connection.")
          } else {
            setError(error instanceof Error ? error.message : "Failed to initialize authentication")
          }
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session?.user)

      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
      }

      if (mounted) {
        setUser(session?.user ?? null)
        setError(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const result = await authService.signIn(email, password)
      if (result.error) {
        setError(result.error.message)
      }
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed"
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const result = await authService.signUp(email, password)
      if (result.error) {
        setError(result.error.message)
      }
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign up failed"
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      setError(error instanceof Error ? error.message : "Sign out failed")
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
