/**
 * Performance calculation utilities for portfolio analytics
 * Based on transaction history and current holdings
 */

interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT'
  btcAmount: number | null
  btcPriceInr: number | null
  inrAmount: number
  inrBalanceAfter: number
  btcBalanceAfter: number
  createdAt: string
}

interface PerformanceMetrics {
  totalRealizedPnL: number
  totalTradingVolume: number
  totalTrades: number
  averageTradeSize: number
  winRate: number
  portfolioValueHistory: { date: string; value: number }[]
  monthlyStats: {
    trades: number
    volume: number
    realizedPnL: number
  }
  costBasis: number
  unrealizedPnL: number
  totalReturn: number
  totalReturnPercentage: number
}

export class PerformanceCalculator {
  private transactions: Transaction[]
  private currentBtcPrice: number

  constructor(transactions: Transaction[], currentBtcPrice: number) {
    this.transactions = transactions.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    this.currentBtcPrice = currentBtcPrice
  }

  /**
   * Calculate comprehensive performance metrics
   */
  calculateMetrics(): PerformanceMetrics {
    const tradeTransactions = this.transactions.filter(t => 
      t.type === 'BUY' || t.type === 'SELL'
    )

    const buyTransactions = tradeTransactions.filter(t => t.type === 'BUY')
    const sellTransactions = tradeTransactions.filter(t => t.type === 'SELL')

    // Calculate realized P&L using FIFO cost basis
    const { realizedPnL, costBasis, remainingHoldings } = this.calculateRealizedPnL()
    
    // Current portfolio value
    const currentTransaction = this.transactions[this.transactions.length - 1]
    const currentCash = currentTransaction?.inrBalanceAfter || 0
    const currentBtc = currentTransaction?.btcBalanceAfter || 0
    const currentPortfolioValue = currentCash + (currentBtc * this.currentBtcPrice)

    // Calculate unrealized P&L
    const unrealizedPnL = currentBtc > 0 ? (currentBtc * this.currentBtcPrice) - (currentBtc * costBasis) : 0

    // Trading statistics
    const totalTradingVolume = tradeTransactions.reduce((sum, t) => sum + t.inrAmount, 0)
    const totalTrades = tradeTransactions.length
    const averageTradeSize = totalTrades > 0 ? totalTradingVolume / totalTrades : 0

    // Win rate calculation
    const profitableSells = sellTransactions.filter(sell => {
      const avgCostBasis = this.getAverageCostBasisAtTime(sell.createdAt)
      return (sell.btcPriceInr || 0) > avgCostBasis
    })
    const winRate = sellTransactions.length > 0 ? (profitableSells.length / sellTransactions.length) * 100 : 0

    // Portfolio value history
    const portfolioValueHistory = this.calculatePortfolioValueHistory()

    // Monthly stats for current month
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const monthlyTransactions = tradeTransactions.filter(t => {
      const transactionDate = new Date(t.createdAt)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const monthlyStats = {
      trades: monthlyTransactions.length,
      volume: monthlyTransactions.reduce((sum, t) => sum + t.inrAmount, 0),
      realizedPnL: this.calculateMonthlyRealizedPnL(monthlyTransactions)
    }

    // Total return calculation
    const initialInvestment = this.calculateInitialInvestment()
    const totalReturn = realizedPnL + unrealizedPnL
    const totalReturnPercentage = initialInvestment > 0 ? (totalReturn / initialInvestment) * 100 : 0

    return {
      totalRealizedPnL: realizedPnL,
      totalTradingVolume,
      totalTrades,
      averageTradeSize,
      winRate,
      portfolioValueHistory,
      monthlyStats,
      costBasis,
      unrealizedPnL,
      totalReturn,
      totalReturnPercentage
    }
  }

  /**
   * Calculate realized P&L using FIFO (First In, First Out) cost basis
   */
  private calculateRealizedPnL(): { realizedPnL: number; costBasis: number; remainingHoldings: Array<{amount: number, price: number}> } {
    let realizedPnL = 0
    let holdings: Array<{amount: number, price: number, date: string}> = []

    for (const transaction of this.transactions) {
      if (transaction.type === 'BUY' && transaction.btcAmount && transaction.btcPriceInr) {
        // Add to holdings
        holdings.push({
          amount: transaction.btcAmount,
          price: transaction.btcPriceInr,
          date: transaction.createdAt
        })
      } else if (transaction.type === 'SELL' && transaction.btcAmount && transaction.btcPriceInr) {
        // Sell using FIFO
        let remainingToSell = transaction.btcAmount
        const sellPrice = transaction.btcPriceInr

        while (remainingToSell > 0 && holdings.length > 0) {
          const holding = holdings[0]
          const sellFromThisHolding = Math.min(remainingToSell, holding.amount)
          
          // Calculate P&L for this portion
          realizedPnL += sellFromThisHolding * (sellPrice - holding.price)
          
          // Update remaining amounts
          remainingToSell -= sellFromThisHolding
          holding.amount -= sellFromThisHolding
          
          // Remove holding if fully sold
          if (holding.amount <= 0) {
            holdings.shift()
          }
        }
      }
    }

    // Calculate weighted average cost basis of remaining holdings
    const totalRemainingAmount = holdings.reduce((sum, h) => sum + h.amount, 0)
    const totalRemainingValue = holdings.reduce((sum, h) => sum + (h.amount * h.price), 0)
    const costBasis = totalRemainingAmount > 0 ? totalRemainingValue / totalRemainingAmount : 0

    return {
      realizedPnL,
      costBasis,
      remainingHoldings: holdings.map(h => ({ amount: h.amount, price: h.price }))
    }
  }

  /**
   * Get average cost basis at a specific point in time
   */
  private getAverageCostBasisAtTime(timestamp: string): number {
    const transactionsUpToTime = this.transactions.filter(t => 
      new Date(t.createdAt).getTime() <= new Date(timestamp).getTime()
    )
    
    const calculator = new PerformanceCalculator(transactionsUpToTime, this.currentBtcPrice)
    const { costBasis } = calculator.calculateRealizedPnL()
    return costBasis
  }

  /**
   * Calculate portfolio value history over time
   */
  private calculatePortfolioValueHistory(): { date: string; value: number }[] {
    const history: { date: string; value: number }[] = []
    
    for (const transaction of this.transactions) {
      const cash = transaction.inrBalanceAfter
      const btc = transaction.btcBalanceAfter
      // Use historical BTC price if available, otherwise current price
      const btcPrice = transaction.btcPriceInr || this.currentBtcPrice
      const portfolioValue = cash + (btc * btcPrice)
      
      history.push({
        date: transaction.createdAt,
        value: portfolioValue
      })
    }
    
    return history
  }

  /**
   * Calculate monthly realized P&L
   */
  private calculateMonthlyRealizedPnL(monthlyTransactions: Transaction[]): number {
    const calculator = new PerformanceCalculator(monthlyTransactions, this.currentBtcPrice)
    const { realizedPnL } = calculator.calculateRealizedPnL()
    return realizedPnL
  }

  /**
   * Calculate initial investment amount (total deposits minus withdrawals)
   */
  private calculateInitialInvestment(): number {
    const deposits = this.transactions
      .filter(t => t.type === 'DEPOSIT' || t.type === 'ADMIN_CREDIT')
      .reduce((sum, t) => sum + t.inrAmount, 0)
    
    const withdrawals = this.transactions
      .filter(t => t.type === 'WITHDRAWAL' || t.type === 'ADMIN_DEBIT')
      .reduce((sum, t) => sum + t.inrAmount, 0)
    
    return deposits - withdrawals
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(percentage: number): string {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(2)}%`
  }
}

/**
 * Helper function to get performance metrics for a user
 */
export async function getUserPerformanceMetrics(
  userId: string, 
  currentBtcPrice: number
): Promise<PerformanceMetrics | null> {
  try {
    // This would typically fetch from your database
    // For now, returning null - you'd implement the actual data fetching
    return null
  } catch (error) {
    console.error('Error calculating performance metrics:', error)
    return null
  }
}
