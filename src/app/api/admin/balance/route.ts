import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, amount, reason, type } = await request.json()
    
    if (!userId || amount === undefined || !type) {
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

    const adjustedAmount = type === 'CREDIT' ? Math.abs(amount) : -Math.abs(amount)
    const newInrBalance = currentInrBalance + adjustedAmount

    if (newInrBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Determine transaction type based on operation
    const transactionType = type === 'CREDIT' ? 'DEPOSIT' : 'WITHDRAWAL'
    const defaultReason = type === 'CREDIT' ? 'Admin deposit' : 'Admin withdrawal'

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: transactionType,
        inrAmount: Math.abs(adjustedAmount),
        inrBalanceAfter: newInrBalance,
        btcBalanceAfter: currentBtcBalance,
        reason: reason || defaultReason
      }
    })

    // Update cache with new balance
    await BalanceCache.setUserBalances(userId, newInrBalance, currentBtcBalance)

    console.log(`💰 Admin ${type}: ${user.email} balance updated to ₹${newInrBalance}`)

    return NextResponse.json({ 
      message: 'Balance updated successfully',
      newBalance: newInrBalance,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: Math.abs(adjustedAmount),
        reason: transaction.reason
      }
    })
  } catch (error) {
    console.error('Error updating balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
