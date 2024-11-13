// src/contexts/LanguageContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'

type Language = 'en' | 'de'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
}

const isValidLanguage = (lang: string | undefined): lang is Language => {
  return lang === 'en' || lang === 'de'
}

const getInitialLanguage = (): Language => {
  const envLang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE
  return isValidLanguage(envLang) ? envLang : 'en'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage())

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}