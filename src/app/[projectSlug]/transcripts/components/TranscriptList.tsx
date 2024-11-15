// src/app/[projectSlug]/transcipts/components/TranscriptList.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { getLanguageFlag } from '@/lib/languages/utils'
import { cn } from '@/lib/utils'
import { Logger } from '@/utils/debug'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { ArrowUpDown, CalendarIcon, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'

type SortField =
  | 'transcriptNumber'
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
  topicTranslations: {
    en: string
    de: string
  } | null
}

type TopicTranslations = {
  en: string
  de: string
}

type Props = {
  projectSlug: string
  onTranscriptSelect?: (transcriptId: string) => void
  selectedTranscriptId?: string
}

const TranscriptList = ({ projectSlug }: Props) => {
  const { language } = useLanguage()
  const t = translations[language].transcripts.list
  const calendarLocale = language === 'de' ? de : undefined
  const router = useRouter()
  const segment = useSelectedLayoutSegment()
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
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)

    // Create pairs of units and their values
    const units = [
      { value: years, label: 'y' },
      { value: months % 12, label: 'mo' },
      { value: days % 30, label: 'd' },
      { value: hours % 24, label: 'h' },
      { value: minutes % 60, label: 'm' },
    ]

    // Filter out zero values
    const significantUnits = units.filter((unit) => unit.value > 0)

    // If no significant units, return 0m
    if (significantUnits.length === 0) return '0m'

    // Take only the two most significant units
    return significantUnits
      .slice(0, 2)
      .map((unit) => `${unit.value}${unit.label}`)
      .join(' ')
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
      Logger.components(`Toggling bookmark for transcript #${transcriptNumber}`)

      Logger.components(`Making API request with:`, {
        projectSlug,
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
            projectSlug,
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
      Logger.components('Error updating bookmark:', err)
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
        const response = await fetch(
          `/api/transcripts?projectSlug=${projectSlug}`
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
        Logger.error('Error fetching transcripts:', err)
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
      // Date range filtering
      if (dateRange?.from || dateRange?.to) {
        const transcriptDate = new Date(transcript.createdAt)
        
        if (dateRange.from && dateRange.to) {
          // Adjust the to date to include the entire day
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          
          if (transcriptDate < dateRange.from || transcriptDate > toDate) {
            return false
          }
        } else if (dateRange.from) {
          if (transcriptDate < dateRange.from) {
            return false
          }
        } else if (dateRange.to) {
          // Adjust the to date to include the entire day
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          
          if (transcriptDate > toDate) {
            return false
          }
        }
      }

      // Search matching function for text fields
      const matchesSearchQuery = (
        value: string | number | null | undefined
      ) => {
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      }

      // Special handling for topics with translations from DB
      const matchesTopic = () => {
        // If no search query, return true
        if (!searchQuery) return true

        // Check translated topic first if translations exist
        if (transcript.topicTranslations) {
          const translations = transcript.topicTranslations as TopicTranslations
          const translatedTopic =
            translations[language as keyof TopicTranslations]
          if (
            translatedTopic &&
            translatedTopic.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return true
          }
        }

        // Fallback to regular topic field
        return transcript.topic
          ? transcript.topic.toLowerCase().includes(searchQuery.toLowerCase())
          : false
      }

      // Special handling for transcript number search with # prefix
      const matchesTranscriptNumber = () => {
        if (searchQuery.startsWith('#')) {
          const searchNumber = searchQuery.substring(1)
          return transcript.transcriptNumber === parseInt(searchNumber)
        }
        return matchesSearchQuery(transcript.transcriptNumber)
      }

      // Check all searchable fields, prioritizing topic matches
      return matchesTranscriptNumber() || matchesTopic()
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

  if (loading) return <div className='p-4'>{t.loading}</div>
  if (error) return <div className='p-4'>Error: {error}</div>

  return (
    <div className='px-4 py-2 w-full space-y-2 truncate'>
      <div className='flex flex-wrap gap-2 items-start justify-between relative'>
        <div className='relative z-[100] flex-1 min-w-[200px]'>
          <Input
            placeholder={t.search}
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
                      {format(dateRange.from, 'PPP', {
                        locale: calendarLocale,
                      })}{' '}
                      -{' '}
                      {format(dateRange.to, 'PPP', { locale: calendarLocale })}
                    </>
                  ) : (
                    format(dateRange.from, 'PPP', { locale: calendarLocale })
                  )
                ) : (
                  <span>{t.pickDateRange}</span>
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
                locale={calendarLocale}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                {t.columns} <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.number}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, number: checked }))
                }
              >
                {t.columnNames.number}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.topic}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, topic: checked }))
                }
              >
                {t.columnNames.topic}
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
                {t.columnNames.messages}
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
                {t.columnNames.language}
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
                {t.columnNames.duration}
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
                {t.columnNames.firstResponse}
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
                {t.columnNames.lastResponse}
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
                {t.columnNames.bookmarked}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.date}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, date: checked }))
                }
              >
                {t.columnNames.createdAt}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='text-sm text-muted-foreground'>
        {filteredAndSortedData.length === transcripts.length ? (
          <span>
            {t.showingAllResults.replace('{count}', transcripts.length.toString())}
          </span>
        ) : (
          <span>
            {t.showingFilteredResults
              .replace('{filtered}', filteredAndSortedData.length.toString())
              .replace('{total}', transcripts.length.toString())}
          </span>
        )}
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
                  {t.columnNames.number}
                  {renderSortIndicator('transcriptNumber')}
                </TableHead>
              )}
              {columnVisibility.topic && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('topic')}
                >
                  {t.columnNames.topic}
                  {renderSortIndicator('topic')}
                </TableHead>
              )}
              {columnVisibility.messages && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('messageCount')}
                >
                  {t.columnNames.messages}
                  {renderSortIndicator('messageCount')}
                </TableHead>
              )}
              {columnVisibility.language && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('language')}
                >
                  {t.columnNames.language}
                  {renderSortIndicator('language')}
                </TableHead>
              )}
              {columnVisibility.duration && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('duration')}
                >
                  {t.columnNames.duration}
                  {renderSortIndicator('duration')}
                </TableHead>
              )}
              {columnVisibility.firstResponse && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('firstResponse')}
                >
                  {t.columnNames.firstResponse}
                  {renderSortIndicator('firstResponse')}
                </TableHead>
              )}
              {columnVisibility.lastResponse && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('lastResponse')}
                >
                  {t.columnNames.lastResponse}
                  {renderSortIndicator('lastResponse')}
                </TableHead>
              )}
              {columnVisibility.bookmarked && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('bookmarked')}
                >
                  {t.columnNames.bookmarked}
                  {renderSortIndicator('bookmarked')}
                </TableHead>
              )}
              {columnVisibility.date && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('createdAt')}
                >
                  {t.columnNames.createdAt}
                  {renderSortIndicator('createdAt')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((transcript) => (
                <TableRow
                  key={transcript.transcriptNumber}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    segment === transcript.transcriptNumber.toString()
                      ? 'bg-gray-100 dark:bg-gray-800'
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
                  {columnVisibility.topic && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.transcriptNumber)}
                        onClick={(e) =>
                          handleTranscriptClick(e, transcript.transcriptNumber)
                        }
                        className='block w-full h-full p-4'
                      >
                        {transcript.topicTranslations
                          ? transcript.topicTranslations[language]
                          : transcript.topic || '-'}
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
                  {t.noResults}
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
