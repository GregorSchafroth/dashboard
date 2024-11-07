// src/app/[projectSlug]/page.tsx

import AnalyticsPage from './analytics/page'
import TranscriptList from './transcripts/components/TranscriptList'

type PageProps = {
  params?: Promise<{
    projectSlug: string
  }> | {
    projectSlug: string
  }
  projectSlug?: string
}

const page = async ({ params, projectSlug: directProjectSlug }: PageProps) => {
  // Handle both Promise and direct object cases
  const resolvedParams = await Promise.resolve(params)
  const projectSlug = directProjectSlug || resolvedParams?.projectSlug
  
  if (!projectSlug) {
    throw new Error('Project slug is required')
  }

  return (
    <div>
      <AnalyticsPage params={{projectSlug}} />
      <TranscriptList projectSlug={projectSlug} />
    </div>
  )
}

export default page
