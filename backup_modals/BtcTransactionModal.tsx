'use client'

import { X, ArrowDownLeft, ArrowUpRight, Calendar, User } from 'lucide-react'

interface BtcTransaction {
  id: string
  type: 'DEPOSIT_BTC' | 'WITHDRAWAL_BTC'
  amount: number
  reason: string
  btcBalance: number
  createdAt: string
}

interface BtcTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: BtcTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function BtcTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: BtcTransactionModalProps) {
  if (!isOpen || !transaction) return null

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

  const isDeposit = transaction.type === 'DEPOSIT_BTC'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">
        {/* Header with Transaction Status */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {isDeposit ? (
              <ArrowDownLeft className="text-blue-500" size={24} />
            ) : (
              <ArrowUpRight className="text-yellow-500" size={24} />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {isDeposit ? 'BTC DEPOSIT' : 'BTC WITHDRAWAL'} Completed
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

            {/* Bitcoin Amount */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">₿</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Bitcoin Amount</div>
                  <div className="font-semibold text-white">
                    {isDeposit ? '+' : '-'}{formatBtc(Math.abs(transaction.amount))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bitcoin Balance After */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">₿</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Bitcoin Balance After</div>
                  <div className="font-semibold text-white">
                    {formatBtc(transaction.btcBalance)}
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">i</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Reason</div>
                  <div className="font-semibold text-white">{transaction.reason || (isDeposit ? 'BTC Deposit' : 'BTC Withdrawal')}</div>
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
                ? `${formatBtc(Math.abs(transaction.amount))} was deposited to ${isAdmin && userName ? `${userName}'s` : 'your'} Bitcoin wallet.`
                : `${formatBtc(Math.abs(transaction.amount))} was withdrawn from ${isAdmin && userName ? `${userName}'s` : 'your'} Bitcoin wallet.`
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
