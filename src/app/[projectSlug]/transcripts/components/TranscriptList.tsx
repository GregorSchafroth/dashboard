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
import { CalendarIcon, ChevronDown, ArrowUpDown } from 'lucide-react'
import { cn, unslugify } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import Link from 'next/link'
import { useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { getLanguageFlag } from '@/lib/languages/utils'
import { debugLog } from '@/utils/debug'

type SortField =
  | 'transcriptNumber'
  | 'name'
  | 'topic'
  | 'messageCount'
  | 'language'
  | 'duration'
  | 'firstResponse'
  | 'lastResponse'
  | 'bookmarked'
  | 'createdAt'

type SortDirection = 'asc' | 'desc'

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
  projectSlug: string
  onTranscriptSelect?: (transcriptId: string) => void
  selectedTranscriptId?: string
}

const TranscriptList = ({ projectSlug }: Props) => {
  const router = useRouter()
  const segment = useSelectedLayoutSegment()

  // Add sort state
  const [sortField, setSortField] = useState<SortField>('lastResponse')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const link = (transcriptNumber: number) => {
    return `/${projectSlug}/transcripts/${transcriptNumber}`
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
    lastResponse: true,
    bookmarked: true,
    topic: true,
    date: false,
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

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // If clicking a new field, set it with default desc direction
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Sort function for transcripts
  const sortTranscripts = (data: Transcript[]) => {
    return [...data].sort((a, b) => {
      let comparison = 0

      // Handle different field types
      switch (sortField) {
        case 'transcriptNumber':
          comparison = a.transcriptNumber - b.transcriptNumber
          break
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'topic':
          comparison = (a.topic || '').localeCompare(b.topic || '')
          break
        case 'messageCount':
          comparison = a.messageCount - b.messageCount
          break
        case 'language':
          comparison = (a.language || '').localeCompare(b.language || '')
          break
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0)
          break
        case 'firstResponse':
          if (!a.firstResponse && !b.firstResponse) comparison = 0
          else if (!a.firstResponse) comparison = 1
          else if (!b.firstResponse) comparison = -1
          else
            comparison =
              new Date(a.firstResponse).getTime() -
              new Date(b.firstResponse).getTime()
          break
        case 'lastResponse':
          if (!a.lastResponse && !b.lastResponse) comparison = 0
          else if (!a.lastResponse) comparison = 1
          else if (!b.lastResponse) comparison = -1
          else
            comparison =
              new Date(a.lastResponse).getTime() -
              new Date(b.lastResponse).getTime()
          break
        case 'bookmarked':
          comparison = Number(a.bookmarked) - Number(b.bookmarked)
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  const toggleBookmark = async (
    e: React.MouseEvent,
    transcriptNumber: number,
    currentBookmarked: boolean
  ) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      debugLog(
        'components',
        `Toggling bookmark for transcript #${transcriptNumber}`
      )
      const projectName = unslugify(projectSlug)

      debugLog('components', `Making API request with:`, {
        projectName,
        transcriptNumber,
        currentBookmarked,
      })

      const response = await fetch(
        `/api/transcripts/${transcriptNumber}/bookmark`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectName,
            bookmarked: !currentBookmarked,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update bookmark status')
      }

      // Update local state
      setTranscripts((prevTranscripts) =>
        prevTranscripts.map((t) =>
          t.transcriptNumber === transcriptNumber
            ? { ...t, bookmarked: !currentBookmarked }
            : t
        )
      )
    } catch (err) {
      debugLog('components', 'Error updating bookmark:', err)
      // Optionally add error handling UI here
    }
  }

  useEffect(() => {
    const fetchTranscripts = async () => {
      if (!projectSlug) {
        setError('Project slug is required')
        setLoading(false)
        return
      }

      try {
        const projectName = unslugify(projectSlug)
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
  }, [projectSlug])

  // Filter and sort data
  const filteredAndSortedData = sortTranscripts(
    transcripts.filter((transcript) => {
      // Search matching function for text fields
      const matchesSearchQuery = (
        value: string | number | null | undefined
      ) => {
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
          const searchNumber = searchQuery.substring(1)
          return transcript.transcriptNumber === parseInt(searchNumber)
        }
        return matchesSearchQuery(transcript.transcriptNumber)
      }

      // Check all searchable fields
      const matchesSearch =
        matchesTranscriptNumber() ||
        matchesSearchQuery(transcript.voiceflowTranscriptId) ||
        matchesSearchQuery(transcript.name) ||
        matchesSearchQuery(
          formatDateForSearch(new Date(transcript.createdAt))
        ) ||
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
  )

  // Helper to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    return (
      <ArrowUpDown
        className={cn(
          'ml-2 h-4 w-4 inline-block',
          sortField === field ? 'opacity-100' : 'opacity-50'
        )}
      />
    )
  }

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
                Created At
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.number && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('transcriptNumber')}
                >
                  Transcript #{renderSortIndicator('transcriptNumber')}
                </TableHead>
              )}
              {columnVisibility.name && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('name')}
                >
                  Name{renderSortIndicator('name')}
                </TableHead>
              )}
              {columnVisibility.topic && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('topic')}
                >
                  Topic{renderSortIndicator('topic')}
                </TableHead>
              )}
              {columnVisibility.messages && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('messageCount')}
                >
                  Messages{renderSortIndicator('messageCount')}
                </TableHead>
              )}
              {columnVisibility.language && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('language')}
                >
                  Language{renderSortIndicator('language')}
                </TableHead>
              )}
              {columnVisibility.duration && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('duration')}
                >
                  Duration{renderSortIndicator('duration')}
                </TableHead>
              )}
              {columnVisibility.firstResponse && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('firstResponse')}
                >
                  First Response{renderSortIndicator('firstResponse')}
                </TableHead>
              )}
              {columnVisibility.lastResponse && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('lastResponse')}
                >
                  Last Response{renderSortIndicator('lastResponse')}
                </TableHead>
              )}
              {columnVisibility.bookmarked && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('bookmarked')}
                >
                  Bookmarked{renderSortIndicator('bookmarked')}
                </TableHead>
              )}
              {columnVisibility.date && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('createdAt')}
                >
                  Created At{renderSortIndicator('createdAt')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((transcript) => (
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
                        <span
                          onClick={(e) =>
                            toggleBookmark(
                              e,
                              transcript.transcriptNumber,
                              transcript.bookmarked
                            )
                          }
                          className='cursor-pointer hover:text-yellow-500 transition-colors'
                        >
                          {transcript.bookmarked ? '⭐️' : '☆'}
                        </span>
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
