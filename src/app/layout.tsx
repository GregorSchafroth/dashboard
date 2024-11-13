// src/app/layout.tsx

import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'

import './globals.css'
import Header from '@/components/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

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
    <ClerkProvider>
      <html lang='en'>
        <body>
          <LanguageProvider>
            <main className='h-screen flex flex-col'>
              <Header />
              <main className='flex flex-col flex-1'>{children}</main>
            </main>
            <Toaster />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
