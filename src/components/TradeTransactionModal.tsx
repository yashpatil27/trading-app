'use client'

import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Bitcoin } from 'lucide-react'

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
      <div className="bg-black rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">

        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-black rounded-t-3xl">
          <div className="flex items-center gap-3">
            {transaction.type === 'BUY' ? (
              <TrendingUp className="text-white" size={24} />
            ) : (
              <TrendingDown className="text-white" size={24} />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {transaction.type} Order
              </h2>
              <div className="text-xs sm:text-sm text-zinc-400">Transaction ID: {transaction.id.slice(-8)}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Bitcoin className="text-white" size={16} />
              <div>
                <div className="text-xs text-zinc-400">Bitcoin Amount</div>
                <div className="text-sm font-semibold text-white">{formatBtc(transaction.amount)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-white" size={20} />
              <div>
                <div className="text-xs text-zinc-400">Price per BTC</div>
                <div className="text-sm font-semibold text-white">{formatInr(transaction.price)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-white" size={20} />
              <div>
                <div className="text-xs text-zinc-400">Total Amount</div>
                <div className="text-sm font-semibold text-white">{formatInr(transaction.total)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="text-zinc-500" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-zinc-400">Date & Time</div>
                <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
              </div>
            </div>
          </div>


          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-lg transition-colors mb-4"
          >
            Close
          </button>

        </div>
      </div>
    </div>
  )
}  
