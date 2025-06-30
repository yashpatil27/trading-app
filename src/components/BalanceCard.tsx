import React from 'react'
import { Wallet, TrendingUp } from 'lucide-react'

interface User {
  balance?: number
  btcAmount?: number
}

interface BalanceCardProps {
  user: User | null
  btcPrice: number | null
}

// Memoized component to prevent re-renders when balance hasn't changed
const BalanceCard = React.memo(({ user, btcPrice }: BalanceCardProps) => {
  if (!user) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="animate-spin h-4 w-4 border-2 border-zinc-300 border-t-blue-600 rounded-full"></div>
          <span className="text-sm">Loading balance...</span>
        </div>
      </div>
    )
  }

  const btcValueInINR = btcPrice ? (user.btcAmount || 0) * btcPrice : 0
  const totalPortfolioValue = (user.balance || 0) + btcValueInINR

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-white" />
        <h2 className="text-lg font-semibold text-zinc-900">Portfolio Balance</h2>
      </div>
      
      <div className="space-y-4">
        {/* INR Balance */}
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">INR Balance</span>
          <span className="text-xl font-semibold text-white">
            ₹{(user.balance || 0).toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* BTC Balance */}
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Bitcoin Balance</span>
          <div className="text-right">
            <div className="text-lg font-semibold text-zinc-100">
              ₿{(user.btcAmount || 0).toFixed(8)}
            </div>
            {btcPrice && (
              <div className="text-sm text-zinc-500">
                ≈ ₹{btcValueInINR.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>
        
        {/* Total Portfolio Value */}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="font-medium text-zinc-900">Total Value</span>
            </div>
            <span className="text-2xl font-semibold text-white">
              ₹{totalPortfolioValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

BalanceCard.displayName = 'BalanceCard'

export default BalanceCard
