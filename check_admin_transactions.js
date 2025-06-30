const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAdminTransactions() {
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
        userId: admin.id,
        type: { in: ['DEPOSIT_INR', 'DEPOSIT_BTC', 'WITHDRAWAL_INR', 'WITHDRAWAL_BTC'] }
      },
      select: {
        type: true,
        btcAmount: true,
        inrAmount: true,
        btcPriceInr: true,
        createdAt: true,
        reason: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\nDeposit/Withdrawal transactions for admin:');
    console.log('==========================================');
    
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    
    transactions.forEach((t, i) => {
      console.log(`${i+1}. ${t.type}:`);
      console.log(`   BTC Amount: ${t.btcAmount}`);
      console.log(`   INR Amount: ${t.inrAmount}`);
      console.log(`   BTC Price INR: ${t.btcPriceInr}`);
      console.log(`   Date: ${t.createdAt}`);
      console.log(`   Reason: ${t.reason}`);
      
      if (t.type === 'DEPOSIT_INR' || t.type === 'DEPOSIT_BTC') {
        totalDeposits += t.inrAmount;
        console.log(`   -> Adding to deposits: +${t.inrAmount}`);
      } else {
        totalWithdrawals += t.inrAmount;
        console.log(`   -> Adding to withdrawals: +${t.inrAmount}`);
      }
      console.log('');
    });
    
    console.log('SUMMARY:');
    console.log(`Total Deposits: Rs.${totalDeposits}`);
    console.log(`Total Withdrawals: Rs.${totalWithdrawals}`);
    console.log(`Total Investment: Rs.${totalDeposits - totalWithdrawals}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAdminTransactions();
