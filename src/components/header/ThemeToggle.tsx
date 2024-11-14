'use client'

import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render component after it's mounted on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing a consistent initial state
  if (!mounted) {
    return (
      <div className="hidden lg:flex bg-muted rounded-lg p-0.5 gap-0.5">
        {/* Render buttons with base styles only */}
        {['☀️', '🌙', '💻'].map((icon, i) => (
          <button
            key={i}
            className="px-3 py-1 rounded-md font-medium transition-colors text-2xl lg:text-3xl text-muted-foreground"
            aria-hidden="true"
          >
            {icon}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="hidden lg:flex bg-muted rounded-lg p-0.5 gap-0.5">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'px-3 py-1 rounded-md font-medium transition-colors text-2xl lg:text-3xl',
          theme === 'light'
            ? 'bg-background text-foreground shadow-sm' 
            : 'hover:bg-muted-foreground/10 text-muted-foreground'
        )}
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'px-3 py-1 rounded-md font-medium transition-colors text-2xl lg:text-3xl',
          theme === 'dark'
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:bg-muted-foreground/10 text-muted-foreground'
        )}
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'px-3 py-1 rounded-md font-medium transition-colors text-2xl lg:text-3xl',
          theme === 'system'
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:bg-muted-foreground/10 text-muted-foreground'
        )}
      >
        💻
      </button>
    </div>
  )
}