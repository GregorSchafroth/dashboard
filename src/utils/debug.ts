// src/utils/debug.ts
type DebugCategory = 'api' | 'prisma' | 'components' | 'auth'

const debugCategories: Record<DebugCategory, boolean> = {
  api: process.env.DEBUG_API === 'true',
  prisma: process.env.DEBUG_PRISMA === 'true',
  components: process.env.DEBUG_COMPONENTS === 'true',
  auth: process.env.DEBUG_AUTH === 'true',
}

export const debugLog = (category: DebugCategory, ...args: unknown[]) => {
  if (debugCategories[category]) {
    console.log(`[${category.toUpperCase()}]`, ...args)
  }
}