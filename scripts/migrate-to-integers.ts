#!/usr/bin/env tsx
/**
 * Data migration script to populate integer fields from existing float fields
 * Run this after the schema migration to convert existing data
 */

import { PrismaClient } from '@prisma/client'
import { 
  btcToSatoshi, 
  usdToInt, 
  inrToInt, 
  usdInrRateToInt 
} from '../src/lib/currencyUtils'

const prisma = new PrismaClient()

async function migrateTransactionData() {
  console.log('🔄 Starting migration of transaction data to integer fields...')
  
  // Get all transactions that need migration (where integer fields are null)
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { inrAmountInt: null },
        { inrBalanceAfterInt: null },
        { btcBalanceAfterSat: null }
      ]
    }
  })

  console.log(`📊 Found ${transactions.length} transactions to migrate`)

  let migrated = 0
  const batchSize = 100

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize)
    
    const updates = batch.map(transaction => {
      return prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          // Convert float fields to integer fields
          btcAmountSatoshi: transaction.btcAmount ? btcToSatoshi(transaction.btcAmount) : null,
          btcPriceUsdInt: transaction.btcPriceUsd ? usdToInt(transaction.btcPriceUsd) : null,
          btcPriceInrInt: transaction.btcPriceInr ? inrToInt(transaction.btcPriceInr) : null,
          usdInrRateInt: transaction.usdInrRate ? usdInrRateToInt(transaction.usdInrRate) : null,
          inrAmountInt: inrToInt(transaction.inrAmount),
          inrBalanceAfterInt: inrToInt(transaction.inrBalanceAfter),
          btcBalanceAfterSat: btcToSatoshi(transaction.btcBalanceAfter)
        }
      })
    })

    await Promise.all(updates)
    migrated += batch.length
    
    console.log(`✅ Migrated ${migrated}/${transactions.length} transactions`)
  }

  console.log('🎉 Transaction migration completed!')
}

async function migrateBtcPriceData() {
  console.log('🔄 Starting migration of BTC price data...')
  
  const prices = await prisma.btcPrice.findMany({
    where: { priceUsdInt: null }
  })

  console.log(`📊 Found ${prices.length} BTC prices to migrate`)

  const updates = prices.map(price => {
    return prisma.btcPrice.update({
      where: { id: price.id },
      data: {
        priceUsdInt: usdToInt(price.priceUsd)
      }
    })
  })

  await Promise.all(updates)
  console.log('🎉 BTC price migration completed!')
}

async function main() {
  try {
    await migrateTransactionData()
    await migrateBtcPriceData()
    
    console.log('✨ All data migration completed successfully!')
    console.log('💡 Integer fields are now populated alongside existing float fields')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
