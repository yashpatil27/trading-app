import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trades
    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        type: true,
        amount: true,
        price: true,
        total: true,
        btcPrice: true,
        createdAt: true
      }
    })

    // Get balance history (admin deposits/withdrawals)
    const balanceHistory = await prisma.balanceHistory.findMany({
      where: { 
        userId: session.user.id,
        type: { in: ['CREDIT', 'DEBIT'] } // Only admin actions
      },
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        reason: true,
        createdAt: true
      }
    })

    // Combine and transform into unified format
    const allTransactions = [
      // Transform trades
      ...trades.map(trade => ({
        id: trade.id,
        type: trade.type as 'BUY' | 'SELL',
        category: 'TRADE' as const,
        amount: trade.amount,
        price: trade.price,
        total: trade.total,
        btcPrice: trade.btcPrice,
        reason: `${trade.type} ${trade.amount.toFixed(8)} BTC`,
        createdAt: trade.createdAt
      })),
      // Transform balance history
      ...balanceHistory.map(balance => ({
        id: balance.id,
        type: balance.type as 'CREDIT' | 'DEBIT',
        category: 'BALANCE' as const,
        amount: Math.abs(balance.amount),
        total: Math.abs(balance.amount),
        reason: balance.reason || `Admin ${balance.type.toLowerCase()}`,
        balance: balance.balance,
        createdAt: balance.createdAt
      }))
    ]

    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
