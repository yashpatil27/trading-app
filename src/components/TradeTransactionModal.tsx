'use client'

import { X, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

interface TradeTransaction {
  id: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  total: number
  reason: string
  balance: number
  createdAt: string
}

interface TradeTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: TradeTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function TradeTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: TradeTransactionModalProps) {
  if (!isOpen || !transaction) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatBtc = (amount: number) => {
    return `${amount.toFixed(8)} BTC`
  }

  const formatInr = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">

        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {transaction.type === 'BUY' ? (
              <TrendingUp className="text-green-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {transaction.type} Order
              </h2>
              <div className="text-xs sm:text-sm text-gray-400">Transaction ID: {transaction.id.slice(-8)}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <BitcoinIcon style={{ height: '16px', width: '16px', color: '#F7931A' }} />
              <div>
                <div className="text-xs text-gray-400">Bitcoin Amount</div>
                <div className="text-sm font-semibold text-white">{formatBtc(transaction.amount)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-500" size={20} />
              <div>
                <div className="text-xs text-gray-400">Price per BTC</div>
                <div className="text-sm font-semibold text-white">{formatInr(transaction.price)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-500" size={20} />
              <div>
                <div className="text-xs text-gray-400">Total Amount</div>
                <div className="text-sm font-semibold text-white">{formatInr(transaction.total)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-500" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Date & Time</div>
                <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
              </div>
            </div>
          </div>

          {transaction.reason && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-400">Note</div>
              <p className="text-white mt-1">{transaction.reason}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}  
