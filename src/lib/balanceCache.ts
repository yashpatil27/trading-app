import { redis } from './redis'
import { prisma } from './prisma'

export class BalanceCache {
  private static readonly INR_BALANCE_PREFIX = 'balance:inr:'
  private static readonly BTC_BALANCE_PREFIX = 'balance:btc:'
  private static readonly CACHE_TTL = 3600 // 1 hour

  /**
   * Get user balances (INR and BTC) with Redis caching
   */
  static async getUserBalances(userId: string): Promise<{
    inrBalance: number
    btcBalance: number
    fromCache: boolean
  }> {
    const keys = [
      this.INR_BALANCE_PREFIX + userId,
      this.BTC_BALANCE_PREFIX + userId
    ]

    // Try to get both balances from Redis
    const [cachedInrBalance, cachedBtcBalance] = await redis.mget(keys)

    if (cachedInrBalance !== null && cachedBtcBalance !== null) {
      // Cache hit - return cached values
      return {
        inrBalance: parseFloat(cachedInrBalance),
        btcBalance: Number(cachedBtcBalance),
        fromCache: true
      }
    }

    // Cache miss - fetch from database
    const latestTransaction = await prisma.transaction.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        inrBalanceAfter: true,
        btcBalanceAfter: true
      }
    })

    const inrBalance = latestTransaction?.inrBalanceAfter || 0
    const btcBalance = Number(latestTransaction?.btcBalanceAfter) || 0

    // Store in cache for next time
    await this.setUserBalances(userId, inrBalance, btcBalance)

    return {
      inrBalance,
      btcBalance,
      fromCache: false
    }
  }

  /**
   * Get balances for multiple users efficiently (bulk operation)
   * Fixes N+1 query by fetching all balances in a single operation
   */
  static async getBulkUserBalances(userIds: string[]): Promise<Map<string, {
    inrBalance: number
    btcBalance: number
    fromCache: boolean
  }>> {
    if (userIds.length === 0) return new Map()

    const result = new Map<string, { inrBalance: number; btcBalance: number; fromCache: boolean }>()
    
    // Build all cache keys for bulk Redis lookup
    const cacheKeys: string[] = []
    
    userIds.forEach(userId => {
      cacheKeys.push(this.INR_BALANCE_PREFIX + userId)
      cacheKeys.push(this.BTC_BALANCE_PREFIX + userId)
    })

    // Bulk fetch from Redis
    const cachedValues = await redis.mget(cacheKeys)
    
    const cacheMisses: string[] = []
    
    // Process cached results
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i]
      const inrValue = cachedValues[i * 2]     // INR balance
      const btcValue = cachedValues[i * 2 + 1] // BTC balance
      
      if (inrValue !== null && btcValue !== null) {
        // Cache hit
        result.set(userId, {
          inrBalance: parseFloat(inrValue),
          btcBalance: Number(btcValue),
          fromCache: true
        })
      } else {
        // Cache miss - need to fetch from database
        cacheMisses.push(userId)
      }
    }

    // Bulk fetch cache misses from database
    if (cacheMisses.length > 0) {
      // Use a more compatible query approach
      const latestTransactions = await prisma.transaction.findMany({
        where: {
          userId: { in: cacheMisses }
        },
        select: {
          userId: true,
          inrBalanceAfter: true,
          btcBalanceAfter: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Get the latest transaction for each user
      const latestByUser = new Map<string, typeof latestTransactions[0]>()
      latestTransactions.forEach(tx => {
        if (!latestByUser.has(tx.userId)) {
          latestByUser.set(tx.userId, tx)
        }
      })

      // Update results and cache for cache misses
      const cacheUpdates: Promise<void>[] = []
      
      for (const userId of cacheMisses) {
        const transaction = latestByUser.get(userId)
        const inrBalance = transaction?.inrBalanceAfter || 0
        const btcBalance = Number(transaction?.btcBalanceAfter) || 0

        result.set(userId, {
          inrBalance,
          btcBalance,
          fromCache: false
        })

        // Cache the result for future requests
        cacheUpdates.push(this.setUserBalances(userId, inrBalance, btcBalance))
      }

      // Update cache in parallel
      await Promise.all(cacheUpdates)
    }

    return result
  }

  /**
   * Update user balances in Redis cache
   */
  static async setUserBalances(
    userId: string, 
    inrBalance: number, 
    btcBalance: number
  ): Promise<void> {
    const keyValues = {
      [this.INR_BALANCE_PREFIX + userId]: inrBalance.toString(),
      [this.BTC_BALANCE_PREFIX + userId]: btcBalance.toString()
    }

    await redis.mset(keyValues)
    
    // Optionally set TTL on individual keys
    await redis.set(this.INR_BALANCE_PREFIX + userId, inrBalance.toString(), this.CACHE_TTL)
    await redis.set(this.BTC_BALANCE_PREFIX + userId, btcBalance.toString(), this.CACHE_TTL)
  }

  /**
   * Invalidate user balance cache
   */
  static async invalidateUserBalances(userId: string): Promise<void> {
    await redis.del(this.INR_BALANCE_PREFIX + userId)
    await redis.del(this.BTC_BALANCE_PREFIX + userId)
  }

  /**
   * Warm cache for multiple users (useful for active users)
   */
  static async warmUserCaches(userIds: string[]): Promise<void> {
    const promises = userIds.map(userId => this.getUserBalances(userId))
    await Promise.all(promises)
    console.log(`🔥 Warmed cache for ${userIds.length} users`)
  }

  /**
   * Get INR balance only
   */
  static async getInrBalance(userId: string): Promise<number> {
    const cachedBalance = await redis.get(this.INR_BALANCE_PREFIX + userId)
    
    if (cachedBalance !== null) {
      return parseFloat(cachedBalance)
    }

    // Fallback to full balance fetch
    const { inrBalance } = await this.getUserBalances(userId)
    return inrBalance
  }

  /**
   * Get BTC balance only
   */
  static async getBtcBalance(userId: string): Promise<number> {
    const cachedBalance = await redis.get(this.BTC_BALANCE_PREFIX + userId)
    
    if (cachedBalance !== null) {
      return Number(cachedBalance)
    }

    // Fallback to full balance fetch
    const { btcBalance } = await this.getUserBalances(userId)
    return btcBalance
  }
}
