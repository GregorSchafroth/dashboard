// src/app/api/webhooks/clerk/route.ts

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Logger } from '@/utils/debug'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error(
      '⚠️ Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }
  // Get the headers
  const headerPayload = headers()
  Logger.prisma(
    '📨 Received webhook request headers:',
    Object.fromEntries((await headerPayload).entries())
  )

  const svix_id = (await headerPayload).get('svix-id')
  const svix_timestamp = (await headerPayload).get('svix-timestamp')
  const svix_signature = (await headerPayload).get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    Logger.prisma('❌ Missing svix headers')
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // get the raw body
  const rawBody = await req.text()
  Logger.prisma('📦 Raw webhook body:', rawBody)

  let payload
  try {
    payload = JSON.parse(rawBody)
    Logger.prisma('📦 Parsed webhook payload:', payload)
  } catch (error) {
    console.error('❌ Error parsing JSON:', error)
    return new Response('Error parsing request body', {
      status: 400,
    })
  }

  if (!payload) {
    console.error('❌ Request body is null or empty')
    return new Response('Request body is required', {
      status: 400,
    })
  }

  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)
  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('❌ Error verifying webhook:', err)
    return new Response('❌ Error occured', {
      status: 400,
    })
  }

  // Handle different webhook events
  try {
    switch (evt.type) {
      case 'user.created':
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: evt.data.id },
        })

        if (existingUser) {
          Logger.prisma('ℹ️ User already exists:', evt.data.id)
          return new Response('User already exists', { status: 200 })
        }

        await prisma.user.create({
          data: {
            clerkId: evt.data.id,
            email: evt.data.email_addresses[0].email_address,
          },
        })
        Logger.prisma(`✨ User created: ${evt.data.id}`)
        break

      case 'user.deleted':
        const userToDelete = await prisma.user.findUnique({
          where: { clerkId: evt.data.id },
        })

        if (!userToDelete) {
          Logger.prisma('ℹ️ User not found for deletion:', evt.data.id)
          return new Response('User not found', { status: 200 }) // Still return 200 as it's not an error
        }

        await prisma.user.delete({
          where: {
            clerkId: evt.data.id,
          },
        })
        Logger.prisma(`🗑️ User deleted: ${evt.data.id}`)
        break

      default:
        Logger.prisma(`Unhandled webhook event type: ${evt.type}`)
    }

    return new Response('✅ Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new Response('❌ Error processing webhook', { status: 500 })
  }
}
