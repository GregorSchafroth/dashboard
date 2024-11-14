// src/components/ThemeDebug.tsx

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeDebug() {
  const { theme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className='fixed bottom-4 right-4 p-4 bg-background border rounded shadow-lg z-50'>
      <div>Current theme: {theme}</div>
      <div>Resolved theme: {resolvedTheme}</div>
      <div>System theme: {systemTheme}</div>
      <div>
        Prefers dark:{' '}
        {window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'Yes'
          : 'No'}
      </div>
    </div>
  )
}
