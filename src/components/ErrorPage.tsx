'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { Card } from './ui/card'

export default function ErrorPage({
  title = 'Project Not Found',
  description = "The project you're looking for doesn't exist or you don't have access to it.",
  showBackButton = true,
  showHomeButton = true,
}) {
  const router = useRouter()

  return (
    <div className='flex flex-1 flex-col items-center justify-center p-4 bg-background mb-10'>
      <Card className='p-10'>
        <div className='max-w-md w-full space-y-6'>
          {/* Error Icon */}
          <div className='flex justify-center'>
            <div className='w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
              <AlertTriangle className='h-10 w-10 text-destructive' />
            </div>
          </div>

          {/* Error Message */}
          <Alert variant='destructive' className='border-2'>
            <AlertTitle className='text-xl font-semibold tracking-tight text-center'>
              {title}
            </AlertTitle>
            <AlertDescription className='text-center mt-2'>
              {description}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center mt-6'>
            {showBackButton && (
              <Button
                variant='outline'
                onClick={() => router.back()}
                className='min-w-[120px]'
              >
                Go Back
              </Button>
            )}
            {showHomeButton && (
              <Button
                onClick={() => router.push('/')}
                className='min-w-[120px]'
              >
                Go Home
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
