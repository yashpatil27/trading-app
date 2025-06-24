import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BalanceCache } from '@/lib/balanceCache'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, confirmPassword, tradingPin } = await request.json()

    // Simple validation
    if (!email || !name || !password || !confirmPassword || !tradingPin) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (tradingPin.length !== 4 || !/^\d{4}$/.test(tradingPin)) {
      return NextResponse.json({ error: 'Trading PIN must be exactly 4 digits' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user first
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        tradingPin,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // Create initial transaction with 0 balance (exactly like in admin users creation)
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'ADMIN_CREDIT',
        inrAmount: 0,
        inrBalanceAfter: 0,
        btcBalanceAfter: 0,
        reason: 'Initial account setup - Welcome to ₿itTrade!'
      }
    })

    // Initialize cache
    await BalanceCache.setUserBalances(user.id, 0, 0)

    console.log(`🎉 New user registered: ${user.email} (${user.name}) - Initial balance set to 0`)

    return NextResponse.json({ 
      message: 'Account created successfully! Welcome to ₿itTrade!',
      user: user
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
