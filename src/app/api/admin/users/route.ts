import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with transaction count
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get balance for each user from cache (which falls back to latest transaction)
    const usersWithBalances = await Promise.all(
      users.map(async (user) => {
        const { inrBalance, btcBalance } = await BalanceCache.getUserBalances(user.id)
        return {
          ...user,
          balance: inrBalance,
          btcAmount: btcBalance,
          _count: {
            trades: user._count.transactions // Keep the frontend interface
          }
        }
      })
    )

    return NextResponse.json(usersWithBalances)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, name, password, role = 'USER' } = await request.json()
    
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role
      }
    })

    // Create initial transaction with 0 balance
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'ADMIN_CREDIT',
        inrAmount: 0,
        inrBalanceAfter: 0,
        btcBalanceAfter: 0,
        reason: 'Initial account setup'
      }
    })

    // Initialize cache
    await BalanceCache.setUserBalances(user.id, 0, 0)

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
