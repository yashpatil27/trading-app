'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, LogOut, Home, Plus, Minus, ArrowDownLeft, ArrowUpRight, ArrowUp, ArrowDown, Wallet, Settings, Clock, PieChart, TrendingUp, DollarSign, Target, Calendar, BarChart3, Award, Calculator, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import { signOut } from 'next-auth/react'
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice'
import { PerformanceCalculator } from '@/lib/performanceCalculations'
import BuyModal from '@/components/BuyModal'
import SellModal from '@/components/SellModal'
import TradeTransactionModal from '@/components/TradeTransactionModal'
import DepositDetailModal from '@/components/DepositDetailModal'
import PinConfirmationModal from '@/components/PinConfirmationModal'

interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'DEPOSIT_INR' | 'DEPOSIT_BTC' | 'WITHDRAWAL_INR' | 'WITHDRAWAL_BTC' | 'ADMIN'
  category: 'TRADE' | 'BALANCE'
  amount: number
  price?: number
  total: number
  btcPrice?: number
  reason: string
  balance?: number
  btcBalance?: number
  createdAt: string
}

interface User {
  balance: number
  btcAmount: number
}

interface PortfolioStats {
  totalValue: number
  cashValue: number
  btcValue: number
  btcValueInr: number
  profitLoss: number
  profitLossPercentage: number
}

interface PerformanceMetrics {
  totalRealizedPnL: number
  totalTradingVolume: number
  totalTrades: number
  averageTradeSize: number
  winRate: number
  monthlyStats: {
    trades: number
    volume: number
    realizedPnL: number
  }
  costBasis: number
  unrealizedPnL: number
  totalReturn: number
  totalReturnPercentage: number
  portfolioValueHistory: { date: string; value: number }[]
}

type TabType = 'dashboard' | 'history' | 'portfolio'

