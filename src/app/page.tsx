// src/app/page.tsx
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

async function getProjectForUser(clerkId: string) {
  console.log('Searching for user with clerkId:', clerkId)
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      project: true,
    },
  })
  console.log('Found user:', user)
  return user?.project
}

export default async function HomePage() {
  const user = await currentUser()
  console.log('Current user from Clerk:', user?.id)

  if (!user) {
    console.log('No user found, redirecting to sign-in')
    redirect('/sign-in')
  }

  const project = await getProjectForUser(user.id)
  console.log('Found project:', project)

  if (!project) {
    console.log('No project found for user')
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <h1 className='text-3xl'>
          No project assigned. Please contact an administrator.
        </h1>
      </div>
    )
  }

  const projectSlug = project.name.toLowerCase().replace(/\s+/g, '-')
  console.log('Generated project slug:', projectSlug)
  console.log('Redirecting to:', `/${projectSlug}`)
  
  // Force the redirect to be more immediate
  return redirect(`/${projectSlug}`)
}