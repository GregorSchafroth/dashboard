import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { neonConfig, neon } from '@neondatabase/serverless'

// Enable WebSocket pooling for better performance
neonConfig.webSocketConstructor = WebSocket
neonConfig.useSecureWebSocket = false // Set to true in production if your DATABASE_URL uses ssl
neonConfig.fetchConnectionCache = true

const sql = neon(process.env.DATABASE_URL!)

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
  '/unauthorized(.*)',
  '/error(.*)',
])

export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    try {
      // If it's a public route, don't protect it
      if (isPublicRoute(req)) {
        return
      }

      // For all other routes, first ensure user is authenticated
      await auth.protect()

      // Get the project slug from the URL
      const projectSlug = req.nextUrl.pathname.split('/')[1]
      if (!projectSlug) return

      // Get the authenticated userId
      const authObject = await auth()
      const userId = authObject.userId

      // If no userId is found, redirect to unauthorized
      if (!userId) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      try {
        // Get both user and project info in parallel using raw SQL
        const [userRows, projectRows] = await Promise.all([
          sql`
            SELECT role, "projectId" 
            FROM "User" 
            WHERE "clerkId" = ${userId}
            LIMIT 1
          `,
          sql`
            SELECT id 
            FROM "Project" 
            WHERE slug = ${projectSlug}
            LIMIT 1
          `,
        ])

        const user = userRows[0]
        const project = projectRows[0]

        // If project doesn't exist or user doesn't exist
        if (!project || !user) {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }

        // Allow access if user is ADMIN or if it's their assigned project
        if (user.role !== 'ADMIN' && user.projectId !== project.id) {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      } catch (error) {
        console.error('Database error:', error)
        return NextResponse.redirect(new URL('/error', req.url))
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/error', req.url))
    }
  },
  { debug: process.env.NODE_ENV === 'development' }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
