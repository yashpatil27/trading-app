import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const adjustedAmount = type === 'CREDIT' ? Math.abs(amount) : -Math.abs(amount)
    const newBalance = user.balance + adjustedAmount

    if (newBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    })

    // Determine if it's a self-transaction
    const isSelfTransaction = userId === session.user.id
    let defaultReason = `Admin ${type.toLowerCase()}`
    
    if (isSelfTransaction) {
      defaultReason = type === 'CREDIT' ? 'Self Deposit' : 'Self Withdrawal'
    }

    // Create balance history
    await prisma.balanceHistory.create({
      data: {
        userId,
        type,
        amount: adjustedAmount,
        balance: newBalance,
        reason: reason || defaultReason
      }
    })

    return NextResponse.json({ 
      message: 'Balance updated successfully',
      newBalance: updatedUser.balance 
    })
  } catch (error) {
    console.error('Error updating balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
