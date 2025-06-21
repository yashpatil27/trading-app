/**
 * Currency conversion utilities for integer-based financial calculations
 * Provides safe conversion between floating-point and integer representations
 */

// Constants
export const SATOSHI_PER_BTC = 100_000_000 // 1 BTC = 100,000,000 satoshis
export const USD_INR_RATE_MULTIPLIER = 100 // Store rates like 91.50 as 9150

/**
 * Bitcoin conversions
 */
export const btcToSatoshi = (btc: number): bigint => {
  return BigInt(Math.round(btc * SATOSHI_PER_BTC))
}

export const satoshiToBtc = (satoshi: bigint): number => {
  return Number(satoshi) / SATOSHI_PER_BTC
}

/**
 * USD price conversions (round to whole dollars for simplicity)
 */
export const usdToInt = (usd: number): number => {
  return Math.round(usd)
}

export const intToUsd = (usdInt: number): number => {
  return usdInt
}

/**
 * INR conversions (already whole rupees in your system)
 */
export const inrToInt = (inr: number): number => {
  return Math.round(inr)
}

export const intToInr = (inrInt: number): number => {
  return inrInt
}

/**
 * USD/INR rate conversions (store as rate * 100 for 2 decimal places)
 */
export const usdInrRateToInt = (rate: number): number => {
  return Math.round(rate * USD_INR_RATE_MULTIPLIER)
}

export const intToUsdInrRate = (rateInt: number): number => {
  return rateInt / USD_INR_RATE_MULTIPLIER
}

/**
 * Format functions for display
 */
export const formatBtc = (satoshi: bigint): string => {
  const btc = satoshiToBtc(satoshi)
  return btc.toFixed(8) // Bitcoin standard 8 decimal places
}

export const formatInr = (inrInt: number): string => {
  return inrInt.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

export const formatUsd = (usdInt: number): string => {
  return usdInt.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

/**
 * Dual-mode transaction helper
 * Populates both float and integer fields during transition period
 */
export const createDualModeTransactionData = (data: {
  btcAmount?: number
  btcPriceUsd?: number
  btcPriceInr?: number
  usdInrRate?: number
  inrAmount: number
  inrBalanceAfter: number
  btcBalanceAfter: number
}) => {
  return {
    // Original float fields (for compatibility)
    btcAmount: data.btcAmount || null,
    btcPriceUsd: data.btcPriceUsd || null,
    btcPriceInr: data.btcPriceInr || null,
    usdInrRate: data.usdInrRate || null,
    inrAmount: data.inrAmount,
    inrBalanceAfter: data.inrBalanceAfter,
    btcBalanceAfter: data.btcBalanceAfter,
    
    // New integer fields (for precision)
    btcAmountSatoshi: data.btcAmount ? btcToSatoshi(data.btcAmount) : null,
    btcPriceUsdInt: data.btcPriceUsd ? usdToInt(data.btcPriceUsd) : null,
    btcPriceInrInt: data.btcPriceInr ? inrToInt(data.btcPriceInr) : null,
    usdInrRateInt: data.usdInrRate ? usdInrRateToInt(data.usdInrRate) : null,
    inrAmountInt: inrToInt(data.inrAmount),
    inrBalanceAfterInt: inrToInt(data.inrBalanceAfter),
    btcBalanceAfterSat: btcToSatoshi(data.btcBalanceAfter)
  }
}

/**
 * Helper to get balance from either integer or float fields
 * During migration, prefer integer fields when available
 */
export const getBalanceFromTransaction = (transaction: any): {
  inrBalance: number
  btcBalance: number
  usingIntegers: boolean
} => {
  // Prefer integer fields if available
  if (transaction.inrBalanceAfterInt !== null && transaction.btcBalanceAfterSat !== null) {
    return {
      inrBalance: transaction.inrBalanceAfterInt,
      btcBalance: satoshiToBtc(transaction.btcBalanceAfterSat),
      usingIntegers: true
    }
  }
  
  // Fallback to float fields
  return {
    inrBalance: transaction.inrBalanceAfter || 0,
    btcBalance: transaction.btcBalanceAfter || 0,
    usingIntegers: false
  }
}

/**
 * Enhanced dual-mode transaction helper with all required fields
 * Populates both float and integer fields during transition period
 */
export const createCompleteTransactionData = (data: {
  userId: string
  type: string
  btcAmount?: number
  btcPriceUsd?: number
  btcPriceInr?: number
  usdInrRate?: number
  inrAmount: number
  inrBalanceAfter: number
  btcBalanceAfter: number
  reason?: string
}) => {
  return {
    // Required fields
    userId: data.userId,
    type: data.type,
    reason: data.reason || null,
    
    // Original float fields (for compatibility)
    btcAmount: data.btcAmount || null,
    btcPriceUsd: data.btcPriceUsd || null,
    btcPriceInr: data.btcPriceInr || null,
    usdInrRate: data.usdInrRate || null,
    inrAmount: data.inrAmount,
    inrBalanceAfter: data.inrBalanceAfter,
    btcBalanceAfter: data.btcBalanceAfter,
    
    // New integer fields (for precision)
    btcAmountSatoshi: data.btcAmount ? btcToSatoshi(data.btcAmount) : null,
    btcPriceUsdInt: data.btcPriceUsd ? usdToInt(data.btcPriceUsd) : null,
    btcPriceInrInt: data.btcPriceInr ? inrToInt(data.btcPriceInr) : null,
    usdInrRateInt: data.usdInrRate ? usdInrRateToInt(data.usdInrRate) : null,
    inrAmountInt: inrToInt(data.inrAmount),
    inrBalanceAfterInt: inrToInt(data.inrBalanceAfter),
    btcBalanceAfterSat: btcToSatoshi(data.btcBalanceAfter)
  }
}
