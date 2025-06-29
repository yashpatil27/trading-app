import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'
import { createCompleteTransactionData, satoshiToBtc, btcToSatoshi } from '@/lib/currencyUtils'
import PriceService from '@/services/priceService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, amount, reason, type, currency = 'INR' } = await request.json()
    
    if (!userId || amount === undefined || !type || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current balances from cache/latest transaction
    const { inrBalance: currentInrBalance, btcBalance: currentBtcBalance } = 
      await BalanceCache.getUserBalances(userId)

    let newInrBalance = currentInrBalance
    let newBtcBalance = currentBtcBalance
    let transactionType: string
    let transactionAmount: number
    let transactionData: any

    if (currency === 'INR') {
      // INR balance adjustment
      const adjustmentAmount = type === 'CREDIT' ? amount : -amount
      newInrBalance = currentInrBalance + adjustmentAmount
      
      if (newInrBalance < 0) {
        return NextResponse.json({ error: 'Insufficient INR balance' }, { status: 400 })
      }
      
      transactionType = type === 'CREDIT' ? 'DEPOSIT' : 'WITHDRAWAL'
      transactionAmount = Math.abs(amount)

      // Create standard transaction for INR
      transactionData = createCompleteTransactionData({
        userId,
        type: transactionType as any,
        inrAmount: transactionAmount,
        btcAmount: 0,
        inrBalanceAfter: newInrBalance,
        btcBalanceAfter: newBtcBalance,
        reason: reason || (type === "CREDIT" ? "Cash Deposit" : "Cash Withdrawal")
      })

    } else if (currency === 'BTC') {
      // Bitcoin balance adjustment
      const adjustmentAmount = type === 'CREDIT' ? amount : -amount
      newBtcBalance = currentBtcBalance + adjustmentAmount
      
      if (newBtcBalance < 0) {
        return NextResponse.json({ error: 'Insufficient Bitcoin balance' }, { status: 400 })
      }
      
      transactionAmount = Math.abs(amount)

      if (type === 'CREDIT') {
        // BTC CREDIT: Record as BUY transaction at sell rate for proper cost basis
        const priceService = PriceService.getInstance()
        const currentPrice = priceService.getCurrentPrice()
        
        if (!currentPrice) {
          return NextResponse.json({ error: 'Bitcoin price not available' }, { status: 503 })
        }

        // Calculate sell rate (user gets this rate when selling)
        const sellRateInr = currentPrice.btcUSD * 88
        const inrEquivalent = Math.round(transactionAmount * sellRateInr)
        
        // Record as BUY transaction at sell rate
        transactionData = createCompleteTransactionData({
          userId,
          type: 'DEPOSIT_BTC', // This makes it part of FIFO cost basis calculations
          btcAmount: transactionAmount,
          btcPriceUsd: currentPrice.btcUSD,
          btcPriceInr: sellRateInr,
          usdInrRate: 88, // Use sell rate
          inrAmount: inrEquivalent, // INR equivalent counts toward initial investment
          inrBalanceAfter: newInrBalance,
          btcBalanceAfter: newBtcBalance,
          reason: reason || "BTC Deposit"
        })

        console.log(`💰 Admin BTC Credit: Recording as DEPOSIT_BTC at sell rate ₹${sellRateInr.toFixed(2)}/BTC for cost basis`)

      } else {
        // BTC DEBIT: Record as standard withdrawal
        transactionType = 'WITHDRAWAL'
        
        transactionData = createCompleteTransactionData({
          userId,
          type: transactionType as any,
          inrAmount: 0,
          btcAmount: transactionAmount,
          inrBalanceAfter: newInrBalance,
          btcBalanceAfter: newBtcBalance,
          reason: reason || "BTC Withdrawal"
        })
      }

    } else {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: transactionData
    })

    // Update cache
    await BalanceCache.setUserBalances(userId, newInrBalance, newBtcBalance)

    // Log the admin action
    const logMessage = currency === 'BTC' && type === 'CREDIT' 
      ? `💰 Admin BTC Credit: ${session.user.email} credited ₿${transactionAmount} BTC to ${user.email} (recorded as BUY at sell rate for P&L)`
      : `💰 Admin ${type}: ${session.user.email} ${type.toLowerCase()}ed ${currency === 'INR' ? '₹' : '₿'}${transactionAmount} ${currency} ${type === 'CREDIT' ? 'to' : 'from'} ${user.email}`

    console.log(logMessage)

    return NextResponse.json({ 
      success: true, 
      // transaction, // Excluded due to BigInt serialization issues
      newBalances: {
        inr: newInrBalance,
        btc: newBtcBalance
      },
      currency,
      amount: transactionAmount,
      type,
      message: currency === 'BTC' && type === 'CREDIT' 
        ? 'BTC credited with cost basis at current sell rate for accurate P&L tracking'
        : 'Balance adjusted successfully'
    })

  } catch (error) {
    console.error('Admin balance adjustment error:', error)
    return NextResponse.json(
      { error: 'Failed to adjust balance' },
      { status: 500 }
    )
  }
}
