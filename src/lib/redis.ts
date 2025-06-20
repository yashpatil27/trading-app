import { createClient, RedisClientType } from 'redis'

class RedisClient {
  private static instance: RedisClient
  private client: RedisClientType | null = null
  private connecting = false

  private constructor() {}

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  private async connect(): Promise<RedisClientType> {
    if (this.client && this.client.isReady) {
      return this.client
    }

    if (this.connecting) {
      // Wait for existing connection attempt
      while (this.connecting) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.client!
    }

    try {
      this.connecting = true
      
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        }
      })

      this.client.on('error', (err) => {
        console.error('Redis connection error:', err)
      })

      this.client.on('connect', () => {
        console.log('🔗 Redis connected')
      })

      this.client.on('disconnect', () => {
        console.log('🔌 Redis disconnected')
      })

      await this.client.connect()
      this.connecting = false
      
      return this.client
    } catch (error) {
      this.connecting = false
      console.error('Failed to connect to Redis:', error)
      throw error
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const client = await this.connect()
      return await client.get(key)
    } catch (error) {
      console.error('Redis GET error:', error)
      return null // Fallback gracefully
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      const client = await this.connect()
      if (ttl) {
        await client.setEx(key, ttl, value)
      } else {
        await client.set(key, value)
      }
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false // Fallback gracefully
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.connect()
      await client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const client = await this.connect()
      return await client.mGet(keys)
    } catch (error) {
      console.error('Redis MGET error:', error)
      return keys.map(() => null) // Return nulls for all keys
    }
  }

  async mset(keyValues: { [key: string]: string }): Promise<boolean> {
    try {
      const client = await this.connect()
      await client.mSet(keyValues)
      return true
    } catch (error) {
      console.error('Redis MSET error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect()
      this.client = null
    }
  }
}

// Export singleton instance
export const redis = RedisClient.getInstance()
