// src/app/[projectSlug]/transcripts/[transcriptNumber]/page.tsx

import TranscriptViewer from './components/TranscriptViewer'

type PageProps = {
  params: Promise<{
    projectSlug: string
    transcriptNumber: string
  }>
}

const TranscriptPage = async ({ params }: PageProps) => {
  const { projectSlug, transcriptNumber } = await params

  return (
    <div className='px-4 py-2'>
      <TranscriptViewer
        projectSlug={projectSlug}
        transcriptNumber={transcriptNumber}
      />
    </div>
  )
}
export default TranscriptPage
