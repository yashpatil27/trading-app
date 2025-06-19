import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bittrade.com' },
    update: {},
    create: {
      email: 'admin@bittrade.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      balance: 0
    }
  })

  // Create a demo user
  const userPassword = await bcrypt.hash('user123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@bittrade.com' },
    update: {},
    create: {
      email: 'user@bittrade.com',
      name: 'Demo User',
      password: userPassword,
      role: 'USER',
      balance: 100000
    }
  })

  console.log('Seeded users:', { admin, user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