// Portfolio Overview Component
const PortfolioOverview = ({ 
  user, 
  btcPrice, 
  portfolioStats,
  performanceMetrics,
  formatCash, 
  formatBtc,
  formatPercentage
}: {
  user: User | null
  btcPrice: any
  portfolioStats: PortfolioStats | null
  performanceMetrics: PerformanceMetrics | null
  formatCash: (amount: number) => string
  formatBtc: (amount: number) => string
  formatPercentage: (percent: number) => string
}) => {

  // Calculate trading statistics
  const getTradingDays = () => {
    if (!performanceMetrics?.portfolioValueHistory) return 0
    const firstTrade = performanceMetrics.portfolioValueHistory[0]
    if (!firstTrade) return 0
    const daysSinceFirst = Math.floor((Date.now() - new Date(firstTrade.date).getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, daysSinceFirst)
  }

  const getProfitableDays = () => {
    // This is a simplified calculation - in reality you'd track daily P&L
    // For now, we'll estimate based on win rate and total trades
    const totalTrades = performanceMetrics?.totalTrades || 0
    const winRate = performanceMetrics?.winRate || 0
    return Math.floor((totalTrades * winRate) / 100)
  }

  const getBestWorstTrade = () => {
    // This would require individual trade P&L tracking
    // For now, we'll show estimated values based on portfolio performance
    const avgTradeSize = performanceMetrics?.averageTradeSize || 0
    const totalPnL = performanceMetrics?.totalRealizedPnL || 0
    const totalTrades = performanceMetrics?.totalTrades || 1
    
    const avgPnLPerTrade = totalTrades > 0 ? totalPnL / totalTrades : 0
    const bestTrade = Math.max(avgPnLPerTrade * 2, 0) // Estimate
    const worstTrade = Math.min(avgPnLPerTrade * -1, 0) // Estimate
    
    return { best: bestTrade, worst: worstTrade }
  }

  const breakEvenPrice = () => {
    if (!user?.btcAmount || user.btcAmount === 0) return 0
    return performanceMetrics?.costBasis || 0
  }

  const priceTargets = () => {
    const currentPrice = btcPrice?.sellRate || 0
    const avgCost = performanceMetrics?.costBasis || 0
    const profitZone = avgCost * 1.1 // 10% profit target
    const lossZone = avgCost * 0.9 // 10% loss threshold
    
    return {
      currentPrice,
      avgCost,
      profitZone,
      lossZone,
      isInProfit: currentPrice > avgCost,
      profitPercentage: avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0
    }
  }

  const tradingDays = getTradingDays()
  const profitableDays = getProfitableDays()
  const { best: bestTrade, worst: worstTrade } = getBestWorstTrade()
  const targets = priceTargets()

  return (
    <>
      {/* Portfolio Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Portfolio Overview</h2>
        <p className="text-gray-400 text-sm">Your investment summary</p>
      </div>

      {/* Total Portfolio Value Card */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="text-white" size={24} />
          <span className="text-white font-bold text-lg">Total Portfolio Value</span>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          ₹{portfolioStats ? formatCash(portfolioStats.totalValue) : '0'}
        </div>
        <div className="text-sm text-gray-300">
          Cash + Bitcoin (at current sell rate)
        </div>
        {performanceMetrics && (
          <div className={`text-sm mt-2 ${performanceMetrics.totalReturn >= 0 ? 'text-white' : 'text-white'}`}>
            Total Return: {formatPercentage(performanceMetrics.totalReturnPercentage)}
          </div>
        )}
      </div>

      {/* Asset Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cash Holdings */}
        <div className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-white" size={20} />
            <span className="text-white font-bold">Cash</span>
          </div>
          <div className="text-xl font-bold mb-1">₹{formatCash(user?.balance || 0)}</div>
          <div className="text-xs text-gray-400">
            {portfolioStats && portfolioStats.totalValue > 0 
              ? `${((portfolioStats.cashValue / portfolioStats.totalValue) * 100).toFixed(1)}% of portfolio`
              : '0% of portfolio'
            }
          </div>
        </div>

        {/* Bitcoin Holdings */}
        <div className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BitcoinIcon style={{height: "20px", width: "20px", color: "#FFFFFF"}} />
            <span className="text-white font-bold">Bitcoin</span>
          </div>
          <div className="text-xl font-bold mb-1">{formatBtc(user?.btcAmount || 0)}</div>
          <div className="text-xs text-gray-400">
            ≈ ₹{portfolioStats ? formatCash(portfolioStats.btcValueInr) : '0'}
          </div>
          <div className="text-xs text-gray-400">
            {portfolioStats && portfolioStats.totalValue > 0 
              ? `${((portfolioStats.btcValueInr / portfolioStats.totalValue) * 100).toFixed(1)}% of portfolio`
              : '0% of portfolio'
            }
          </div>
          {performanceMetrics && user?.btcAmount && user.btcAmount > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              Avg Cost: ₹{formatCash(performanceMetrics.costBasis)}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Analytics */}
      <div className="space-y-4">
        {/* Performance Card */}
        <div className="bg-black rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-white" size={20} />
            <span className="text-white font-bold">Performance</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceMetrics?.totalRealizedPnL && performanceMetrics.totalRealizedPnL >= 0 ? 'text-white' : 'text-white'}`}>
                ₹{performanceMetrics ? formatCash(performanceMetrics.totalRealizedPnL) : '0'}
              </div>
              <div className="text-xs text-gray-500">Realized P&L</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceMetrics?.unrealizedPnL && performanceMetrics.unrealizedPnL >= 0 ? 'text-white' : 'text-white'}`}>
                ₹{performanceMetrics ? formatCash(performanceMetrics.unrealizedPnL) : '0'}
              </div>
              <div className="text-xs text-gray-500">Unrealized P&L</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-300">
                {performanceMetrics ? formatPercentage(performanceMetrics.totalReturnPercentage) : '0%'}
              </div>
              <div className="text-xs text-gray-500">Total Return</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-300">
                {performanceMetrics ? formatPercentage(performanceMetrics.winRate) : '0%'}
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Asset Allocation Chart */}
        <div className="bg-black rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-white" size={20} />
            <span className="text-white font-bold">Asset Allocation</span>
          </div>
          <div className="space-y-3">
            {/* Cash Allocation Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white">Cash (INR)</span>
                <span className="text-gray-400">
                  {portfolioStats && portfolioStats.totalValue > 0 
                    ? `${((portfolioStats.cashValue / portfolioStats.totalValue) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{
                    width: portfolioStats && portfolioStats.totalValue > 0 
                      ? `${(portfolioStats.cashValue / portfolioStats.totalValue) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Bitcoin Allocation Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white">Bitcoin</span>
                <span className="text-gray-400">
                  {portfolioStats && portfolioStats.totalValue > 0 
                    ? `${((portfolioStats.btcValueInr / portfolioStats.totalValue) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full" 
                  style={{
                    width: portfolioStats && portfolioStats.totalValue > 0 
                      ? `${(portfolioStats.btcValueInr / portfolioStats.totalValue) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Activity Summary */}
        <div className="bg-black rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-white" size={20} />
            <span className="text-white font-bold">Trading Activity</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-zinc-800 rounded-lg">
              <div className="text-lg font-bold text-gray-300">
                {performanceMetrics ? performanceMetrics.totalTrades : 0}
              </div>
              <div className="text-xs text-gray-500">Total Trades</div>
            </div>
            <div className="text-center p-3 bg-zinc-800 rounded-lg">
              <div className="text-lg font-bold text-gray-300">
                ₹{performanceMetrics ? formatCash(performanceMetrics.totalTradingVolume) : '0'}
              </div>
              <div className="text-xs text-gray-500">Total Volume</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-zinc-800 rounded-lg">
              <div className="text-lg font-bold text-gray-300">
                {performanceMetrics ? performanceMetrics.monthlyStats.trades : 0}
              </div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
            <div className="text-center p-3 bg-zinc-800 rounded-lg">
              <div className="text-lg font-bold text-gray-300">
                ₹{performanceMetrics ? formatCash(performanceMetrics.averageTradeSize) : '0'}
              </div>
              <div className="text-xs text-gray-500">Avg Trade Size</div>
            </div>
          </div>
        </div>

        {/* Cost Basis Analysis */}
        <div className="bg-black rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-white" size={20} />
            <span className="text-white font-bold">Cost Basis Analysis</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-zinc-800 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Average Buy Price</span>
                <span className="text-sm font-bold text-white">₹{formatCash(performanceMetrics?.costBasis || 0)}</span>
              </div>
              <div className="text-xs text-gray-400">Your weighted average purchase price</div>
            </div>
            
            <div className="p-3 bg-zinc-800 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Break-even Price</span>
                <span className="text-sm font-bold text-white">₹{formatCash(breakEvenPrice())}</span>
              </div>
              <div className="text-xs text-gray-400">Price needed to break even</div>
            </div>

            {user?.btcAmount && user.btcAmount > 0 && (
              <div className="p-3 bg-zinc-800 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300">Current P&L Zone</span>
                  <div className="flex items-center gap-1">
                    {targets.isInProfit ? (
                      <TrendingUpIcon className="text-white" size={16} />
                    ) : (
                      <TrendingDownIcon className="text-white" size={16} />
                    )}
                    <span className={`text-sm font-bold ${targets.isInProfit ? 'text-white' : 'text-white'}`}>
                      {formatPercentage(targets.profitPercentage)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Current price vs your average cost
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trading Statistics */}
        <div className="bg-black rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-white" size={20} />
            <span className="text-white font-bold">Trading Statistics</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-300">{tradingDays}</div>
              <div className="text-xs text-gray-400">Days Trading</div>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-300">{profitableDays}</div>
              <div className="text-xs text-gray-400">Profitable Days</div>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white">+₹{formatCash(Math.abs(bestTrade))}</div>
              <div className="text-xs text-gray-400">Best Trade</div>
            </div>
            <div className="p-3 bg-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white">-₹{formatCash(Math.abs(worstTrade))}</div>
              <div className="text-xs text-gray-400">Worst Trade</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Trading Interface Component
const TradingInterface = ({ 
  user, 
  btcPrice, 
  isConnected, 
  countdown,
  formatCash, 
  formatBtc, 
  formatUSD,
  setShowBuyModal,
  setShowSellModal,
  recentTransactions,
  getTransactionIcon,
  getTransactionColor,
  handleTransactionClick
}: {
  user: User | null
  btcPrice: any
  isConnected: boolean
  countdown: number
  formatCash: (amount: number) => string
  formatBtc: (amount: number) => string
  formatUSD: (amount: number) => string
  setShowBuyModal: (show: boolean) => void
  setShowSellModal: (show: boolean) => void
  recentTransactions: Transaction[]
  getTransactionIcon: (transaction: Transaction) => JSX.Element
  getTransactionColor: (transaction: Transaction) => string
  handleTransactionClick: (transaction: Transaction) => void
}) => {
  return (
    <>
      {/* Portfolio Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cash Balance */}
        <div className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="text-white" width={20} height={20} />
            <span className="text-white font-bold">Cash</span>
          </div>
          <div className="text-xl font-bold">₹{formatCash(user?.balance || 0)}</div>
        </div>

        {/* Bitcoin Holdings */}
        <div className="bg-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BitcoinIcon style={{height: "20px", width: "20px", color: "#FFFFFF"}} />
            <span className="text-white font-bold">Bitcoin</span>
          </div>
          <div className="text-xl font-bold">{formatBtc(user?.btcAmount || 0)}</div>
          <div className="text-xs text-gray-400">
            ≈ ₹{btcPrice ? formatCash((user?.btcAmount || 0) * btcPrice.sellRate) : "0"}
          </div>
        </div>
      </div>

      {/* Bitcoin Price Card */}
      {btcPrice && (
        <div className="bg-zinc-800 rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-white font-bold text-lg">Bitcoin Price</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${formatUSD(btcPrice.btcUSD)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="bg-white px-3 py-1 rounded-full flex items-center gap-2">
                <Clock size={12} className="text-black" />
                <span className="text-xs text-black">Next update: {countdown}s</span>
              </div>
            </div>
            {btcPrice.note && (
              <div className="text-xs text-white mt-1">{btcPrice.note}</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-white font-bold text-lg">Buy Rate</div>
              <div className="text-white font-semibold">₹{formatCash(btcPrice.buyRate)}</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg">Sell Rate</div>
              <div className="text-white font-semibold">₹{formatCash(btcPrice.sellRate)}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            Last updated: {new Date(btcPrice.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowBuyModal(true)}
          disabled={!isConnected || !btcPrice || Math.floor(user?.balance || 0) === 0}
          className="bg-white hover:bg-gray-200 disabled:bg-gray-300 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Buy
        </button>
        <button
          onClick={() => setShowSellModal(true)}
          disabled={!isConnected || !btcPrice || (user?.btcAmount || 0) === 0}
          className="bg-white hover:bg-gray-200 disabled:bg-gray-300 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Minus size={20} />
          Sell
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-black rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <History size={20} />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <BitcoinIcon style={{height: "48px", width: "48px", color: "#6B7280"}} />
              <div>No activity yet</div>
              <div className="text-sm">Start trading to see your history</div>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                onClick={() => handleTransactionClick(transaction)}
                className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getTransactionColor(transaction)}`}>
                        {transaction.type === "BUY" ? `BUY ${formatBtc(transaction.amount)}` : transaction.type === "SELL" ? `SELL ${formatBtc(transaction.amount)}` : ({BUY: "BUY", SELL: "SELL", DEPOSIT_INR: "Cash Deposit", DEPOSIT_BTC: "BTC Deposit", WITHDRAWAL_INR: "Cash Withdrawal", WITHDRAWAL_BTC: "BTC Withdrawal", ADMIN: "Admin"}[transaction.type] || transaction.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {transaction.category === 'BALANCE' ? (
                      // For balance transactions, show appropriate amounts based on transaction type
                      (() => {
                        switch (transaction.type) {
                          case 'DEPOSIT_BTC':
                            return <>+{formatBtc(Math.abs(transaction.amount))}</>
                          case 'WITHDRAWAL_BTC':
                            return <>-{formatBtc(Math.abs(transaction.amount))}</>
                          case 'DEPOSIT_INR':
                            return <>+₹{formatCash(Math.abs(transaction.total))}</>
                          case 'WITHDRAWAL_INR':
                            return <>-₹{formatCash(Math.abs(transaction.total))}</>
                          case 'ADMIN':
                            // ADMIN transactions could be either BTC or INR, check which one has value
                            if (transaction.amount > 0 && transaction.total === 0) {
                              return <>{formatBtc(Math.abs(transaction.amount))}</>
                            } else {
                              return <>₹{formatCash(Math.abs(transaction.total))}</>
                            }
                          default:
                            return <>₹{formatCash(Math.abs(transaction.total))}</>
                        }
                      })()
                    ) : (
                      // Trade transactions show INR total
                      `₹${formatCash(transaction.total)}`
                    )}
                  </div>
                  {transaction.category === 'TRADE' && transaction.price && (
                    <div className="text-xs text-gray-400">
                      @₹{formatCash(transaction.price)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

// Transaction History Component
const TransactionHistory = ({ 
  transactions,
  formatCash, 
  formatBtc,
  getTransactionIcon,
  getTransactionColor,
  handleTransactionClick,
  setActiveTab
}: {
  transactions: Transaction[]
  formatCash: (amount: number) => string
  formatBtc: (amount: number) => string
  getTransactionIcon: (transaction: Transaction) => JSX.Element
  getTransactionColor: (transaction: Transaction) => string
  handleTransactionClick: (transaction: Transaction) => void
  setActiveTab: (tab: TabType) => void
}) => {
  return (
    <div className="bg-black rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <History size={24} />
        <h2 className="text-xl font-semibold">Complete Transaction History</h2>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            <BitcoinIcon style={{height: "64px", width: "64px", color: "#6B7280"}} />
            <div className="text-lg mb-2">No transactions yet</div>
            <div className="text-sm">Your transaction history will appear here</div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="mt-4 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Start Trading
            </button>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              onClick={() => handleTransactionClick(transaction)}
              className="flex justify-between items-center p-4 bg-zinc-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${getTransactionColor(transaction)}`}>
                      {transaction.type === "BUY" ? `BUY ${formatBtc(transaction.amount)}` : transaction.type === "SELL" ? `SELL ${formatBtc(transaction.amount)}` : ({BUY: "BUY", SELL: "SELL", DEPOSIT_INR: "Cash Deposit", DEPOSIT_BTC: "BTC Deposit", WITHDRAWAL_INR: "Cash Withdrawal", WITHDRAWAL_BTC: "BTC Withdrawal", ADMIN: "Admin"}[transaction.type] || transaction.type)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {transaction.category === 'BALANCE' ? (
                      // For balance transactions, show appropriate amounts based on transaction type
                      (() => {
                        switch (transaction.type) {
                          case 'DEPOSIT_BTC':
                            return <>+{formatBtc(Math.abs(transaction.amount))}</>
                          case 'WITHDRAWAL_BTC':
                            return <>-{formatBtc(Math.abs(transaction.amount))}</>
                          case 'DEPOSIT_INR':
                            return <>+₹{formatCash(Math.abs(transaction.total))}</>
                          case 'WITHDRAWAL_INR':
                            return <>-₹{formatCash(Math.abs(transaction.total))}</>
                          case 'ADMIN':
                            // ADMIN transactions could be either BTC or INR, check which one has value
                            if (transaction.amount > 0 && transaction.total === 0) {
                              return <>{formatBtc(Math.abs(transaction.amount))}</>
                            } else {
                              return <>₹{formatCash(Math.abs(transaction.total))}</>
                            }
                          default:
                            return <>₹{formatCash(Math.abs(transaction.total))}</>
                        }
                      })()
                    ) : (
                      // Trade transactions show INR total
                      `₹${formatCash(transaction.total)}`
                    )}
                </div>
                {transaction.category === 'TRADE' && transaction.price && (
                  <div className="text-xs text-gray-400">
                    @₹{formatCash(transaction.price)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { price: btcPrice, isConnected, error, countdown } = useBitcoinPrice()
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  
  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null)

  // PIN modal states
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingTrade, setPendingTrade] = useState<{ type: 'BUY' | 'SELL', amount: number, btcAmount: number } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
      fetchTransactions()
      fetchPerformanceMetrics()
    }
  }, [session])

  useEffect(() => {
    if (user && btcPrice) {
      calculatePortfolioStats()
    }
  }, [user, btcPrice])

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/performance')
      if (response.ok) {
        const data = await response.json()
        setPerformanceMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
    }
  }

  const calculatePortfolioStats = () => {
    if (!user || !btcPrice) return

    const cashValue = user.balance
    const btcValueInr = user.btcAmount * btcPrice.sellRate
    const totalValue = cashValue + btcValueInr
    
    // Use performance metrics for P&L if available
    const profitLoss = performanceMetrics?.totalReturn || 0
    const profitLossPercentage = performanceMetrics?.totalReturnPercentage || 0

    setPortfolioStats({
      totalValue,
      cashValue,
      btcValue: user.btcAmount,
      btcValueInr,
      profitLoss,
      profitLossPercentage
    })
  }

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleTrade = async () => {
    if (!pendingTrade || !btcPrice) return

    setLoading(true)
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: pendingTrade.type,
          amount: pendingTrade.amount,
          btcPrice: btcPrice.btcUSD
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setShowBuyModal(false)
        setShowSellModal(false)
        setShowPinModal(false)
        setPendingTrade(null)
        fetchUserData()
        fetchTransactions()
        fetchPerformanceMetrics() // Refresh performance metrics after trade
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Trade error:', error)
      alert('Trade failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePinConfirm = async (pin: string) => {
    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })

      const result = await response.json()

      if (result.valid) {
        await handleTrade()
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('PIN confirmation error:', error)
      return false
    }
  }

  const initiateBuy = (inrAmount: number, btcAmount: number) => {
    setPendingTrade({ type: 'BUY', amount: inrAmount, btcAmount })
    setShowBuyModal(false)
    setShowPinModal(true)
  }

  const initiateSell = (btcAmount: number, inrAmount: number) => {
    setPendingTrade({ type: 'SELL', amount: btcAmount, btcAmount })
    setShowSellModal(false)
    setShowPinModal(true)
  }

  // Format cash balance with Indian comma system (lakhs, crores)
  const formatCash = (amount: number | undefined) => {
    const rounded = Math.floor(amount || 0)
    return rounded.toLocaleString('en-IN')
  }

  // Format BTC amount (remove trailing zeros, show 0 for zero amounts)
  const formatBtc = (amount: number | undefined) => {
    if (!amount || amount === 0) return '₿0'
    return `₿${amount.toFixed(8).replace(/\.?0+$/, '')}`
  }

  // Format USD price with thousand separators
  const formatUSD = (amount: number | undefined) => {
    return (amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  // Format percentage for display
  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(2)}%`
  }

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'BUY':
        return <ArrowUp className="text-white" width={20} height={20} />
      case 'SELL':
        return <ArrowDown className="text-white" width={20} height={20} />
      case 'DEPOSIT_INR':
        return <ArrowDownLeft className="text-white" size={20} />
      case 'DEPOSIT_BTC':
        return <BitcoinIcon style={{height: "20px", width: "20px", color: "#FFFFFF"}} />
      case 'WITHDRAWAL_INR':
        return <ArrowUpRight className="text-white" size={20} />
      case 'WITHDRAWAL_BTC':
        return <BitcoinIcon style={{height: "20px", width: "20px", color: "#FFFFFF"}} />
      case 'ADMIN':
        return <Settings className="text-white" size={20} />
      default:
        return <History className="text-gray-500" size={20} />
    }
  }

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.category === 'TRADE') {
      return transaction.type === 'BUY' ? 'text-white' : 'text-white'
    } else {
      return (transaction.type === 'DEPOSIT_INR' || transaction.type === 'DEPOSIT_BTC' || transaction.type === 'DEPOSIT') ? 'text-white' : 'text-white'
    }
  }

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.category === 'TRADE') {
      // Convert to trade format for the modal
      setSelectedTrade({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        price: transaction.price,
        total: transaction.total,
        btcPrice: transaction.btcPrice,
        createdAt: transaction.createdAt
      })
    } else {
      // Handle deposit/withdrawal transactions
      // Determine if this is a Bitcoin or INR transaction based on transaction data
      const isBitcoinTransaction = transaction.type.includes("BTC")
      const currency = isBitcoinTransaction ? 'BTC' : 'INR'
      
      setSelectedDeposit({
        id: transaction.id,
        type: transaction.type,
        amount: currency === 'INR' ? Math.abs(transaction.total) : Math.abs(transaction.amount),
        btcAmount: currency === 'BTC' ? Math.abs(transaction.amount) : 0,
        reason: transaction.reason,
        balance: transaction.balance || 0,
        btcBalance: transaction.btcBalance || 0,
        createdAt: transaction.createdAt,
        currency: currency
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="bg-black border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">₿itTrade</h1>
          </div>
          <div className="flex items-center gap-4">
            {session.user.role === 'ADMIN' && (
              <button
                onClick={() => router.push('/admin')}
                className="text-white hover:text-gray-300 transition-colors"
                title="ADMIN Panel"
              >
                <Settings size={24} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-white hover:text-gray-300 font-bold text-lg"
            >
              <LogOut size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Connection Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <TradingInterface
            user={user}
            btcPrice={btcPrice}
            isConnected={isConnected}
            countdown={countdown}
            formatCash={formatCash}
            formatBtc={formatBtc}
            formatUSD={formatUSD}
            setShowBuyModal={setShowBuyModal}
            setShowSellModal={setShowSellModal}
            recentTransactions={recentTransactions}
            getTransactionIcon={getTransactionIcon}
            getTransactionColor={getTransactionColor}
            handleTransactionClick={handleTransactionClick}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            formatCash={formatCash}
            formatBtc={formatBtc}
            getTransactionIcon={getTransactionIcon}
            getTransactionColor={getTransactionColor}
            handleTransactionClick={handleTransactionClick}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioOverview
            user={user}
            btcPrice={btcPrice}
            portfolioStats={portfolioStats}
            performanceMetrics={performanceMetrics}
            formatCash={formatCash}
            formatBtc={formatBtc}
            formatPercentage={formatPercentage}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800">
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === "dashboard" ? "tab-active" : "tab-inactive hover:text-white"
            }`}
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === "portfolio" ? "tab-active" : "tab-inactive hover:text-white"
            }`}
          >
            <PieChart size={20} />
            <span className="text-xs">Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === "history" ? "tab-active" : "tab-inactive hover:text-white"
            }`}
          >
            <History size={20} />
            <span className="text-xs">History</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {btcPrice && (
        <>
          <BuyModal
            isOpen={showBuyModal}
            onClose={() => setShowBuyModal(false)}
            onBuy={initiateBuy}
            availableBalance={user?.balance || 0}
            btcPrice={btcPrice.btcUSD}
            buyRate={btcPrice.buyRate}
            loading={loading}
            countdown={countdown}
          />

          <SellModal
            isOpen={showSellModal}
            onClose={() => setShowSellModal(false)}
            onSell={initiateSell}
            availableBtc={user?.btcAmount || 0}
            btcPrice={btcPrice.btcUSD}
            sellRate={btcPrice.sellRate}
            loading={loading}
            countdown={countdown}
          />
        </>
      )}

      <PinConfirmationModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false)
          setPendingTrade(null)
        }}
        onConfirm={handlePinConfirm}
        title="Confirm Your Trade"
        description="Please enter your 4-digit PIN to proceed with the trade."
        isLoading={loading}
      />

      <TradeTransactionModal
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        transaction={selectedTrade}
      />

      <DepositDetailModal
        isOpen={!!selectedDeposit}
        onClose={() => setSelectedDeposit(null)}
        transaction={selectedDeposit}
      />
    </div>
  )
}
