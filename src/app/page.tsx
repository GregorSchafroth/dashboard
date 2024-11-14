// src/app/page.tsx

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { slugify } from '@/lib/utils'
import { Logger } from '@/utils/debug'
import NoProject from './components/NoProject'

async function getProjectForUser(clerkId: string) {
  Logger.auth('Searching for user with clerkId:', clerkId)
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      project: true,
    },
  })
  Logger.prisma('Found user:', user)
  return user?.project
}

export default async function HomePage() {
  const user = await currentUser()
  Logger.auth('Current user from Clerk:', user?.id)

  if (!user) {
    Logger.auth('No user found, redirecting to sign-in')
    redirect('/sign-in')
  }

  const project = await getProjectForUser(user.id)
  Logger.prisma('Found project:', project)

  if (!project) {
    Logger.components('No project found for user')
    return (
      <div className='flex flex-1 items-center justify-center'>
        <h1 className='text-3xl'>
          <NoProject />
        </h1>
      </div>
    )
  }

  const projectSlug = slugify(project.name)
  Logger.components('Generated project slug:', projectSlug)
  Logger.components('Redirecting to:', `/${projectSlug}`)

  // Force the redirect to be more immediate
  return redirect(`/${projectSlug}`)
}
