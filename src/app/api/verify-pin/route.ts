import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pin } = await request.json()

    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    // Get user's trading PIN from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tradingPin: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify PIN
    const isValid = user.tradingPin === pin

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('PIN verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
