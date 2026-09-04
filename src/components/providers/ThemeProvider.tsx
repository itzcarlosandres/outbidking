"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }
  }, [])

  // Al montar el componente, leer localStorage o preferencia del sistema y aplicar inmediatamente
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pujalol_theme") as Theme | null
      if (saved === "dark" || saved === "light") {
        setThemeState(saved)
        applyTheme(saved)
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const initial = prefersDark ? "dark" : "light"
        setThemeState(initial)
        applyTheme(initial)
      }
    } catch (e) {}
  }, [applyTheme])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem("pujalol_theme", newTheme)
      } catch (e) {}
      applyTheme(newTheme)
    },
    [applyTheme]
  )

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light"
      try {
        localStorage.setItem("pujalol_theme", nextTheme)
      } catch (e) {}
      applyTheme(nextTheme)
      return nextTheme
    })
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

