import { NextResponse } from 'next/server'
import PriceService from '@/services/priceService'
import { intToUsd } from '@/lib/currencyUtils'

export async function GET() {
  try {
    const priceService = PriceService.getInstance()
    const currentPrice = priceService.getCurrentPrice()

    if (!currentPrice) {
      return NextResponse.json({ error: 'Price not available' }, { status: 503 })
    }

    // Return both float and integer representations
    return NextResponse.json({
      // Original float format (for compatibility)
      btcUSD: currentPrice.btcUSD,
      buyRate: currentPrice.btcUSD * 91,
      sellRate: currentPrice.btcUSD * 88,
      
      // New integer format (for precision)
      btcUSDInt: currentPrice.btcUSDInt,
      buyRateInt: currentPrice.btcUSDInt * 91,
      sellRateInt: currentPrice.btcUSDInt * 88,
      
      timestamp: currentPrice.timestamp,
      precision: 'dual-mode'
    })
  } catch (error) {
    console.error('Error fetching BTC price:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
