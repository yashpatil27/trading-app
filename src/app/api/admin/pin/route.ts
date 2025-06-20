import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, newPin } = await request.json()

    if (!userId || !newPin) {
      return NextResponse.json({ error: 'User ID and new PIN are required' }, { status: 400 })
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user's PIN
    await prisma.user.update({
      where: { id: userId },
      data: { tradingPin: newPin }
    })

    // Log the PIN reset action
    console.log(`🔐 PIN Reset: Admin ${session.user.email} reset PIN for user ${user.email} (${user.name})`)

    return NextResponse.json({ 
      success: true, 
      message: `PIN successfully reset for ${user.name}` 
    })
  } catch (error) {
    console.error('Admin PIN reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
