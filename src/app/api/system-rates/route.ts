import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { systemRatesService } from '@/lib/systemRates'

export async function GET() {
  try {
    const rates = await systemRatesService.getRates()
    return NextResponse.json(rates)
  } catch (error) {
    console.error('Error fetching system rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system rates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { usdInrBuyRate, usdInrSellRate } = data

    // Validate rates
    if (usdInrBuyRate && (isNaN(usdInrBuyRate) || usdInrBuyRate <= 0)) {
      return NextResponse.json(
        { error: 'Invalid buy rate' },
        { status: 400 }
      )
    }

    if (usdInrSellRate && (isNaN(usdInrSellRate) || usdInrSellRate <= 0)) {
      return NextResponse.json(
        { error: 'Invalid sell rate' },
        { status: 400 }
      )
    }

    // Get current rates
    const currentRates = await systemRatesService.getRates()
    
    // Update rates (use current rates if not provided)
    const newBuyRate = usdInrBuyRate || currentRates.usdInrBuyRate
    const newSellRate = usdInrSellRate || currentRates.usdInrSellRate

    // Validate that buy rate is less than sell rate
    if (newBuyRate >= newSellRate) {
      return NextResponse.json(
        { error: 'Buy rate must be less than sell rate' },
        { status: 400 }
      )
    }

    const updatedRates = await systemRatesService.updateRates(newBuyRate, newSellRate)
    
    return NextResponse.json(updatedRates)
  } catch (error) {
    console.error('Error updating system rates:', error)
    return NextResponse.json(
      { error: 'Failed to update system rates' },
      { status: 500 }
    )
  }
}
