// components/TranscriptList.tsx
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

type Transcript = {
  id: number
  transcriptNumber: number
  voiceflowTranscriptId: string
  name: string | null
  messageCount: number
  isComplete: boolean
  createdAt: string
}

type Props = {
  projectName: string
}

const TranscriptList = ({ projectName }: Props) => {
  const link = (id: number) => {
    // Convert spaces to dashes and make URL-friendly
    const urlProjectName = projectName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    return `/${urlProjectName}/transcripts/${id}`
  }
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [columnVisibility, setColumnVisibility] = useState({
    number: true,
    name: true,
    messages: true,
    status: true,
    date: true,
  })

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
    const matchesSearch =
      transcript.voiceflowTranscriptId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (transcript.name?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)

    const transcriptDate = new Date(transcript.createdAt)
    const matchesDate =
      !dateRange?.from ||
      !dateRange?.to ||
      (transcriptDate >= dateRange.from &&
        transcriptDate <= addDays(dateRange.to, 1))

    return matchesSearch && matchesDate
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className='w-full space-y-4 truncate'>
      <div className='flex gap-2 items-center justify-between'>
        <Input
          placeholder='Search transcripts...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='max-w-sm'
        />

        <div className='flex gap-2'>
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
                  setColumnVisibility((prev) => ({
                    ...prev,
                    number: checked,
                  }))
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
                checked={columnVisibility.status}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({ ...prev, status: checked }))
                }
              >
                Status
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
              {columnVisibility.messages && <TableHead>Messages</TableHead>}
              {columnVisibility.status && <TableHead>Status</TableHead>}
              {columnVisibility.date && <TableHead>Date</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((transcript) => (
                <TableRow
                  key={transcript.id}
                  className='cursor-pointer hover:bg-gray-50'
                >
                  {columnVisibility.number && (
                    <TableCell className='font-medium p-0'>
                      <Link
                        href={link(transcript.id)}
                        className='block w-full h-full p-4'
                      >
                        #{transcript.transcriptNumber}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.name && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.id)}
                        className='block w-full h-full p-4'
                      >
                        {transcript.name || 'Unnamed'}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.messages && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.id)}
                        className='block w-full h-full p-4'
                      >
                        {transcript.messageCount}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.status && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.id)}
                        className='block w-full h-full p-4'
                      >
                        {transcript.isComplete ? 'Complete' : 'In Progress'}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.date && (
                    <TableCell className='p-0'>
                      <Link
                        href={link(transcript.id)}
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
