const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAdminTransactions() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('No admin user found');
      return;
    }
    
    console.log('Admin user ID:', admin.id);
    
    // Delete all transactions except the first ADMIN transaction
    const deleteResult = await prisma.transaction.deleteMany({
      where: {
        userId: admin.id,
        id: {
          not: 'init-admin-setup' // Keep the first ADMIN transaction
        }
      }
    });
    
    console.log(`Deleted ${deleteResult.count} transactions`);
    
    // Reset admin balances to 0 (since we're keeping only the initial setup)
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        balance: 0,
        btcAmount: 0
      }
    });
    
    console.log('Reset admin balances to 0');
    
    // Verify remaining transactions
    const remainingTransactions = await prisma.transaction.findMany({
      where: { userId: admin.id },
      select: {
        id: true,
        type: true,
        reason: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\nRemaining transactions:');
    remainingTransactions.forEach((t, i) => {
      console.log(`${i+1}. ID: ${t.id}, Type: ${t.type}, Reason: ${t.reason}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAdminTransactions();
