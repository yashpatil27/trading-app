import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      where: { id: session.user.id },
      include: { holding: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (type === 'BUY') {
      // Amount is INR (already whole number from frontend)
      const inrTotal = Math.floor(amount) // Ensure whole number
      const buyRate = btcPrice * 91
      const btcAmount = inrTotal / buyRate
      // Round to nearest satoshi (8 decimal places)
      const roundedBtcAmount = Math.round(btcAmount * 100000000) / 100000000

      // Use rounded balance for comparison
      const userBalance = Math.floor(user.balance)
      
      if (userBalance < inrTotal) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }

      if (roundedBtcAmount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }

      await prisma.trade.create({
        data: {
          userId: user.id,
          type,
          amount: roundedBtcAmount,
          price: buyRate,
          total: inrTotal,
          btcPrice
        }
      })

      // Update balance with exact INR amount
      const newBalance = user.balance - inrTotal

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: newBalance }
      })

      await prisma.balanceHistory.create({
        data: {
          userId: user.id,
          type: 'TRADE_BUY',
          amount: -inrTotal,
          balance: newBalance,
          reason: `Bought ${roundedBtcAmount.toFixed(8)} BTC`
        }
      })

      if (user.holding) {
        await prisma.userHolding.update({
          where: { userId: user.id },
          data: { btcAmount: user.holding.btcAmount + roundedBtcAmount }
        })
      } else {
        await prisma.userHolding.create({
          data: {
            userId: user.id,
            btcAmount: roundedBtcAmount
          }
        })
      }

      return NextResponse.json({ message: 'Trade successful' })

    } else if (type === 'SELL') {
      // Amount is BTC amount
      const btcAmount = parseFloat(amount)
      // Round to nearest satoshi
      const roundedBtcAmount = Math.round(btcAmount * 100000000) / 100000000
      
      const availableBtc = user.holding?.btcAmount || 0
      
      // Use tolerance for floating point comparison (1 satoshi tolerance)
      const tolerance = 0.00000001
      
      if (!user.holding || (availableBtc < roundedBtcAmount && Math.abs(availableBtc - roundedBtcAmount) > tolerance)) {
        return NextResponse.json({ error: 'Insufficient Bitcoin' }, { status: 400 })
      }

      // If the difference is within tolerance, use the available amount
      const finalBtcAmount = Math.abs(availableBtc - roundedBtcAmount) <= tolerance ? availableBtc : roundedBtcAmount

      const sellRate = btcPrice * 88
      const inrTotal = finalBtcAmount * sellRate
      // Round up to next whole INR (user gets rounded up amount)
      const roundedInrTotal = Math.ceil(inrTotal)

      await prisma.trade.create({
        data: {
          userId: user.id,
          type,
          amount: finalBtcAmount,
          price: sellRate,
          total: roundedInrTotal,
          btcPrice
        }
      })

      // Add rounded up INR amount to balance
      const newBalance = user.balance + roundedInrTotal

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: newBalance }
      })

      await prisma.balanceHistory.create({
        data: {
          userId: user.id,
          type: 'TRADE_SELL',
          amount: roundedInrTotal,
          balance: newBalance,
          reason: `Sold ${finalBtcAmount.toFixed(8)} BTC`
        }
      })

      await prisma.userHolding.update({
        where: { userId: user.id },
        data: { btcAmount: availableBtc - finalBtcAmount }
      })

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

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
