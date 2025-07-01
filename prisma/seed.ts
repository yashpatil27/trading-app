import { PrismaClient, TransactionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bittrade.co.in' },
    update: {},
    create: {
      email: 'admin@bittrade.co.in',
      name: 'John Smith',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  // Create admin initial setup transaction using enum
  await prisma.transaction.create({
    data: {
      userId: admin.id,
      type: TransactionType.ADMIN,
      inrAmount: 0,
      inrBalanceAfter: 0,
      btcBalanceAfter: 0,
      inrAmountInt: 0,
      inrBalanceAfterInt: 0,
      btcBalanceAfterSat: 0n,
      reason: 'Initial admin account setup'
    }
  })

  console.log('Seeded admin user:', { admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
