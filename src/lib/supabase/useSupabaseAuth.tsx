// lib/supabase/useSupabaseAuth.tsx
"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { supabase } from "./supabaseClient"

interface AuthContextType {
  user: any | null
  loading: boolean
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  signOut: async () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Refresh the current user safely
  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        // No valid session
        setUser(null)
      } else {
        setUser(data.user)
      }
    } catch (err) {
      console.error("Unexpected error fetching user:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  useEffect(() => {
    // Initial load
    refreshUser()

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
      } else {
        refreshUser()
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to access auth state
export const useAuth = () => useContext(AuthContext)
