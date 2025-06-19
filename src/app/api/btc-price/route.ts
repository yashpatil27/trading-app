import { NextResponse } from 'next/server'
import PriceService from '@/services/priceService'

export async function GET() {
  try {
    const priceService = PriceService.getInstance()
    const currentPrice = priceService.getCurrentPrice()
    
    if (currentPrice) {
      return NextResponse.json(currentPrice)
    } else {
      // If service is still initializing, return fallback
      const fallbackPrice = 95000
      return NextResponse.json({
        btcUSD: fallbackPrice,
        buyRate: fallbackPrice * 91,
        sellRate: fallbackPrice * 88,
        timestamp: new Date().toISOString(),
        note: 'Service initializing, using fallback price'
      })
    }
  } catch (error) {
    console.error('Error in BTC price route:', error)
    
    const fallbackPrice = 95000
    return NextResponse.json({
      btcUSD: fallbackPrice,
      buyRate: fallbackPrice * 91,
      sellRate: fallbackPrice * 88,
      timestamp: new Date().toISOString(),
      note: 'Service error, using fallback price'
    })
  }
}
