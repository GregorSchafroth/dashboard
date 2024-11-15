// src/app/[projectSlug]/transcripts/[transcriptNumber]/page.tsx
import { Suspense } from 'react'
import TranscriptViewer from './components/TranscriptViewer'
import TranscriptLoading from './components/TranscriptLoading'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    projectSlug: string
    transcriptNumber: string
  }>
}

type NotFoundError = Error & {
  digest: string
}

const TranscriptPage = async ({ params }: PageProps) => {
  const { projectSlug, transcriptNumber } = await params

  try {
    return (
      <div className='h-full flex flex-col px-4 py-2'>
        <Suspense fallback={<TranscriptLoading />}>
          <TranscriptViewer
            projectSlug={projectSlug}
            transcriptNumber={transcriptNumber}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    // Check if this is a Next.js not-found error
    if (
      error instanceof Error &&
      (error as NotFoundError).digest === 'NEXT_NOT_FOUND'
    ) {
      notFound()
    }
    // Re-throw any other errors
    throw error
  }
}

export default TranscriptPage
