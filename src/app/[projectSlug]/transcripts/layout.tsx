// app/[projectSlug]/transcripts/layout.tsx
import { ResizablePanelLayout } from '@/components/layouts/ResizablePanelLayout'
import TranscriptList from './components/TranscriptList'

type LayoutProps = {
  children: React.ReactNode
  params: {
    projectSlug: string
  }
}

export default async function TranscriptsLayout({
  children,
  params,
}: LayoutProps) {
  const { projectSlug } = await params

  return (
    <ResizablePanelLayout
      leftPanel={<TranscriptList projectSlug={projectSlug} />}
      rightPanel={children}
    />
  )
}