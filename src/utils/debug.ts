// src/utils/debug.ts
type LogData = 
  | Record<string, unknown> 
  | string 
  | number 
  | boolean 
  | Array<unknown>
  | Error
  | unknown 
  | null
  | undefined


type DebugCategory = 'api' | 'prisma' | 'components' | 'auth'

interface CategoryConfig {
  enabled: boolean
  emoji: string
}

const debugCategories: Record<DebugCategory, CategoryConfig> = {
  api: { enabled: process.env.DEBUG_API === 'true', emoji: '🔌' },
  prisma: { enabled: process.env.DEBUG_PRISMA === 'true', emoji: '🔋' },
  components: { enabled: process.env.DEBUG_COMPONENTS === 'true', emoji: '🧩' },
  auth: { enabled: process.env.DEBUG_AUTH === 'true', emoji: '🔑' },
}

export class Logger {
  private static formatTime(): string {
    return new Date().toISOString().split('T')[1].split('.')[0]
  }

  private static formatData(data?: LogData): string {
    if (data == null) return ''
    
    if (data instanceof Error) {
      return ` | ${data.name}: ${data.message}`
    }
    
    if (Array.isArray(data)) {
      return ' | [' + data.join(', ') + ']'
    }
    
    if (typeof data === 'object') {
      try {
        return ' | ' + JSON.stringify(data, null, 0).replace(/\s+/g, ' ')
      } catch {
        return ' | [Object]' 
      }
    }
    
    return ' | ' + String(data)
  }

  private static formatDuration(ms: number): string {
    return `${ms}ms`
  }

  private static log(prefix: string, message: string, data?: LogData) {
    console.log(
      `[${this.formatTime()}] ${prefix} ${message}${this.formatData(data)}`
    )
  }

  static category(category: DebugCategory, message: string, data?: LogData) {
    const config = debugCategories[category]
    if (config.enabled) {
      this.log(config.emoji, message, data)
    }
  }

  static sectionStart(name: string) {
    if (process.env.DEBUG_API === 'true') {
      this.log('▶️ ', name)
    }
  }

  static sectionEnd(name: string, startTime: number) {
    if (process.env.DEBUG_API === 'true') {
      const duration = Date.now() - startTime
      this.log('✅', `${name} completed in ${this.formatDuration(duration)}`)
    }
  }

  static progress(message: string) {
    if (process.env.DEBUG_API === 'true') {
      this.log('→', message)
    }
  }

  static error(message: string, error: unknown) {
    const time = this.formatTime()
    console.error(`[${time}] ❌ ${message}`)
    
    if (error instanceof Error) {
      console.error(`[${time}] └─ ${error.message}`)
      if (error.stack && process.env.DEBUG_API === 'true') {
        const stackLines = error.stack.split('\n').slice(1)
        console.error(`[${time}] └─ ${stackLines[0].trim()}`)
      }
    } else {
      console.error(`[${time}] └─ Unknown error:`, error)
    }
  }

  static api(message: string, data?: LogData) {
    this.category('api', message, data)
  }

  static prisma(message: string, data?: LogData) {
    this.category('prisma', message, data)
  }

  static components(message: string, data?: LogData) {
    this.category('components', message, data)
  }

  static auth(message: string, data?: LogData) {
    this.category('auth', message, data)
  }
}