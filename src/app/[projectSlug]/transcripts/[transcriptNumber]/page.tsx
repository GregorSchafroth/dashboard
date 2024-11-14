// src/app/[projectSlug]/transcripts/[transcriptNumber]/page.tsx
import { Suspense } from 'react'
import TranscriptViewer from './components/TranscriptViewer'
import TranscriptLoading from './components/TranscriptLoading'

type PageProps = {
  params: Promise<{
    projectSlug: string
    transcriptNumber: string
  }>
}

const TranscriptPage = async ({ params }: PageProps) => {
  const { projectSlug, transcriptNumber } = await params

  return (
    <div className='px-4 py-2 flex flex-col h-full'>
      <Suspense fallback={<TranscriptLoading />}>
        <TranscriptViewer
          projectSlug={projectSlug}
          transcriptNumber={transcriptNumber}
        />
      </Suspense>
    </div>
  )
}

export default TranscriptPage