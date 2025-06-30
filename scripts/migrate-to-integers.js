const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Import currency utilities
const SATOSHI_PER_BTC = 100_000_000;
const USD_INR_RATE_MULTIPLIER = 100;

const btcToSatoshi = (btc) => {
  return BigInt(Math.round(btc * SATOSHI_PER_BTC));
};

const inrToInt = (inr) => {
  return Math.round(inr);
};

const usdToInt = (usd) => {
  return Math.round(usd);
};

const usdInrRateToInt = (rate) => {
  return Math.round(rate * USD_INR_RATE_MULTIPLIER);
};

async function migrateToIntegers() {
  console.log('Starting migration to integer fields...');
  
  try {
    // Find all transactions missing integer fields
    const transactionsToUpdate = await prisma.transaction.findMany({
      where: {
        OR: [
          { inrAmountInt: null },
          { inrBalanceAfterInt: null },
          { btcBalanceAfterSat: null }
        ]
      }
    });
    
    console.log(`Found ${transactionsToUpdate.length} transactions to update`);
    
    for (const transaction of transactionsToUpdate) {
      console.log(`Updating transaction ${transaction.id} (${transaction.type})`);
      
      const updateData = {
        inrAmountInt: inrToInt(transaction.inrAmount),
        inrBalanceAfterInt: inrToInt(transaction.inrBalanceAfter),
        btcBalanceAfterSat: btcToSatoshi(transaction.btcBalanceAfter),
      };
      
      // Handle optional BTC amount
      if (transaction.btcAmount !== null) {
        updateData.btcAmountSatoshi = btcToSatoshi(transaction.btcAmount);
      }
      
      // Handle optional price fields
      if (transaction.btcPriceUsd !== null) {
        updateData.btcPriceUsdInt = usdToInt(transaction.btcPriceUsd);
      }
      
      if (transaction.btcPriceInr !== null) {
        updateData.btcPriceInrInt = inrToInt(transaction.btcPriceInr);
      }
      
      if (transaction.usdInrRate !== null) {
        updateData.usdInrRateInt = usdInrRateToInt(transaction.usdInrRate);
      }
      
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: updateData
      });
    }
    
    // Also update BtcPrice records
    const btcPricesWithoutInt = await prisma.btcPrice.findMany({
      where: { priceUsdInt: null }
    });
    
    console.log(`Found ${btcPricesWithoutInt.length} BTC price records to update`);
    
    for (const price of btcPricesWithoutInt) {
      await prisma.btcPrice.update({
        where: { id: price.id },
        data: {
          priceUsdInt: usdToInt(price.priceUsd)
        }
      });
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateToIntegers().catch(console.error);
