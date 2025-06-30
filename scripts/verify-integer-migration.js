const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyIntegerMigration() {
  console.log('🔍 Verifying integer field migration...\n');
  
  try {
    // Check all transactions
    const allTransactions = await prisma.transaction.findMany({
      select: {
        id: true,
        type: true,
        btcAmount: true,
        btcAmountSatoshi: true,
        inrAmount: true,
        inrAmountInt: true,
        inrBalanceAfter: true,
        inrBalanceAfterInt: true,
        btcBalanceAfter: true,
        btcBalanceAfterSat: true,
        btcPriceUsd: true,
        btcPriceUsdInt: true,
        btcPriceInr: true,
        btcPriceInrInt: true,
        usdInrRate: true,
        usdInrRateInt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total transactions: ${allTransactions.length}`);
    
    // Count coverage of integer fields
    const stats = {
      totalTransactions: allTransactions.length,
      hasInrAmountInt: 0,
      hasInrBalanceAfterInt: 0,
      hasBtcBalanceAfterSat: 0,
      hasBtcAmountSatoshi: 0,
      hasBtcPriceUsdInt: 0,
      hasBtcPriceInrInt: 0,
      hasUsdInrRateInt: 0,
      missingIntegerFields: []
    };

    allTransactions.forEach(tx => {
      if (tx.inrAmountInt !== null) stats.hasInrAmountInt++;
      if (tx.inrBalanceAfterInt !== null) stats.hasInrBalanceAfterInt++;
      if (tx.btcBalanceAfterSat !== null) stats.hasBtcBalanceAfterSat++;
      if (tx.btcAmountSatoshi !== null) stats.hasBtcAmountSatoshi++;
      if (tx.btcPriceUsdInt !== null) stats.hasBtcPriceUsdInt++;
      if (tx.btcPriceInrInt !== null) stats.hasBtcPriceInrInt++;
      if (tx.usdInrRateInt !== null) stats.hasUsdInrRateInt++;

      // Check for transactions missing critical integer fields
      if (tx.inrAmountInt === null || tx.inrBalanceAfterInt === null || tx.btcBalanceAfterSat === null) {
        stats.missingIntegerFields.push({
          id: tx.id,
          type: tx.type,
          createdAt: tx.createdAt,
          missing: {
            inrAmountInt: tx.inrAmountInt === null,
            inrBalanceAfterInt: tx.inrBalanceAfterInt === null,
            btcBalanceAfterSat: tx.btcBalanceAfterSat === null
          }
        });
      }
    });

    console.log('\n📈 Integer Field Coverage:');
    console.log(`  inrAmountInt: ${stats.hasInrAmountInt}/${stats.totalTransactions} (${(stats.hasInrAmountInt/stats.totalTransactions*100).toFixed(1)}%)`);
    console.log(`  inrBalanceAfterInt: ${stats.hasInrBalanceAfterInt}/${stats.totalTransactions} (${(stats.hasInrBalanceAfterInt/stats.totalTransactions*100).toFixed(1)}%)`);
    console.log(`  btcBalanceAfterSat: ${stats.hasBtcBalanceAfterSat}/${stats.totalTransactions} (${(stats.hasBtcBalanceAfterSat/stats.totalTransactions*100).toFixed(1)}%)`);
    console.log(`  btcAmountSatoshi: ${stats.hasBtcAmountSatoshi}/${stats.totalTransactions} (${(stats.hasBtcAmountSatoshi/stats.totalTransactions*100).toFixed(1)}%)`);
    console.log(`  btcPriceUsdInt: ${stats.hasBtcPriceUsdInt}/${stats.totalTransactions} (${(stats.hasBtcPriceUsdInt/stats.totalTransactions*100).toFixed(1)}%)`);
    console.log(`  btcPriceInrInt: ${stats.hasBtcPriceInrInt}/${stats.totalTransactions} (${(stats.hasBtcPriceInrInt/stats.totalTransactions*100).toFixed(1)}%)`);
    console.log(`  usdInrRateInt: ${stats.hasUsdInrRateInt}/${stats.totalTransactions} (${(stats.hasUsdInrRateInt/stats.totalTransactions*100).toFixed(1)}%)`);

    if (stats.missingIntegerFields.length > 0) {
      console.log(`\n⚠️  ${stats.missingIntegerFields.length} transactions missing critical integer fields:`);
      stats.missingIntegerFields.forEach(tx => {
        console.log(`  - ${tx.id} (${tx.type}) from ${tx.createdAt}`);
        console.log(`    Missing: ${Object.entries(tx.missing).filter(([k,v]) => v).map(([k,v]) => k).join(', ')}`);
      });
    } else {
      console.log('\n✅ All transactions have complete integer field coverage!');
    }

    // Check BTC price records
    const btcPrices = await prisma.btcPrice.findMany({
      select: {
        id: true,
        priceUsd: true,
        priceUsdInt: true,
        createdAt: true
      }
    });

    const btcPricesWithInt = btcPrices.filter(p => p.priceUsdInt !== null).length;
    console.log(`\n💰 BTC Price Records: ${btcPricesWithInt}/${btcPrices.length} have integer fields (${(btcPricesWithInt/btcPrices.length*100).toFixed(1)}%)`);

    // Summary
    const isFullyMigrated = stats.missingIntegerFields.length === 0 && btcPricesWithInt === btcPrices.length;
    console.log(`\n${isFullyMigrated ? '🎉' : '⚠️'} Migration Status: ${isFullyMigrated ? 'COMPLETE' : 'INCOMPLETE'}`);

    if (isFullyMigrated) {
      console.log('✅ All financial data is using integer precision!');
      console.log('✅ Ready to deprecate float fields');
    } else {
      console.log('❌ Some records still need integer field population');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyIntegerMigration().catch(console.error);
