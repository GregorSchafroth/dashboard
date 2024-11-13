// src/app/[projectSlug]/page.tsx

import AnalyticsPage from './analytics/page'
import TranscriptList from './transcripts/components/TranscriptList'

interface SearchParams {
  [key: string]: string | string[] | undefined
}

type PageProps = {
  params?: Promise<{
    projectSlug: string
  }>
  searchParams?: Promise<SearchParams>
}

export default async function Page({ params }: PageProps) {
  if (!params) {
    throw new Error('Project slug is required')
  }

  const resolvedParams = await params
  const { projectSlug } = resolvedParams

  if (!projectSlug) {
    throw new Error('Project slug is required')
  }

  return (
    <div>
      <AnalyticsPage params={{ projectSlug }} layout="compact" />
      <TranscriptList projectSlug={projectSlug} />
    </div>
  )
}