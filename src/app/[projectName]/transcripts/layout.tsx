// app/[projectName]/transcripts/layout.tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import TranscriptList from './components/TranscriptList'

type LayoutProps = {
  children: React.ReactNode
  params: {
    projectName: string
  }
}

export default async function TranscriptsLayout({
  children,
  params,
}: LayoutProps) {
  const { projectName } = await params
  const decodedProjectName = decodeURIComponent(projectName)
  const formattedProjectName = decodedProjectName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className='fixed top-[5.5rem] bottom-0 left-0 right-0'>
      <ResizablePanelGroup direction='horizontal' className='h-full'>
        <ResizablePanel defaultSize={50}>
          <div className='h-full relative'>
            {' '}
            {/* Added relative */}
            <ScrollArea className='h-full'>
              <TranscriptList projectName={formattedProjectName} />
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className='h-full'>
            <ScrollArea className='h-full'>
              <div className='px-4 py-2'>{children}</div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
