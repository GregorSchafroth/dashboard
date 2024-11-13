// src/components/header/LanguageSelector.tsx
'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-3 py-1 rounded font-medium transition-colors text-2xl lg:text-3xl',
          language === 'en'
            ? 'bg-background text-foreground shadow-sm' 
            : 'hover:bg-muted-foreground/10 text-muted-foreground'
        )}
      >
        🇬🇧
      </button>
      <button
        onClick={() => setLanguage('de')}
        className={cn(
          'px-3 py-1 rounded font-medium transition-colors text-2xl lg:text-3xl',
          language === 'de'
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:bg-muted-foreground/10 text-muted-foreground '
        )}
      >
        🇩🇪
      </button>
    </div>
  )
}

export default LanguageSelector