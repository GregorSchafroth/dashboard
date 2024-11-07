// src/app/page.tsx

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'
import { debugLog } from '@/utils/debug'


async function getProjectForUser(clerkId: string) {
  debugLog('auth', 'Searching for user with clerkId:', clerkId)
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      project: true,
    },
  })
  debugLog('prisma', 'Found user:', user)
  return user?.project
}

export default async function HomePage() {
  const user = await currentUser()
  debugLog('auth', 'Current user from Clerk:', user?.id)

  if (!user) {
    debugLog('auth', 'No user found, redirecting to sign-in')
    redirect('/sign-in')
  }

  const project = await getProjectForUser(user.id)
  debugLog('prisma', 'Found project:', project)

  if (!project) {
    debugLog('components', 'No project found for user')
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <h1 className='text-3xl'>
          No project assigned. Please contact an administrator.
        </h1>
      </div>
    )
  }

  const projectSlug = slugify(project.name)
  debugLog('components', 'Generated project slug:', projectSlug)
  debugLog('components', 'Redirecting to:', `/${projectSlug}`)
  
  // Force the redirect to be more immediate
  return redirect(`/${projectSlug}`)
}