// src/app/layout.tsx

import Header from '@/components/Header'
import CustomClerkProvider from '@/components/ui/CustomClerkProvider'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/contexts/LanguageContext'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAIA Dashboard',
  description: 'Swiss AI Auomation Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body className='min-h-screen bg-background antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <CustomClerkProvider>
            <LanguageProvider>
              <div className='relative flex min-h-screen flex-col'>
                <Header />
                <main className='flex-1'>{children}</main>
              </div>
              <Toaster />
            </LanguageProvider>
          </CustomClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
