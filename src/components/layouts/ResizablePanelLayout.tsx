// components/layouts/ResizablePanelLayout.tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'

type ResizablePanelLayoutProps = {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  leftPanelDefaultSize?: number
  rightPanelDefaultSize?: number
}

export function ResizablePanelLayout({
  leftPanel,
  rightPanel,
  leftPanelDefaultSize = 50,
  rightPanelDefaultSize = 50,
}: ResizablePanelLayoutProps) {
  return (
    <div className='fixed top-[5.5rem] bottom-0 left-0 right-0'>
      <ResizablePanelGroup direction='horizontal' className='h-full'>
        <ResizablePanel defaultSize={leftPanelDefaultSize}>
          <div className='h-full relative'>
            <ScrollArea className='h-full'>{leftPanel}</ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={rightPanelDefaultSize}>
          <div className='h-full'>
            <ScrollArea className='h-full'>
              <div className='h-full'>{rightPanel}</div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
