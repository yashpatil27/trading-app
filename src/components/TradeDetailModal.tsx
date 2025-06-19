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
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {trade.type === 'BUY' ? (
              <TrendingUp className="text-green-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
            <h2 className="text-xl font-bold text-white">
              {trade.type} Order Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trade Status */}
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className={`text-lg font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {trade.type} Order Completed
            </div>
            <div className="text-sm text-gray-400 mt-1">Trade ID: {trade.id.slice(0, 8)}...</div>
          </div>

          {/* Trade Details */}
          <div className="space-y-4">
            {/* Bitcoin Amount */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <BitcoinIcon style={{height: "20px", width: "20px", color: "#F7931A"}} />
                <div>
                  <div className="text-sm text-gray-400">Bitcoin Amount</div>
                  <div className="font-semibold text-white">{trade.amount.toFixed(8).replace(/\.?0+$/, '')} ₿</div>
                </div>
              </div>
            </div>

            {/* Rate */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-green-500" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Rate (INR per ₿)</div>
                  <div className="font-semibold text-white">₹{formatCash(trade.price)}</div>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-blue-500" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Total Amount</div>
                  <div className="font-semibold text-white">₹{formatCash(trade.total)}</div>
                </div>
              </div>
            </div>

            {/* Original BTC Price */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <BitcoinIcon style={{height: "20px", width: "20px", color: "#EAB308"}} />
                <div>
                  <div className="text-sm text-gray-400">₿/USD Price (at time of trade)</div>
                  <div className="font-semibold text-white">${trade.btcPrice.toLocaleString('en-US')}</div>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-500" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Date & Time</div>
                  <div className="font-semibold text-white">{formatDate(trade.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Transaction Summary</div>
            <div className="text-sm text-white">
              {trade.type === 'BUY' 
                ? `You bought ${trade.amount.toFixed(8).replace(/\.?0+$/, '')} ₿ for ₹${formatCash(trade.total)} at a rate of ₹${formatCash(trade.price)} per ₿.`
                : `You sold ${trade.amount.toFixed(8).replace(/\.?0+$/, '')} ₿ for ₹${formatCash(trade.total)} at a rate of ₹${formatCash(trade.price)} per ₿.`
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
