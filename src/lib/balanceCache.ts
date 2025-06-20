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
        btcBalance: parseFloat(cachedBtcBalance),
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
    const btcBalance = latestTransaction?.btcBalanceAfter || 0

    // Store in cache for next time
    await this.setUserBalances(userId, inrBalance, btcBalance)

    return {
      inrBalance,
      btcBalance,
      fromCache: false
    }
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
      return parseFloat(cachedBalance)
    }

    // Fallback to full balance fetch
    const { btcBalance } = await this.getUserBalances(userId)
    return btcBalance
  }
}
