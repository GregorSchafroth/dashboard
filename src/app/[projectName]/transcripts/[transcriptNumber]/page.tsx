// src/app/[projectName]/transcripts/[transcriptNumber]/page.tsx

import TranscriptViewer from './TranscriptViewer'

type PageProps = {
  params: Promise<{
    projectName: string
    transcriptNumber: string
  }>
}

export default async function TranscriptPage({ params }: PageProps) {
  const { projectName, transcriptNumber } = await params

  return (
    <TranscriptViewer
      projectName={decodeURIComponent(projectName)}
      transcriptNumber={transcriptNumber}
    />
  )
}
