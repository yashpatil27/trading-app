import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSystemRates() {
  // Initialize with current rates (88 buy, 91 sell)
  const buyRate = 88.0;
  const sellRate = 91.0;
  
  // Create or update the single row
  await prisma.systemRates.upsert({
    where: { id: 1 },
    update: {
      usdInrBuyRate: buyRate,
      usdInrSellRate: sellRate,
      usdInrBuyRateInt: Math.round(buyRate * 10000), // 880000
      usdInrSellRateInt: Math.round(sellRate * 10000), // 910000
    },
    create: {
      id: 1,
      usdInrBuyRate: buyRate,
      usdInrSellRate: sellRate,
      usdInrBuyRateInt: Math.round(buyRate * 10000),
      usdInrSellRateInt: Math.round(sellRate * 10000),
    },
  });

  console.log('System rates seeded:', {
    buyRate,
    sellRate,
    buyRateInt: Math.round(buyRate * 10000),
    sellRateInt: Math.round(sellRate * 10000),
  });
}

seedSystemRates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
