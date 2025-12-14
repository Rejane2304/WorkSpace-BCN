"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext()

export { AuthContext }

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  const login = (userData, newToken) => {
    setUser(userData)
    setToken(newToken)
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser

      const updatedUser = {
        ...prevUser,
        ...updatedFields,
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    let savedToken = localStorage.getItem("token")

    if (savedUser && savedToken) {
      if (savedToken.startsWith('"') && savedToken.endsWith('"')) {
        savedToken = savedToken.slice(1, -1)
        localStorage.setItem("token", savedToken)
      }
      
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }

    setLoading(false)
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    updateUser,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
