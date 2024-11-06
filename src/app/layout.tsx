// src/app/layout.tsx

import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/toaster'
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
    <ClerkProvider>
      <html lang='en'>
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
