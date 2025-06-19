import { prisma } from '@/lib/prisma'
import cron from 'node-cron'

interface PriceData {
  btcUSD: number
  buyRate: number
  sellRate: number
  timestamp: string
}

class PriceService {
  private static instance: PriceService
  private currentPrice: PriceData | null = null
  private subscribers: Set<(price: PriceData) => void> = new Set()
  private cronJob: any = null

  private constructor() {
    this.initializePriceService()
  }

  public static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService()
    }
    return PriceService.instance
  }

  private async initializePriceService() {
    // Fetch initial price
    await this.fetchAndUpdatePrice()
    
    // Set up cron job to fetch price every 30 seconds
    this.cronJob = cron.schedule('*/30 * * * * *', async () => {
      await this.fetchAndUpdatePrice()
    })

    console.log('🚀 Price service initialized - fetching Bitcoin prices every 30 seconds')
  }

  private async fetchAndUpdatePrice(): Promise<void> {
    try {
      let btcPrice = 95000 // Fallback price
      
      try {
        // Try primary API
        const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC', {
          signal: AbortSignal.timeout(5000)
        })
        
        if (response.ok) {
          const data = await response.json()
          btcPrice = parseFloat(data.data.rates.USD)
        }
      } catch (apiError) {
        console.log('Primary API failed, trying alternative...')
        
        try {
          // Try alternative API
          const altResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
            signal: AbortSignal.timeout(3000)
          })
          
          if (altResponse.ok) {
            const altData = await altResponse.json()
            btcPrice = altData.bitcoin.usd
          }
        } catch (altError) {
          // Get last known price from database
          const lastPrice = await prisma.btcPrice.findFirst({
            orderBy: { createdAt: 'desc' }
          })
          
          if (lastPrice) {
            btcPrice = lastPrice.price
          }
        }
      }

      // Store in database
      await prisma.btcPrice.create({
        data: { price: btcPrice }
      })

      // Update current price
      this.currentPrice = {
        btcUSD: btcPrice,
        buyRate: btcPrice * 91,
        sellRate: btcPrice * 88,
        timestamp: new Date().toISOString()
      }

      // Notify all subscribers
      this.notifySubscribers(this.currentPrice)

    } catch (error) {
      console.error('Error updating Bitcoin price:', error)
    }
  }

  public getCurrentPrice(): PriceData | null {
    return this.currentPrice
  }

  public subscribe(callback: (price: PriceData) => void): () => void {
    this.subscribers.add(callback)
    
    // Send current price immediately if available
    if (this.currentPrice) {
      callback(this.currentPrice)
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notifySubscribers(price: PriceData): void {
    this.subscribers.forEach(callback => {
      try {
        callback(price)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  public destroy(): void {
    if (this.cronJob) {
      this.cronJob.destroy()
    }
    this.subscribers.clear()
  }
}

export default PriceService
