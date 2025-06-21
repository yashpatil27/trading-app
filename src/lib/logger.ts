type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  
  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    }

    // Only log in development or for errors/warnings in production
    if (this.isDevelopment || level === 'error' || level === 'warn') {
      const emoji = this.getEmoji(level)
      const formatted = `${emoji} [${level.toUpperCase()}] ${message}`
      
      if (data) {
        console.log(formatted, data)
      } else {
        console.log(formatted)
      }
    }

    // In production, you might want to send logs to a service like Sentry
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      // TODO: Send to external logging service
    }
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🐛'
      case 'info': return 'ℹ️'
      case 'warn': return '⚠️'
      case 'error': return '🔴'
      default: return ''
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  // Specific methods for common patterns
  apiCall(method: string, endpoint: string, status: number, duration?: number) {
    const emoji = status >= 400 ? '🔴' : status >= 300 ? '🟡' : '🟢'
    this.info(`${emoji} ${method} ${endpoint} ${status}${duration ? ` in ${duration}ms` : ''}`)
  }

  userAction(action: string, userId?: string, details?: any) {
    this.info(`👤 User Action: ${action}${userId ? ` (${userId})` : ''}`, details)
  }

  dbOperation(operation: string, table: string, details?: any) {
    this.debug(`💾 DB ${operation}: ${table}`, details)
  }

  cacheOperation(operation: string, key: string, hit?: boolean) {
    const emoji = hit === true ? '⚡' : hit === false ? '💾' : '🔄'
    this.debug(`${emoji} Cache ${operation}: ${key}`)
  }
}

export const logger = new Logger()
