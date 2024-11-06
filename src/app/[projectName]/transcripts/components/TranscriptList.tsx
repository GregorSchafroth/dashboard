// src/app/[projectName]transcripts/components/TranscriptList.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import Link from 'next/link'
import { useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { getLanguageFlag } from '@/lib/languages/utils'

type Transcript = {
  id: number
  transcriptNumber: number
  voiceflowTranscriptId: string
  name: string | null
  messageCount: number
  isComplete: boolean
  createdAt: string
  language: string | null
  firstResponse: string | null
  lastResponse: string | null
  bookmarked: boolean
  duration: number | null
  topic: string | null
}

type Props = {
  projectName: string
  onTranscriptSelect?: (transcriptId: string) => void
  selectedTranscriptId?: string
}

const TranscriptList = ({ projectName }: Props) => {
  const router = useRouter()
  const segment = useSelectedLayoutSegment()

  const link = (transcriptNumber: number) => {
    const urlProjectName = projectName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    return `/${urlProjectName}/transcripts/${transcriptNumber}`
  }

  const handleTranscriptClick = (
    e: React.MouseEvent,
    transcriptNumber: number
  ) => {
    e.preventDefault()
    router.push(link(transcriptNumber))
  }

  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [columnVisibility, setColumnVisibility] = useState({
    number: true,
    name: false,
    messages: true,
    language: true,
    duration: false,
    firstResponse: false,
    lastResponse: false,
    bookmarked: false,
    topic: true,
    date: true,
  })

  // Helper function to format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  // Helper function to format datetime
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm')
  }

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!projectName) {
        setError('Project name is required')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/transcripts?projectName=${encodeURIComponent(projectName)}`
        )

        if (response.status === 404) {
          setError('Project not found')
          setLoading(false)
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch transcripts')
        }

        const { data } = await response.json()
        if (!data) {
          throw new Error('No data received from server')
        }

        setTranscripts(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching transcripts:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch transcripts'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTranscripts()
  }, [projectName])

  // Filter data based on search query and date range
  const filteredData = transcripts.filter((transcript) => {
    // Search matching function for text fields
    const matchesSearchQuery = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchQuery.toLowerCase())
    }

    // Format date for searching
    const formatDateForSearch = (date: Date) => {
      return date
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .toLowerCase()
    }

    // Special handling for transcript number search with # prefix
    const matchesTranscriptNumber = () => {
      if (searchQuery.startsWith('#')) {
        const searchNumber = searchQuery.substring(1) // Remove the # prefix
        return transcript.transcriptNumber === parseInt(searchNumber)
      }
      return matchesSearchQuery(transcript.transcriptNumber)
    }

    // Check all searchable fields
    const matchesSearch =
      // Transcript number search (including # prefix)
      matchesTranscriptNumber() ||
      // ID search
      matchesSearchQuery(transcript.voiceflowTranscriptId) ||
      // Name search
      matchesSearchQuery(transcript.name) ||
      // Date search - allows searching by "june 2024" or "june 15" or "2024"
      matchesSearchQuery(formatDateForSearch(new Date(transcript.createdAt))) ||
      // Simple date format search (fallback)
      matchesSearchQuery(
        new Date(transcript.createdAt).toISOString().split('T')[0]
      )

    // Date range filtering
    const transcriptDate = new Date(transcript.createdAt)
    const matchesDate =
      !dateRange?.from ||
      !dateRange?.to ||
      (transcriptDate >= dateRange.from &&
        transcriptDate <= addDays(dateRange.to, 1))

    return matchesSearch && matchesDate
  })

  if (loading) return <div className='p-4'>Loading...</div>
  if (error) return <div className='p-4'>Error: {error}</div>

  return (
    <div className='px-4 py-2 w-full space-y-2 truncate'>
      <div className='flex gap-2 items-center justify-between relative'>
        <div className='relative z-[100] flex-1'>
          <Input
            placeholder='Search transcripts...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='flex gap-2 relative z-[100]'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='end'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                Columns <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.number}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, number: checked }))
                }
              >
                Transcript #
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.name}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, name: checked }))
                }
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.topic}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, topic: checked }))
                }
              >
                Topic
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.messages}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    messages: checked,
                  }))
                }
              >
                Messages
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.language}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    language: checked,
                  }))
                }
              >
                Language
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.duration}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    duration: checked,
                  }))
                }
              >
                Duration
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.firstResponse}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    firstResponse: checked,
                  }))
                }
              >
                First Response
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.lastResponse}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    lastResponse: checked,
                  }))
                }
              >
                Last Response
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.bookmarked}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    bookmarked: checked,
                  }))
                }
              >
                Bookmarked
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.date}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, date: checked }))
                }
              >
                Date
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.number && <TableHead>Transcript #</TableHead>}
              {columnVisibility.name && <TableHead>Name</TableHead>}
              {columnVisibility.topic && <TableHead>Topic</TableHead>}
              {columnVisibility.messages && <TableHead>Messages</TableHead>}
              {columnVisibility.language && <TableHead>Language</TableHead>}
              {columnVisibility.duration && <TableHead>Duration</TableHead>}
              {columnVisibility.firstResponse && (
                <TableHead>First Response</TableHead>
              )}
              {columnVisibility.lastResponse && (
                <TableHead>Last Response</TableHead>
              )}
              {columnVisibility.bookmarked && <TableHead>Bookmarked</TableHead>}
              {columnVisibility.date && <TableHead>Date</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((transcript) => (
                <TableRow
                  key={transcript.transcriptNumber}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    segment === transcript.transcriptNumber.toString()
                      ? 'bg-gray-100'
                      : ''
                  }`}
                >
                  {columnVisibility.number && (
                    <TableCell className='font-medium p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        #{transcript.transcriptNumber}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.name && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {transcript.name || 'Unnamed'}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.topic && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {transcript.topic || '-'}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.messages && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {transcript.messageCount}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.language && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {getLanguageFlag(transcript.language)}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.duration && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {formatDuration(transcript.duration)}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.firstResponse && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {formatDateTime(transcript.firstResponse)}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.lastResponse && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {formatDateTime(transcript.lastResponse)}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.bookmarked && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {transcript.bookmarked ? '★' : '☆'}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.date && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {format(new Date(transcript.createdAt), 'MMM d, yyyy')}
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(columnVisibility).filter(Boolean).length
                  }
                  className='h-24 text-center'
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TranscriptList
