import React from 'react'
import { Loader2 } from 'lucide-react'

const TranscriptLoading = () => {
  return (
    <div className='flex items-center justify-center h-full'>
      <div className='flex-1 flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    </div>
  )
}

export default TranscriptLoading
