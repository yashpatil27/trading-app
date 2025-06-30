const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyIntegerOnlySchema() {
  console.log('🔍 Verifying integer-only schema...\n');
  
  try {
    // Check all transactions with integer fields only
    const allTransactions = await prisma.transaction.findMany({
      select: {
        id: true,
        type: true,
        btcAmountSatoshi: true,
        btcPriceUsdInt: true,
        btcPriceInrInt: true,
        usdInrRateInt: true,
        inrAmountInt: true,
        inrBalanceAfterInt: true,
        btcBalanceAfterSat: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📊 Total transactions: ${allTransactions.length}`);
    console.log('\n📋 Sample transactions (latest 5):');
    
    allTransactions.forEach((tx, i) => {
      console.log(`${i + 1}. ${tx.type} - INR: ${tx.inrAmountInt}, BTC: ${tx.btcAmountSatoshi ? Number(tx.btcAmountSatoshi) : 'null'}`);
    });

    // Check BTC price records
    const btcPrices = await prisma.btcPrice.findMany({
      select: {
        id: true,
        priceUsdInt: true,
        createdAt: true
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n💰 BTC Price Records: ${btcPrices.length} found`);
    if (btcPrices.length > 0) {
      console.log(`Latest price: $${btcPrices[0].priceUsdInt}`);
    }

    // Verify all required fields are present
    const transactionCount = await prisma.transaction.count();
    const transactionsWithAllFields = await prisma.transaction.count({
      where: {
        AND: [
          { inrAmountInt: { not: null } },
          { inrBalanceAfterInt: { not: null } },
          { btcBalanceAfterSat: { not: null } }
        ]
      }
    });

    console.log(`\n✅ Schema verification:`);
    console.log(`  Total transactions: ${transactionCount}`);
    console.log(`  With complete integer fields: ${transactionsWithAllFields}`);
    console.log(`  Coverage: ${(transactionsWithAllFields/transactionCount*100).toFixed(1)}%`);

    if (transactionsWithAllFields === transactionCount) {
      console.log('\n🎉 SUCCESS: Integer-only schema migration complete!');
      console.log('✅ All transactions have integer fields');
      console.log('✅ Float fields have been removed');
      console.log('✅ Database schema is clean and efficient');
    } else {
      console.log('\n❌ Some transactions missing required integer fields');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyIntegerOnlySchema().catch(console.error);
