// src/lib/languages/utils.ts
import { languageToFlag } from './flags'

export function getLanguageFlag(languageCode: string | null): string {
  if (!languageCode) return '-'
  
  // Handle specific regional variants
  const normalizedCode = languageCode.toLowerCase().split('-')[0]
  
  return languageToFlag[normalizedCode] || languageCode
}

export function getLanguageDisplay(languageCode: string | null): string {
  if (!languageCode) return '-'
  const flag = getLanguageFlag(languageCode)
  return `${flag} ${languageCode.toUpperCase()}`
}