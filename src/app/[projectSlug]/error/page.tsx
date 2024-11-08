"use client"

import ErrorPage from '@/components/ErrorPage'

export default function ProjectErrorPage() {
  return (
    <ErrorPage 
      title="Oops! Something went wrong."
      description="We're sorry, but something didn't work as expected. Please try refreshing the page or come back later. If the problem persists, please contact an administrator."
    />
  )
}