import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'
import { createCompleteTransactionData, satoshiToBtc, btcToSatoshi } from '@/lib/currencyUtils'

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

    if (currency === 'INR') {
      // INR balance adjustment
      const adjustmentAmount = type === 'CREDIT' ? amount : -amount
      newInrBalance = currentInrBalance + adjustmentAmount
      
      if (newInrBalance < 0) {
        return NextResponse.json({ error: 'Insufficient INR balance' }, { status: 400 })
      }
      
      transactionType = type === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT'
      transactionAmount = Math.abs(amount)
    } else if (currency === 'BTC') {
      // Bitcoin balance adjustment
      const adjustmentAmount = type === 'CREDIT' ? amount : -amount
      newBtcBalance = currentBtcBalance + adjustmentAmount
      
      if (newBtcBalance < 0) {
        return NextResponse.json({ error: 'Insufficient Bitcoin balance' }, { status: 400 })
      }
      
      transactionType = type === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT'
      transactionAmount = Math.abs(amount)
    } else {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }

    // Create transaction record with dual-mode support
    const transactionData = createCompleteTransactionData({
      userId,
      type: transactionType as any,
      inrAmount: currency === 'INR' ? transactionAmount : 0,
      btcAmount: currency === 'BTC' ? transactionAmount : 0,
      inrBalanceAfter: newInrBalance,
      btcBalanceAfter: newBtcBalance,
      reason: reason || `Admin ${type.toLowerCase()} - ${currency} adjustment`
    })

    const transaction = await prisma.transaction.create({
      data: transactionData
    })

    // Update cache
    await BalanceCache.setUserBalances(userId, newInrBalance, newBtcBalance)

    // Log the admin action
    console.log(`💰 Admin ${type}: ${session.user.email} ${type.toLowerCase()}ed ${currency === 'INR' ? '₹' : '₿'}${transactionAmount} ${currency} ${type === 'CREDIT' ? 'to' : 'from'} ${user.email} | Using integer fields`)

    return NextResponse.json({ 
      success: true, 
      // transaction, // Excluded due to BigInt serialization issues
      newBalances: {
        inr: newInrBalance,
        btc: newBtcBalance
      },
      currency,
      amount: transactionAmount,
      type
    })

  } catch (error) {
    console.error('Admin balance adjustment error:', error)
    return NextResponse.json(
      { error: 'Failed to adjust balance' },
      { status: 500 }
    )
  }
}
