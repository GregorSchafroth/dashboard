// src/components/Header.tsx

import {
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from './header/Navbar'
import SignedOutButtons from './header/SignedOutButtons'

const Header = () => {
  return (
    <header className='bg-re'>
      <nav className='m-4 flex justify-between items-center'>
        <Link href='/' className='flex'>
          <Image
            src='/company-logo.png'
            width={200}
            height={62}
            alt='company logo'
            className='max-w-full h-auto hidden sm:block'
          />
          <Image
            src='/company-logo-small.png'
            width={62}
            height={62}
            alt='company logo'
            className='max-w-full h-auto sm:hidden'
          />
        </Link>
        <SignedIn>
          <Navbar />
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'size-16',
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignedOutButtons />
        </SignedOut>
      </nav>
    </header>
  )
}

export default Header
