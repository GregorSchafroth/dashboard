// src/lib/languages/utils.ts
import { translations } from '@/i18n/translations'
import { languageToFlag } from './flags'

export function getLanguageFlag(languageCode: string | null): string {
  if (!languageCode) return '-'
  const normalizedCode = languageCode.toLowerCase().split('-')[0]
  return languageToFlag[normalizedCode] || languageCode
}

export function getLanguageName(languageCode: string | null, userLanguage: keyof typeof translations = 'en'): string {
  if (!languageCode) return '-'
  const normalizedCode = languageCode.toLowerCase().split('-')[0]
  return translations[userLanguage].languages[normalizedCode as keyof typeof translations.en.languages] || languageCode.toUpperCase()
}

export function getLanguageDisplay(languageCode: string | null, userLanguage: keyof typeof translations = 'en'): {
  combined: string
  flag: string
  code: string
  name: string
} {
  if (!languageCode) {
    return {
      combined: '-',
      flag: '-',
      code: '-',
      name: '-',
    }
  }
  
  const flag = getLanguageFlag(languageCode)
  const code = languageCode.toUpperCase()
  const name = getLanguageName(languageCode, userLanguage)
  
  return {
    combined: `${flag} ${name}`,
    flag,
    code,
    name,
  }
}