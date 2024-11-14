// src/components/ui/CustomClerkProvider.tsx
'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function CustomClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and initial mount, return a basic provider
  if (!mounted) {
    return (
      <ClerkProvider appearance={{ baseTheme: undefined }}>
        {children}
      </ClerkProvider>
    )
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  )
}