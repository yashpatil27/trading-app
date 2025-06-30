const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllAdminTransactions() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('No admin user found');
      return;
    }
    
    console.log('Admin user ID:', admin.id);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: admin.id
      },
      select: {
        id: true,
        type: true,
        btcAmount: true,
        inrAmount: true,
        btcPriceInr: true,
        createdAt: true,
        reason: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\nAll transactions for admin:');
    console.log('===========================');
    
    transactions.forEach((t, i) => {
      console.log(`${i+1}. ID: ${t.id}`);
      console.log(`   Type: ${t.type}`);
      console.log(`   BTC Amount: ${t.btcAmount}`);
      console.log(`   INR Amount: ${t.inrAmount}`);
      console.log(`   Date: ${t.createdAt}`);
      console.log(`   Reason: ${t.reason}`);
      console.log('');
    });
    
    // Find the first ADMIN transaction
    const firstAdminTransaction = transactions.find(t => t.type === 'ADMIN');
    if (firstAdminTransaction) {
      console.log('First ADMIN transaction to keep:');
      console.log(`ID: ${firstAdminTransaction.id}`);
      console.log(`Date: ${firstAdminTransaction.createdAt}`);
      console.log(`Reason: ${firstAdminTransaction.reason}`);
    } else {
      console.log('No ADMIN transaction found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllAdminTransactions();
