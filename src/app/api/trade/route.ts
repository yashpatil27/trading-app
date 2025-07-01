import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, TransactionType } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'
import { 
  btcToSatoshi, 
  satoshiToBtc, 
  inrToInt, 
  usdToInt,
  usdInrRateToInt,
  createDualModeTransactionData,
  SATOSHI_PER_BTC
} from '@/lib/currencyUtils'

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

    // Convert to precise integer values for calculations
    const currentInrSatoshi = inrToInt(currentInrBalance)
    const currentBtcSatoshi = btcToSatoshi(currentBtcBalance)
    const btcPriceInt = usdToInt(btcPrice)

    if (type === TransactionType.BUY) {
      // Amount is INR (whole rupees)
      const inrTotalInt = inrToInt(amount)
      const usdInrRateInt = usdInrRateToInt(91) // Buy rate 91.00 → 9100
      
      // Calculate BTC amount in satoshis using integer math
      // inrTotal = btcSatoshi * btcPriceUsd * usdInrRate / (SATOSHI_PER_BTC * 100)
      // btcSatoshi = inrTotal * SATOSHI_PER_BTC * 100 / (btcPriceUsd * usdInrRate)
      const btcSatoshi = BigInt(Math.floor(
        (inrTotalInt * Number(SATOSHI_PER_BTC) * 100) / (btcPriceInt * usdInrRateInt)
      ))

      if (currentInrSatoshi < inrTotalInt) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }

      if (btcSatoshi <= 0n) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }

      // Calculate new balances using integer arithmetic
      const newInrBalanceInt = currentInrSatoshi - inrTotalInt
      const newBtcSatoshi = currentBtcSatoshi + btcSatoshi

      // Convert back to decimals for compatibility
      const btcAmountDecimal = satoshiToBtc(btcSatoshi)
      const buyRateDecimal = (btcPriceInt * usdInrRateInt) / 100

      // Create transaction with dual-mode data
      const transactionData = createDualModeTransactionData({
        btcAmount: btcAmountDecimal,
        btcPriceUsd: btcPrice,
        btcPriceInr: buyRateDecimal,
        usdInrRate: 91,
        inrAmount: inrTotalInt,
        inrBalanceAfter: newInrBalanceInt,
        btcBalanceAfter: satoshiToBtc(newBtcSatoshi)
      })

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type,
          ...transactionData,
          reason: `Bought ${btcAmountDecimal.toFixed(8)} BTC`
        }
      })

      // Update cache with new balances
      await BalanceCache.setUserBalances(user.id, newInrBalanceInt, satoshiToBtc(newBtcSatoshi))
      
      console.log(`💸 BUY: ${user.email} bought ₿${btcAmountDecimal.toFixed(8)} for ₹${inrTotalInt} | Precise integer math`)

      return NextResponse.json({ 
        message: 'Trade successful',
        btcAmount: btcAmountDecimal,
        inrAmount: inrTotalInt,
        precision: 'integer'
      })

    } else if (type === TransactionType.SELL) {
      // Amount is BTC amount - convert to satoshis for precise calculation
      const btcAmountDecimal = parseFloat(amount)
      const btcSatoshi = btcToSatoshi(btcAmountDecimal)
      
      if (currentBtcSatoshi < btcSatoshi) {
        // Check if difference is within 1 satoshi tolerance
        const tolerance = 1n
        if (currentBtcSatoshi + tolerance >= btcSatoshi) {
          // Use available amount (within tolerance)
          const actualBtcSatoshi = currentBtcSatoshi
        } else {
          return NextResponse.json({ error: 'Insufficient Bitcoin' }, { status: 400 })
        }
      }

      const actualBtcSatoshi = btcSatoshi > currentBtcSatoshi ? currentBtcSatoshi : btcSatoshi
      const usdInrRateInt = usdInrRateToInt(88) // Sell rate 88.00 → 8800
      
      // Calculate INR amount using integer math
      // inrTotal = btcSatoshi * btcPriceUsd * usdInrRate / (SATOSHI_PER_BTC * 100)
      const inrTotalRaw = (Number(actualBtcSatoshi) * btcPriceInt * usdInrRateInt) / (Number(SATOSHI_PER_BTC) * 100)
      const inrTotalInt = Math.ceil(inrTotalRaw) // Round up in user's favor

      // Calculate new balances
      const newInrBalanceInt = currentInrSatoshi + inrTotalInt
      const newBtcSatoshi = currentBtcSatoshi - actualBtcSatoshi

      // Convert for compatibility
      const actualBtcDecimal = satoshiToBtc(actualBtcSatoshi)
      const sellRateDecimal = (btcPriceInt * usdInrRateInt) / 100

      // Create transaction with dual-mode data
      const transactionData = createDualModeTransactionData({
        btcAmount: actualBtcDecimal,
        btcPriceUsd: btcPrice,
        btcPriceInr: sellRateDecimal,
        usdInrRate: 88,
        inrAmount: inrTotalInt,
        inrBalanceAfter: newInrBalanceInt,
        btcBalanceAfter: satoshiToBtc(newBtcSatoshi)
      })

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type,
          ...transactionData,
          reason: `Sold ${actualBtcDecimal.toFixed(8)} BTC`
        }
      })

      // Update cache with new balances
      await BalanceCache.setUserBalances(user.id, newInrBalanceInt, satoshiToBtc(newBtcSatoshi))
      
      console.log(`💰 SELL: ${user.email} sold ₿${actualBtcDecimal.toFixed(8)} for ₹${inrTotalInt} | Precise integer math`)

      return NextResponse.json({ 
        message: 'Trade successful',
        btcAmount: actualBtcDecimal,
        inrAmount: inrTotalInt,
        precision: 'integer'
      })

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
        type: { in: [TransactionType.BUY, TransactionType.SELL] }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        createdAt: true,
        reason: true,
        // Prefer integer fields when available
        btcAmountSatoshi: true,
        btcAmount: true,
        inrAmountInt: true,
        inrAmount: true,
        btcPriceUsdInt: true,
        btcPriceUsd: true
      }
    })

    // Transform to use integer fields primarily
    const transformedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      createdAt: tx.createdAt,
      reason: tx.reason,
      btcAmount: tx.btcAmountSatoshi ? satoshiToBtc(tx.btcAmountSatoshi) : (tx.btcAmount || 0),
      inrAmount: tx.inrAmountInt || tx.inrAmount || 0,
      btcPriceUsd: tx.btcPriceUsdInt || tx.btcPriceUsd || 0,
      usingIntegers: !!(tx.btcAmountSatoshi && tx.inrAmountInt)
    }))

    return NextResponse.json(transformedTransactions)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
