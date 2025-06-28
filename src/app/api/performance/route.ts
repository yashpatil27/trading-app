import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PerformanceCalculator } from '@/lib/performanceCalculations'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current BTC price from the database or a simpler method
    let currentBtcPrice = 0
    try {
      // Try to get the latest BTC price from the database
      const latestPrice = await prisma.btcPrice.findFirst({
        orderBy: { createdAt: 'desc' }
      })
      
      if (latestPrice) {
        currentBtcPrice = (latestPrice.priceUsd || 0) * 88 // Use sell rate (88 USD/INR)
      }
    } catch (error) {
      console.log('Could not fetch BTC price from database, using fallback')
      currentBtcPrice = 9500000 // Fallback price
    }

    // Fetch all user transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        btcAmount: true,
        btcPriceInr: true,
        inrAmount: true,
        inrBalanceAfter: true,
        btcBalanceAfter: true,
        createdAt: true
      }
    })

    // Convert to the format expected by PerformanceCalculator
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      type: t.type as any,
      btcAmount: t.btcAmount,
      btcPriceInr: t.btcPriceInr,
      inrAmount: t.inrAmount,
      inrBalanceAfter: t.inrBalanceAfter,
      btcBalanceAfter: t.btcBalanceAfter,
      createdAt: t.createdAt.toISOString()
    }))

    // Calculate performance metrics
    const calculator = new PerformanceCalculator(formattedTransactions, currentBtcPrice)
    const metrics = calculator.calculateMetrics()

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error calculating performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate performance metrics' },
      { status: 500 }
    )
  }
}
