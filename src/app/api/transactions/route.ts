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

    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Transform into unified format for UI compatibility
    const allTransactions = transactions.map(transaction => {
      const isTradeTransaction = ['BUY', 'SELL'].includes(transaction.type)
      const isDepositWithdrawal = ['DEPOSIT', 'WITHDRAWAL', 'ADMIN_CREDIT', 'ADMIN_DEBIT'].includes(transaction.type)

      return {
        id: transaction.id,
        type: transaction.type as 'BUY' | 'SELL' | 'CREDIT' | 'DEBIT',
        category: isTradeTransaction ? 'TRADE' as const : 'BALANCE' as const,
        amount: transaction.btcAmount || 0,
        price: transaction.btcPriceInr,
        total: Math.abs(transaction.inrAmount),
        btcPrice: transaction.btcPriceUsd,
        reason: transaction.reason || `${transaction.type} ${transaction.btcAmount ? transaction.btcAmount.toFixed(8) + ' BTC' : ''}`,
        balance: transaction.inrBalanceAfter,
        createdAt: transaction.createdAt
      }
    })

    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
