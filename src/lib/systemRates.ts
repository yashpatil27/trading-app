import { PrismaClient } from '@prisma/client';
import { redis } from './redis';

const prisma = new PrismaClient();

export interface SystemRates {
  usdInrBuyRate: number;
  usdInrSellRate: number;
  usdInrBuyRateInt: number;
  usdInrSellRateInt: number;
}

class SystemRatesService {
  private static instance: SystemRatesService;

  private constructor() {}

  public static getInstance(): SystemRatesService {
    if (!SystemRatesService.instance) {
      SystemRatesService.instance = new SystemRatesService();
    }
    return SystemRatesService.instance;
  }

  // Get rates from Redis cache, fallback to database
  async getRates(): Promise<SystemRates> {
    try {
      // Try to get from Redis first
      const [buyRate, sellRate, buyRateInt, sellRateInt] = await redis.mget([
        'usd_inr_buy_rate',
        'usd_inr_sell_rate',
        'usd_inr_buy_rate_int',
        'usd_inr_sell_rate_int'
      ]);

      // If all values exist in Redis, return them
      if (buyRate && sellRate && buyRateInt && sellRateInt) {
        return {
          usdInrBuyRate: parseFloat(buyRate),
          usdInrSellRate: parseFloat(sellRate),
          usdInrBuyRateInt: parseInt(buyRateInt),
          usdInrSellRateInt: parseInt(sellRateInt),
        };
      }

      // Fallback to database if cache miss
      console.log('Cache miss - fetching rates from database');
      return await this.getRatesFromDatabase();
    } catch (error) {
      console.error('Error getting rates from Redis, falling back to database:', error);
      return await this.getRatesFromDatabase();
    }
  }

  // Get rates directly from database
  async getRatesFromDatabase(): Promise<SystemRates> {
    const rates = await prisma.systemRates.findUnique({
      where: { id: 1 },
    });

    if (!rates) {
      throw new Error('System rates not found in database');
    }

    // Cache the rates in Redis for future use
    await this.cacheRates(rates);

    return {
      usdInrBuyRate: rates.usdInrBuyRate,
      usdInrSellRate: rates.usdInrSellRate,
      usdInrBuyRateInt: rates.usdInrBuyRateInt,
      usdInrSellRateInt: rates.usdInrSellRateInt,
    };
  }

  // Update rates in database and cache
  async updateRates(buyRate: number, sellRate: number): Promise<SystemRates> {
    const buyRateInt = Math.round(buyRate * 10000);
    const sellRateInt = Math.round(sellRate * 10000);

    // Update database
    const updatedRates = await prisma.systemRates.upsert({
      where: { id: 1 },
      update: {
        usdInrBuyRate: buyRate,
        usdInrSellRate: sellRate,
        usdInrBuyRateInt: buyRateInt,
        usdInrSellRateInt: sellRateInt,
      },
      create: {
        id: 1,
        usdInrBuyRate: buyRate,
        usdInrSellRate: sellRate,
        usdInrBuyRateInt: buyRateInt,
        usdInrSellRateInt: sellRateInt,
      },
    });

    // Update cache
    await this.cacheRates(updatedRates);

    return {
      usdInrBuyRate: updatedRates.usdInrBuyRate,
      usdInrSellRate: updatedRates.usdInrSellRate,
      usdInrBuyRateInt: updatedRates.usdInrBuyRateInt,
      usdInrSellRateInt: updatedRates.usdInrSellRateInt,
    };
  }

  // Cache rates in Redis
  private async cacheRates(rates: any): Promise<void> {
    try {
      await redis.mset({
        'usd_inr_buy_rate': rates.usdInrBuyRate.toString(),
        'usd_inr_sell_rate': rates.usdInrSellRate.toString(),
        'usd_inr_buy_rate_int': rates.usdInrBuyRateInt.toString(),
        'usd_inr_sell_rate_int': rates.usdInrSellRateInt.toString(),
      });
    } catch (error) {
      console.error('Error caching rates in Redis:', error);
      // Don't throw - caching failure shouldn't break the operation
    }
  }

  // Initialize cache on startup
  async initializeCache(): Promise<void> {
    try {
      const rates = await this.getRatesFromDatabase();
      console.log('System rates cache initialized:', rates);
    } catch (error) {
      console.error('Failed to initialize system rates cache:', error);
    }
  }
}

// Export singleton instance
export const systemRatesService = SystemRatesService.getInstance();
