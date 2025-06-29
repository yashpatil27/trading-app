import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { satoshiToBtc, formatBtc, formatInr } from '@/lib/currencyUtils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all transactions with both float and integer fields
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        createdAt: true,
        reason: true,
        // Integer fields (preferred)
        btcAmountSatoshi: true,
        inrAmountInt: true,
        inrBalanceAfterInt: true,
        btcBalanceAfterSat: true,
        btcPriceUsdInt: true,
        btcPriceInrInt: true,
        // Float fields (fallback)
        btcAmount: true,
        inrAmount: true,
        inrBalanceAfter: true,
        btcBalanceAfter: true,
        btcPriceUsd: true,
        btcPriceInr: true
      }
    })

    // Transform to use integer fields primarily with proper formatting
    const allTransactions = transactions.map(transaction => {
      const isTradeTransaction = ['BUY', 'SELL'].includes(transaction.type)
      const isDepositTransaction = transaction.type.includes('DEPOSIT')
      const isWithdrawalTransaction = transaction.type.includes('WITHDRAWAL')
      const isBitcoinTransaction = transaction.type.includes('BTC')
      const isAdminTransaction = transaction.type === 'ADMIN'

      // Prefer integer fields when available
      const usingIntegers = !!(transaction.inrAmountInt !== null && 
                             (transaction.btcAmountSatoshi !== null || !isTradeTransaction))

      let btcAmount = 0
      let inrAmount = 0
      let btcPrice = 0
      let balance = 0
      let btcBalance = 0

      if (usingIntegers) {
        // Use integer fields with proper conversion
        btcAmount = transaction.btcAmountSatoshi ? satoshiToBtc(BigInt(transaction.btcAmountSatoshi)) : 0
        inrAmount = transaction.inrAmountInt || 0
        btcPrice = transaction.btcPriceUsdInt || 0
        balance = transaction.inrBalanceAfterInt || 0
        btcBalance = transaction.btcBalanceAfterSat ? satoshiToBtc(BigInt(transaction.btcBalanceAfterSat)) : 0
      } else {
        // Fallback to float fields
        btcAmount = transaction.btcAmount || 0
        inrAmount = transaction.inrAmount || 0
        btcPrice = transaction.btcPriceUsd || 0
        balance = transaction.inrBalanceAfter || 0
        btcBalance = transaction.btcBalanceAfter || 0
      }

      // Calculate the signed amount for deposits/withdrawals
      let signedAmount = inrAmount
      if (isWithdrawalTransaction) {
        signedAmount = -Math.abs(inrAmount)
      } else if (isDepositTransaction) {
        signedAmount = Math.abs(inrAmount)
      }

      // Determine transaction category
      let category: 'TRADE' | 'BALANCE' | 'ADMIN'
      if (isTradeTransaction) {
        category = 'TRADE'
      } else if (isAdminTransaction) {
        category = 'ADMIN'
      } else {
        category = 'BALANCE'
      }

      return {
        id: transaction.id,
        type: transaction.type,
        category: category,
        amount: btcAmount,
        price: transaction.btcPriceInrInt || transaction.btcPriceInr || 0,
        total: signedAmount,
        btcPrice: btcPrice,
        btcBalance: btcBalance,
        reason: transaction.reason || `${transaction.type}`,
        balance: balance,
        createdAt: transaction.createdAt,
        
        // Debug info
        _meta: {
          usingIntegers,
          precision: usingIntegers ? 'integer' : 'float',
          isBitcoinTransaction,
          originalType: transaction.type
        }
      }
    })

    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
