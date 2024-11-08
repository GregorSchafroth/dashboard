// src/components/header/SignedOutButtons.tsx

'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'

const SignedOutButtons = () => {
  const pathname = usePathname()

  return (
    <div className='flex gap-2'>
      {!pathname.includes('/sign-in') && (
        <Button asChild>
          <SignInButton />
        </Button>
      )}
      {!pathname.includes('/sign-up') && (
        <Button asChild>
          <SignUpButton />
        </Button>
      )}
    </div>
  )
}

export default SignedOutButtons
