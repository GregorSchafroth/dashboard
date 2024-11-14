// src/components/Header.tsx

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import LanguageSelector from './header/LanguageSelector'
import Navbar from './header/Navbar'
import SignedOutButtons from './header/SignedOutButtons'
import { ThemeToggle } from './header/ThemeToggle'

const Header = () => {
  return (
    <header className='bg-re'>
      <div className='m-4 flex justify-between items-center'>
        <div className='flex gap-4 items-center'>
          <Link href='/' className='flex'>
            <Image
              src='/company-logo.png'
              width={200}
              height={62}
              alt='company logo'
              className='max-w-full h-auto hidden lg:block'
            />
            <Image
              src='/company-logo-small.png'
              width={62}
              height={62}
              alt='company logo'
              className='max-w-full h-auto lg:hidden'
            />
          </Link>
          <SignedIn>
            <Navbar />
          </SignedIn>
        </div>
        <div className='flex items-center gap-4 shrink-0'>
          <ThemeToggle />
          <LanguageSelector />
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'size-16',
                },
              }}
            />
          </SignedIn>
        </div>
        <SignedOut>
          <SignedOutButtons />
        </SignedOut>
      </div>
    </header>
  )
}

export default Header
