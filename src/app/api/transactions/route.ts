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
      const isDepositWithdrawal = ['DEPOSIT', 'WITHDRAWAL'].includes(transaction.type)

      // Prefer integer fields when available
      const usingIntegers = !!(transaction.inrAmountInt !== null && 
                             (transaction.btcAmountSatoshi !== null || !isTradeTransaction))

      let btcAmount = 0
      let inrAmount = 0
      let btcPrice = 0
      let balance = 0

      if (usingIntegers) {
        // Use integer fields with proper conversion
        btcAmount = transaction.btcAmountSatoshi ? satoshiToBtc(transaction.btcAmountSatoshi) : 0
        inrAmount = transaction.inrAmountInt || 0
        btcPrice = transaction.btcPriceUsdInt || 0
        balance = transaction.inrBalanceAfterInt || 0
      } else {
        // Fallback to float fields
        btcAmount = transaction.btcAmount || 0
        inrAmount = transaction.inrAmount || 0
        btcPrice = transaction.btcPriceUsd || 0
        balance = transaction.inrBalanceAfter || 0
      }

      // For admin transactions, determine if it's Bitcoin or INR based on amounts
      const isBitcoinAdminTransaction = isDepositWithdrawal && btcAmount > 0 && inrAmount === 0
      
      // Calculate the signed amount for deposits/withdrawals
      let signedAmount = inrAmount
      if (transaction.type === 'WITHDRAWAL') {
        signedAmount = -Math.abs(inrAmount)
      } else if (transaction.type === 'DEPOSIT') {
        signedAmount = Math.abs(inrAmount)
      }

      return {
        id: transaction.id,
        type: transaction.type as 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL',
        category: isTradeTransaction ? 'TRADE' as const : 'BALANCE' as const,
        amount: btcAmount,
        price: transaction.btcPriceInrInt || transaction.btcPriceInr || 0,
        total: signedAmount,
        btcPrice: btcPrice,
        reason: transaction.reason || `${transaction.type} ${btcAmount ? formatBtc(BigInt(Math.round(btcAmount * 100000000))) : ''}`,
        balance: balance,
        createdAt: transaction.createdAt,
        
        // Debug info
        _meta: {
          usingIntegers,
          precision: usingIntegers ? 'integer' : 'float'
        }
      }
    })

    return NextResponse.json(allTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
