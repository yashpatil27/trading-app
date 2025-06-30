const { PrismaClient } = require('@prisma/client');
const { BalanceCache } = require('./src/lib/balanceCache');
const prisma = new PrismaClient();

async function resetAdminBalances() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('No admin user found');
      return;
    }
    
    console.log('Admin user ID:', admin.id);
    
    // Reset balances in cache to 0
    await BalanceCache.setUserBalances(admin.id, 0, 0);
    console.log('Reset admin balances to INR: 0, BTC: 0');
    
    // Verify the reset
    const balances = await BalanceCache.getUserBalances(admin.id);
    console.log('Current balances:', balances);
    
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
    
    console.log('\n✅ Admin account cleaned up successfully!');
    console.log('Ready to test Total Investment calculation with fresh transactions.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminBalances();
