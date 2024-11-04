// src/app/[projectName]/transcripts/[transcriptID]

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import TranscriptList from '../components/TranscriptList'
import TranscriptViewer from './TranscriptViewer'
import { ScrollArea } from '@/components/ui/scroll-area'

type PageProps = {
  params: {
    projectName: string
    transcriptId: string
  }
}

const formatProjectName = (name: string) => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const TranscriptPage = async ({ params }: PageProps) => {
  const resolvedParams = await params
  const projectName = formatProjectName(resolvedParams.projectName)

  return (
    <div className='fixed top-[5.5rem] bottom-0 left-0 right-0'>
      <ResizablePanelGroup direction='horizontal' className='h-full'>
        <ResizablePanel defaultSize={25}>
          <div className='h-full'>
            <ScrollArea className='h-full'>
              <div className='px-4 py-2'>
                <TranscriptList projectName={projectName} />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className='h-full'>
            <ScrollArea className='h-full'>
              <div className='px-4 py-2'>
                <TranscriptViewer transcriptID={params.transcriptId} />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default TranscriptPage
