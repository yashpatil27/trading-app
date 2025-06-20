import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'

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
    const { inrBalance, btcBalance, fromCache } = await BalanceCache.getUserBalances(user.id)

    console.log(`💰 Balance lookup for ${user.email}: ${fromCache ? '⚡ Redis cache' : '🐌 Database'}`)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      balance: inrBalance,
      role: user.role,
      createdAt: user.createdAt,
      btcAmount: btcBalance,
      _debug: {
        fromCache,
        source: fromCache ? 'redis' : 'database'
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
