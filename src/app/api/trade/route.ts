import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, amount, btcPrice } = await request.json()
    
    if (!type || !amount || !btcPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current balances from cache (fast!)
    const { inrBalance: currentInrBalance, btcBalance: currentBtcBalance } = 
      await BalanceCache.getUserBalances(user.id)

    if (type === 'BUY') {
      // Amount is INR (already whole number from frontend)
      const inrTotal = Math.floor(amount) // Ensure whole number
      const usdInrRate = 91 // Buy rate
      const buyRate = btcPrice * usdInrRate
      const btcAmount = inrTotal / buyRate
      // Round to nearest satoshi (8 decimal places)
      const roundedBtcAmount = Math.round(btcAmount * 100000000) / 100000000

      // Use rounded balance for comparison
      const userBalance = Math.floor(currentInrBalance)
      
      if (userBalance < inrTotal) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }

      if (roundedBtcAmount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }

      // Calculate new balances
      const newInrBalance = currentInrBalance - inrTotal
      const newBtcBalance = currentBtcBalance + roundedBtcAmount

      // Create transaction in database
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type,
          btcAmount: roundedBtcAmount,
          btcPriceUsd: btcPrice,
          btcPriceInr: buyRate,
          usdInrRate: usdInrRate,
          inrAmount: inrTotal,
          inrBalanceAfter: newInrBalance,
          btcBalanceAfter: newBtcBalance,
          reason: `Bought ${roundedBtcAmount.toFixed(8)} BTC`
        }
      })

      // Immediately update Redis cache
      await BalanceCache.setUserBalances(user.id, newInrBalance, newBtcBalance)
      
      console.log(`💸 BUY: ${user.email} bought ₿${roundedBtcAmount.toFixed(8)} for ₹${inrTotal} | Cache updated`)

      return NextResponse.json({ message: 'Trade successful' })

    } else if (type === 'SELL') {
      // Amount is BTC amount
      const btcAmount = parseFloat(amount)
      // Round to nearest satoshi
      const roundedBtcAmount = Math.round(btcAmount * 100000000) / 100000000
      
      const availableBtc = currentBtcBalance
      
      // Use tolerance for floating point comparison (1 satoshi tolerance)
      const tolerance = 0.00000001
      
      if (availableBtc < roundedBtcAmount && Math.abs(availableBtc - roundedBtcAmount) > tolerance) {
        return NextResponse.json({ error: 'Insufficient Bitcoin' }, { status: 400 })
      }

      // If the difference is within tolerance, use the available amount
      const finalBtcAmount = Math.abs(availableBtc - roundedBtcAmount) <= tolerance ? availableBtc : roundedBtcAmount

      const usdInrRate = 88 // Sell rate
      const sellRate = btcPrice * usdInrRate
      const inrTotal = finalBtcAmount * sellRate
      // Round up to next whole INR (user gets rounded up amount)
      const roundedInrTotal = Math.ceil(inrTotal)

      // Calculate new balances
      const newInrBalance = currentInrBalance + roundedInrTotal
      const newBtcBalance = currentBtcBalance - finalBtcAmount

      // Create transaction in database
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type,
          btcAmount: finalBtcAmount,
          btcPriceUsd: btcPrice,
          btcPriceInr: sellRate,
          usdInrRate: usdInrRate,
          inrAmount: roundedInrTotal,
          inrBalanceAfter: newInrBalance,
          btcBalanceAfter: newBtcBalance,
          reason: `Sold ${finalBtcAmount.toFixed(8)} BTC`
        }
      })

      // Immediately update Redis cache
      await BalanceCache.setUserBalances(user.id, newInrBalance, newBtcBalance)
      
      console.log(`💰 SELL: ${user.email} sold ₿${finalBtcAmount.toFixed(8)} for ₹${roundedInrTotal} | Cache updated`)

      return NextResponse.json({ message: 'Trade successful' })

    } else {
      return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Trade error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: session.user.id,
        type: { in: ['BUY', 'SELL'] }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
