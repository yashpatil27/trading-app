'use client'

import { X, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

interface Trade {
  id: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  total: number
  btcPrice: number
  createdAt: string
}

interface TradeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  trade: Trade | null
}

export default function TradeDetailModal({ isOpen, onClose, trade }: TradeDetailModalProps) {
  if (!isOpen || !trade) return null

  // Format cash with Indian comma system
  const formatCash = (amount: number) => {
    return Math.floor(amount).toLocaleString('en-IN')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">
        {/* Header with Trade Status */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {trade.type === 'BUY' ? (
              <TrendingUp className="text-green-500" size={20} />
            ) : (
              <TrendingDown className="text-red-500" size={20} />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {trade.type} Order
              </h2>
              <div className="text-xs sm:text-sm text-gray-400">ID: {trade.id.slice(-8)}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Trade Details - Compact Layout */}
          <div className="space-y-4">
            {/* Bitcoin Amount */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <BitcoinIcon style={{height: "16px", width: "16px", color: "#F7931A"}} />
                <div>
                  <div className="text-xs text-gray-400">Bitcoin Amount</div>
                  <div className="text-sm font-semibold text-white">{trade.amount.toFixed(8).replace(/\.?0+$/, '')} ₿</div>
                </div>
              </div>
            </div>

            {/* Rate & Total - Combined Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="text-green-500" size={14} />
                  <div className="text-xs text-gray-400">Rate</div>
                </div>
                <div className="text-sm font-semibold text-white">₹{formatCash(trade.price)}</div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="text-blue-500" size={14} />
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="text-sm font-semibold text-white">₹{formatCash(trade.total)}</div>
              </div>
            </div>

            {/* BTC Price & Date - Combined Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BitcoinIcon style={{height: "14px", width: "14px", color: "#EAB308"}} />
                  <div className="text-xs text-gray-400">₿/USD Price</div>
                </div>
                <div className="text-sm font-semibold text-white">${trade.btcPrice.toLocaleString('en-US')}</div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="text-purple-500" size={14} />
                  <div className="text-xs text-gray-400">Date</div>
                </div>
                <div className="text-xs font-semibold text-white">
                  {new Date(trade.createdAt).toLocaleDateString('en-IN')}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(trade.createdAt).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Summary */}
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Summary</div>
            <div className="text-xs text-white leading-relaxed">
              {trade.type === 'BUY' 
                ? `Bought ${trade.amount.toFixed(8).replace(/\.?0+$/, '')} ₿ for ₹${formatCash(trade.total)}`
                : `Sold ${trade.amount.toFixed(8).replace(/\.?0+$/, '')} ₿ for ₹${formatCash(trade.total)}`
              }
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
