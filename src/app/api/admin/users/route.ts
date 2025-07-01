import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, TransactionType } from '@/lib/prisma'
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
        tradingPin: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Bulk fetch balances for all users (fixes N+1 query)
    const userIds = users.map(user => user.id)
    const balanceMap = await BalanceCache.getBulkUserBalances(userIds)

    // Combine user data with their balances
    const usersWithBalances = users.map(user => {
      const balanceData = balanceMap.get(user.id)
      return {
        ...user,
        balance: balanceData?.inrBalance || 0,
        btcAmount: balanceData?.btcBalance || 0,
        _count: {
          trades: user._count.transactions // Keep the frontend interface
        },
        _debug: {
          fromCache: balanceData?.fromCache || false
        }
      }
    })

    console.log(`👥 Admin users API: Fetched ${users.length} users with bulk balance lookup`)

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
        type: TransactionType.ADMIN,
        inrAmount: 0,
        inrBalanceAfter: 0,
        btcBalanceAfter: 0,
        inrAmountInt: 0,
        inrBalanceAfterInt: 0,
        btcBalanceAfterSat: 0n,
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
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Check if user exists and get their current balances
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get current balances from cache/database
    const balanceData = await BalanceCache.getUserBalances(userId)
    const inrBalance = balanceData?.inrBalance || 0
    const btcBalance = balanceData?.btcBalance || 0

    // Check if user has active balance
    if (inrBalance > 0 || btcBalance > 0) {
      return NextResponse.json({ 
        error: `Cannot delete user with active balance. Current balance: ₹${inrBalance.toLocaleString("en-IN")} and ₿${btcBalance.toFixed(8)}. Please adjust balance to zero first.` 
      }, { status: 400 })
    }

    // Delete user and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all user transactions
      await tx.transaction.deleteMany({
        where: { userId: userId }
      })

      // Delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    // Clear user from balance cache
    await BalanceCache.invalidateUserBalances(userId)

    console.log(`🗑️ Admin deleted user: ${user.email} (${user.name})`)

    return NextResponse.json({ 
      message: "User deleted successfully",
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
