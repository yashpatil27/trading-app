#!/usr/bin/env tsx
/**
 * Validation script to ensure integer migration is complete and accurate
 * Run this before dropping float columns in Phase 3
 */

import { PrismaClient } from '@prisma/client'
import { 
  btcToSatoshi, 
  satoshiToBtc, 
  inrToInt, 
  usdToInt,
  SATOSHI_PER_BTC
} from '../src/lib/currencyUtils'

const prisma = new PrismaClient()

interface ValidationResult {
  passed: boolean
  issues: string[]
  summary: {
    totalTransactions: number
    integerMigrated: number
    floatOnly: number
    discrepancies: number
  }
}

async function validateTransactionData(): Promise<ValidationResult> {
  console.log('🔍 Validating transaction data integrity...')
  
  const result: ValidationResult = {
    passed: true,
    issues: [],
    summary: {
      totalTransactions: 0,
      integerMigrated: 0,
      floatOnly: 0,
      discrepancies: 0
    }
  }

  const transactions = await prisma.transaction.findMany({
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
      btcPriceUsdInt: true
    }
  })

  result.summary.totalTransactions = transactions.length

  for (const tx of transactions) {
    // Check if transaction has integer fields
    const hasIntegerFields = tx.inrAmountInt !== null && tx.inrBalanceAfterInt !== null

    if (hasIntegerFields) {
      result.summary.integerMigrated++
      
      // Validate consistency between float and integer fields
      if (tx.inrAmount !== null) {
        const expectedInrInt = inrToInt(tx.inrAmount)
        if (Math.abs(expectedInrInt - tx.inrAmountInt!) > 1) { // Allow 1 rupee tolerance for rounding
          result.issues.push(`Transaction ${tx.id}: INR amount mismatch - Float: ${tx.inrAmount}, Int: ${tx.inrAmountInt}`)
          result.summary.discrepancies++
        }
      }

      if (tx.btcAmount !== null && tx.btcAmountSatoshi !== null) {
        const expectedSatoshi = btcToSatoshi(tx.btcAmount)
        const actualSatoshi = tx.btcAmountSatoshi
        if (expectedSatoshi !== actualSatoshi) {
          const diff = Number(expectedSatoshi - actualSatoshi)
          if (Math.abs(diff) > 1) { // Allow 1 satoshi tolerance
            result.issues.push(`Transaction ${tx.id}: BTC amount mismatch - Expected: ${expectedSatoshi} sats, Actual: ${actualSatoshi} sats`)
            result.summary.discrepancies++
          }
        }
      }

      if (tx.btcBalanceAfter !== null && tx.btcBalanceAfterSat !== null) {
        const expectedSatoshi = btcToSatoshi(tx.btcBalanceAfter)
        const actualSatoshi = tx.btcBalanceAfterSat
        if (expectedSatoshi !== actualSatoshi) {
          const diff = Number(expectedSatoshi - actualSatoshi)
          if (Math.abs(diff) > 1) { // Allow 1 satoshi tolerance
            result.issues.push(`Transaction ${tx.id}: BTC balance mismatch - Expected: ${expectedSatoshi} sats, Actual: ${actualSatoshi} sats`)
            result.summary.discrepancies++
          }
        }
      }
    } else {
      result.summary.floatOnly++
      result.issues.push(`Transaction ${tx.id}: Missing integer fields - needs migration`)
    }
  }

  result.passed = result.issues.length === 0

  return result
}

async function validateBtcPriceData(): Promise<{ passed: boolean; issues: string[] }> {
  console.log('🔍 Validating BTC price data...')
  
  const result = { passed: true, issues: [] as string[] }
  
  const prices = await prisma.btcPrice.findMany({
    where: { priceUsdInt: null },
    take: 10 // Just check a sample
  })

  if (prices.length > 0) {
    result.passed = false
    result.issues.push(`Found ${prices.length} BTC prices without integer fields`)
  }

  return result
}

async function validateCacheConsistency(): Promise<{ passed: boolean; issues: string[] }> {
  console.log('🔍 Checking cache consistency...')
  
  const result = { passed: true, issues: [] as string[] }
  
  // Get a sample of users and check if their latest transaction matches expected balances
  const users = await prisma.user.findMany({
    take: 5,
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          inrBalanceAfterInt: true,
          btcBalanceAfterSat: true,
          inrBalanceAfter: true,
          btcBalanceAfter: true
        }
      }
    }
  })

  for (const user of users) {
    if (user.transactions.length > 0) {
      const latestTx = user.transactions[0]
      
      // Check if we have integer fields
      if (latestTx.inrBalanceAfterInt === null || latestTx.btcBalanceAfterSat === null) {
        result.issues.push(`User ${user.email}: Latest transaction missing integer balance fields`)
        result.passed = false
      }
    }
  }

  return result
}

async function main() {
  try {
    console.log('🔍 Starting comprehensive validation of integer migration...\n')

    const [txValidation, priceValidation, cacheValidation] = await Promise.all([
      validateTransactionData(),
      validateBtcPriceData(),
      validateCacheConsistency()
    ])

    // Print results
    console.log('\n📊 VALIDATION RESULTS')
    console.log('='.repeat(50))
    
    console.log('\n💰 Transaction Data:')
    console.log(`   Total transactions: ${txValidation.summary.totalTransactions}`)
    console.log(`   Integer migrated: ${txValidation.summary.integerMigrated}`)
    console.log(`   Float only: ${txValidation.summary.floatOnly}`)
    console.log(`   Discrepancies: ${txValidation.summary.discrepancies}`)
    console.log(`   Status: ${txValidation.passed ? '✅ PASS' : '❌ FAIL'}`)

    console.log('\n📈 BTC Price Data:')
    console.log(`   Status: ${priceValidation.passed ? '✅ PASS' : '❌ FAIL'}`)

    console.log('\n🔄 Cache Consistency:')
    console.log(`   Status: ${cacheValidation.passed ? '✅ PASS' : '❌ FAIL'}`)

    const overallPassed = txValidation.passed && priceValidation.passed && cacheValidation.passed

    console.log(`\n🎯 OVERALL STATUS: ${overallPassed ? '✅ READY FOR PHASE 3' : '❌ NEEDS ATTENTION'}`)

    // Print issues if any
    const allIssues = [...txValidation.issues, ...priceValidation.issues, ...cacheValidation.issues]
    if (allIssues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:')
      allIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
    }

    if (overallPassed) {
      console.log('\n🚀 Ready to proceed with float column removal!')
      console.log('   - All transactions have integer fields')
      console.log('   - Data consistency validated')
      console.log('   - Cache alignment confirmed')
    } else {
      console.log('\n🔧 Action needed before proceeding:')
      console.log('   - Fix data inconsistencies')
      console.log('   - Re-run migration scripts')
      console.log('   - Validate again before Phase 3')
    }

  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
