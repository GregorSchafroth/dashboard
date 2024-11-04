// app/[projectName]/transcripts/page.tsx

import TranscriptList from './components/TranscriptList'

type PageProps = {
  params: Promise<{
    projectName: string
  }>
}

export default async function TranscriptsPage({ params }: PageProps) {
  const { projectName: encodedProjectName } = await params
  const decodedProjectName = decodeURIComponent(encodedProjectName)
  const projectName = decodedProjectName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return <TranscriptList projectName={projectName} />
}
