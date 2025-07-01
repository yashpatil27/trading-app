import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma, TransactionType } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, newPin, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!newPin && !newPassword) {
      return NextResponse.json({ error: 'At least one field (PIN or password) must be provided' }, { status: 400 })
    }

    // Validate PIN if provided
    if (newPin && (!/^\d{4}$/.test(newPin))) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    // Validate password if provided
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (newPin) {
      updateData.tradingPin = newPin
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        tradingPin: true,
        role: true
      }
    })

    // Create audit log entry
    const changes = []
    if (newPin) changes.push('PIN')
    if (newPassword) changes.push('Password')
    
    await prisma.transaction.create({
      data: {
        userId: userId,
        type: TransactionType.ADMIN,
        inrAmount: 0,
        inrBalanceAfter: 0,
        btcBalanceAfter: 0,
        inrAmountInt: 0,
        inrBalanceAfterInt: 0,
        btcBalanceAfterSat: 0n,
        reason: `Admin reset: ${changes.join(' and ')} updated by ${session.user.email}`
      }
    })

    return NextResponse.json({
      message: `Successfully reset ${changes.join(' and ')}`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Reset credentials error:', error)
    return NextResponse.json(
      { error: 'Failed to reset credentials' },
      { status: 500 }
    )
  }
}
