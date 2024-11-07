// src/components/Header.tsx

import { SignedIn, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from './header/Navbar'

const Header = () => {
  return (
    <header>
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
      </nav>
    </header>
  )
}

export default Header
