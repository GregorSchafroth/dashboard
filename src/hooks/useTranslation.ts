// src/hooks/useTranslation.ts
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? T[K] extends Array<unknown>
      ? K
      : `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never;

type Path<T> = PathImpl<T, keyof T>;

type TranslationType = typeof translations.en;
type TranslationPath = Path<TranslationType>;

export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (path: TranslationPath): string => {
    const keys = path.split('.') as (keyof TranslationType)[]
    let current: unknown = translations[language]
    
    for (const key of keys) {
      if (current === undefined || typeof current !== 'object') {
        console.warn(`Translation missing for key: ${path}`)
        return path
      }
      current = (current as Record<string, unknown>)[key]
    }
    
    if (typeof current !== 'string') {
      console.warn(`Invalid translation path: ${path}`)
      return path
    }
    
    return current
  }

  return { t }
}