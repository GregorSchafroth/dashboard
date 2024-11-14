'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

const NoProject = () => {
  const { language } = useLanguage()
  return <>{translations[language].home.noProject}</>
}
export default NoProject
