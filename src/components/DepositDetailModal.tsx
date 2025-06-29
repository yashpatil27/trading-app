'use client'

import { X, ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, User, Settings } from 'lucide-react'
import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

interface DepositTransaction {
  id: string
  type: 'BUY' | 'SELL' | 'DEPOSIT_INR' | 'DEPOSIT_BTC' | 'WITHDRAWAL_INR' | 'WITHDRAWAL_BTC' | 'ADMIN'
  amount: number
  reason: string
  balance?: number
  btcBalance?: number
  createdAt: string
}

interface DepositDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: DepositTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function DepositDetailModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: DepositDetailModalProps) {
  if (!isOpen || !transaction) return null

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

  const formatBtc = (amount: number) => {
    if (!amount || amount === 0) return '₿0'
    return `₿${amount.toFixed(8).replace(/\.?0+$/, '')}`
  }

  const isDeposit = transaction.type === 'DEPOSIT_INR' || transaction.type === 'DEPOSIT_BTC'
  // Check transaction type for Bitcoin transactions
  const isBitcoinTransaction = transaction.type === 'DEPOSIT_BTC' || transaction.type === 'WITHDRAWAL_BTC'
  
  // For Bitcoin transactions, the API returns:
  // - amount = BTC amount
  // - btcBalance = BTC balance after
  // For INR transactions, the API returns:
  // - amount = INR amount (but this would be in total field)  
  // - balance = INR balance after
  const displayAmount = transaction.amount
  const displayBalance = isBitcoinTransaction ? transaction.btcBalance || 0 : transaction.balance || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">
        {/* Header with Transaction Status */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {(transaction.type === 'DEPOSIT_INR' || transaction.type === 'DEPOSIT_BTC') ? (
              <ArrowDownLeft className="text-blue-500" size={24} />
            ) : (transaction.type === 'WITHDRAWAL_INR' || transaction.type === 'WITHDRAWAL_BTC') ? (
              <ArrowUpRight className="text-yellow-500" size={24} />
            ) : (
              <ArrowDownLeft className="text-gray-500" size={24} />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {{"BUY": "BUY", "SELL": "SELL", "DEPOSIT_INR": "CASH DEPOSIT", "DEPOSIT_BTC": "BTC DEPOSIT", "WITHDRAWAL_INR": "CASH WITHDRAWAL", "WITHDRAWAL_BTC": "BTC WITHDRAWAL", "ADMIN": "ADMIN"}[transaction.type] || transaction.type} Completed
              </h2>
              <div className="text-xs sm:text-sm text-gray-400">Transaction ID: {transaction.id}</div>
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

          {/* Transaction Details */}
          <div className="space-y-3">
            {/* User Name (for admin view) */}
            {isAdmin && userName && (
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="text-purple-500" size={20} />
                  <div>
                    <div className="text-xs sm:text-sm text-gray-400">User</div>
                    <div className="font-semibold text-white">{userName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {isBitcoinTransaction ? (
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">₿</span>
                  </div>
                ) : (
                  <DollarSign className={isDeposit ? "text-blue-500" : "text-yellow-500"} size={20} />
                )}
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">{{"DEPOSIT_INR": "CASH DEPOSIT", "DEPOSIT_BTC": "BTC DEPOSIT", "WITHDRAWAL_INR": "CASH WITHDRAWAL", "WITHDRAWAL_BTC": "BTC WITHDRAWAL", "ADMIN": "ADMIN"}[transaction.type] || transaction.type} Amount</div>
                  <div className="font-semibold text-white">
                    {isDeposit ? '+' : '-'}{isBitcoinTransaction ? formatBtc(Math.abs(displayAmount)) : `₹${formatCash(Math.abs(displayAmount))}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Balance After (show appropriate balance) */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {isBitcoinTransaction ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">₿</span>
                  </div>
                ) : (
                  <DollarSign className="text-green-500" size={20} />
                )}
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {isBitcoinTransaction ? 'Bitcoin' : 'Cash'} Balance After
                  </div>
                  <div className="font-semibold text-white">
                    {isBitcoinTransaction 
                      ? formatBtc(displayBalance)
                      : `₹${formatCash(displayBalance)}`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-gray-500" size={20} />
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Reason</div>
                  <div className="font-semibold text-white">{transaction.reason}</div>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-500" size={20} />
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Date & Time</div>
                  <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-xs sm:text-sm text-gray-400 mb-2">Transaction Summary</div>
            <div className="text-sm text-white">
              {isDeposit 
                ? `${isBitcoinTransaction ? formatBtc(Math.abs(displayAmount)) : `₹${formatCash(Math.abs(displayAmount))}`} was deposited to ${isAdmin && userName ? `${userName}'s` : 'your'} account.`
                : `${isBitcoinTransaction ? formatBtc(Math.abs(displayAmount)) : `₹${formatCash(Math.abs(displayAmount))}`} was withdrawn from ${isAdmin && userName ? `${userName}'s` : 'your'} account.`
              }
              {transaction.reason && ` Reason: ${transaction.reason}`}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
