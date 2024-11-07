// app/[projectName]/transcripts/[transcriptNumber]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <h2 className='text-2xl font-bold mb-4'>Something went wrong!</h2>
      <p className='text-gray-600 mb-4'>{error.message}</p>
      <button
        onClick={() => reset()}
        className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
      >
        Try again
      </button>
    </div>
  )
}