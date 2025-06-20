import PriceService from '@/services/priceService'
import { BalanceCache } from './balanceCache'
import { prisma } from './prisma'

// Initialize the price service when the app starts
let servicesInitialized = false

export async function initializeServices() {
  if (!servicesInitialized) {
    // Initialize price service
    PriceService.getInstance()
    
    // Warm Redis cache for all users
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true }
      })
      
      const userIds = users.map(user => user.id)
      await BalanceCache.warmUserCaches(userIds)
      
      console.log(`🚀 Application services initialized`)
      console.log(`🔥 Cache warmed for ${users.length} users`)
    } catch (error) {
      console.error('Error warming cache:', error)
    }
    
    servicesInitialized = true
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  initializeServices()
}
