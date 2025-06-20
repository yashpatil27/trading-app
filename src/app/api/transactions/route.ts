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

      // Calculate the signed amount for deposits/withdrawals
      let signedAmount = transaction.inrAmount
      if (transaction.type === 'WITHDRAWAL' || transaction.type === 'ADMIN_DEBIT') {
        signedAmount = -Math.abs(transaction.inrAmount) // Make withdrawal amounts negative
      } else if (transaction.type === 'DEPOSIT' || transaction.type === 'ADMIN_CREDIT') {
        signedAmount = Math.abs(transaction.inrAmount) // Make deposit amounts positive
      }

      return {
        id: transaction.id,
        type: transaction.type as 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT',
        category: isTradeTransaction ? 'TRADE' as const : 'BALANCE' as const,
        amount: transaction.btcAmount || 0,
        price: transaction.btcPriceInr,
        total: signedAmount, // Use signed amount instead of Math.abs
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
