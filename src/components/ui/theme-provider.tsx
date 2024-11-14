// src/components/theme-provider.tsx

"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      forcedTheme={mounted ? undefined : "system"}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}