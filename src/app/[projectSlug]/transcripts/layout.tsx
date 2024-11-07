// app/[projectSlug]/transcripts/layout.tsx
import { ResizablePanelLayout } from '@/components/layouts/ResizablePanelLayout'
import TranscriptList from './components/TranscriptList'

type LayoutProps = {
  children: React.ReactNode
  params?: Promise<{
    projectSlug: string
  }>
}

export default async function TranscriptsLayout({
  children,
  params,
}: LayoutProps) {
  if (!params) {
    throw new Error('Project slug is required')
  }

  const resolvedParams = await params
  const { projectSlug } = resolvedParams

  return (
    <ResizablePanelLayout
      leftPanel={<TranscriptList projectSlug={projectSlug} />}
      rightPanel={children}
    />
  )
}