'use client'

import { cn } from '@/lib/utils'

import { useTheme } from 'next-themes'
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

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
            : 'hover:bg-muted-foreground/10 text-muted-foreground '
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
            : 'hover:bg-muted-foreground/10 text-muted-foreground '
        )}
      >
        💻
      </button>
    </div>
  )
}
