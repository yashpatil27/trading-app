import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'
import { formatBtc, formatInr } from '@/lib/currencyUtils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get balances from Redis cache (with database fallback)
    const { inrBalance, btcBalance, fromCache, usingIntegers } = await BalanceCache.getUserBalances(user.id)

    console.log(`💰 Balance lookup for ${user.email}: ${fromCache ? '⚡ Redis cache' : '🐌 Database'}${usingIntegers ? ' (integer precision)' : ' (float fallback)'}`)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      
      // Financial data with formatted display
      balance: inrBalance,
      btcAmount: btcBalance,
      
      // Formatted for display
      balanceFormatted: formatInr(Math.round(inrBalance)),
      btcAmountFormatted: formatBtc(BigInt(Math.round(btcBalance * 100000000))),
      
      // Metadata
      _debug: {
        fromCache,
        source: fromCache ? 'redis' : 'database',
        precision: usingIntegers ? 'integer' : 'float',
        balanceExact: inrBalance,
        btcExact: btcBalance
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
