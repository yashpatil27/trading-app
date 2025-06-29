import { PrismaClient } from '@prisma/client';
import { redis } from '../src/lib/redis';

const prisma = new PrismaClient();

async function updateRatesInRedis() {
  const rates = await prisma.systemRates.findUnique({
    where: { id: 1 },
  });

  if (rates) {
    await redis.set('usd_inr_buy_rate', rates.usdInrBuyRate.toString());
    await redis.set('usd_inr_sell_rate', rates.usdInrSellRate.toString());
    await redis.set('usd_inr_buy_rate_int', rates.usdInrBuyRateInt.toString());
    await redis.set('usd_inr_sell_rate_int', rates.usdInrSellRateInt.toString());
    console.log('Rates updated in Redis:', {
      usdInrBuyRate: rates.usdInrBuyRate,
      usdInrSellRate: rates.usdInrSellRate,
      usdInrBuyRateInt: rates.usdInrBuyRateInt,
      usdInrSellRateInt: rates.usdInrSellRateInt,
    });
  } else {
    console.error('Rates not found in database.');
  }
}

async function getRatesFromRedis() {
  const [buyRate, sellRate, buyRateInt, sellRateInt] = await redis.mget([
    'usd_inr_buy_rate',
    'usd_inr_sell_rate', 
    'usd_inr_buy_rate_int',
    'usd_inr_sell_rate_int'
  ]);
  
  console.log('Rates retrieved from Redis:', { 
    buyRate: parseFloat(buyRate || '0'), 
    sellRate: parseFloat(sellRate || '0'),
    buyRateInt: parseInt(buyRateInt || '0'),
    sellRateInt: parseInt(sellRateInt || '0')
  });
}

// Example usage
updateRatesInRedis()
  .then(() => getRatesFromRedis())
  .catch((error) => console.error('Error handling Redis rates:', error))
  .finally(async () => {
    await prisma.$disconnect();
    await redis.disconnect();
  });
