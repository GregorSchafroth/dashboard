import React from 'react'
import { Loader2 } from 'lucide-react'

const TranscriptLoading = () => {
  return (
    <div className='h-full flex items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
    </div>
  )
}

export default TranscriptLoading
