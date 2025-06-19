import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all balance history (deposits/withdrawals) with user names
    const balanceHistory = await prisma.balanceHistory.findMany({
      where: { 
        type: { in: ['CREDIT', 'DEBIT'] } // Only admin actions
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to include user names and proper labeling
    const deposits = balanceHistory.map(deposit => ({
      id: deposit.id,
      type: deposit.type,
      amount: deposit.amount,
      balance: deposit.balance,
      reason: deposit.reason || `Admin ${deposit.type.toLowerCase()}`,
      createdAt: deposit.createdAt,
      userName: deposit.user.name,
      userEmail: deposit.user.email,
      // Check if it's the admin's own account
      isSelfTransaction: deposit.userId === session.user.id
    }))

    return NextResponse.json(deposits)
  } catch (error) {
    console.error('Error fetching admin deposit history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
