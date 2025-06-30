const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTransactionTypes() {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('No admin user found');
      return;
    }
    
    console.log('Admin user ID:', admin.id);
    
    // Update old DEPOSIT/WITHDRAWAL types to proper format
    const updateResult = await prisma.transaction.updateMany({
      where: {
        userId: admin.id,
        type: 'DEPOSIT'
      },
      data: {
        type: 'DEPOSIT_INR'
      }
    });
    
    console.log(`Updated ${updateResult.count} DEPOSIT transactions to DEPOSIT_INR`);
    
    const updateResult2 = await prisma.transaction.updateMany({
      where: {
        userId: admin.id,
        type: 'WITHDRAWAL'
      },
      data: {
        type: 'WITHDRAWAL_INR'
      }
    });
    
    console.log(`Updated ${updateResult2.count} WITHDRAWAL transactions to WITHDRAWAL_INR`);
    
    // Verify the changes
    const allTransactions = await prisma.transaction.findMany({
      where: { userId: admin.id },
      select: {
        id: true,
        type: true,
        inrAmount: true,
        reason: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('\nUpdated transactions:');
    allTransactions.forEach((t, i) => {
      console.log(`${i+1}. Type: ${t.type}, INR Amount: ${t.inrAmount}, Reason: ${t.reason}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTransactionTypes();
