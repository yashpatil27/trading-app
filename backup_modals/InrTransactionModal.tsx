'use client'

import { X, ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, User } from 'lucide-react'

interface InrTransaction {
  id: string
  type: 'DEPOSIT_INR' | 'WITHDRAWAL_INR'
  total: number
  reason: string
  balance: number
  createdAt: string
}

interface InrTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: InrTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function InrTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: InrTransactionModalProps) {
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

  const isDeposit = transaction.type === 'DEPOSIT_INR'

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
                {isDeposit ? 'CASH DEPOSIT' : 'CASH WITHDRAWAL'} Completed
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

            {/* INR Amount */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className={isDeposit ? "text-blue-500" : "text-yellow-500"} size={20} />
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Cash Amount</div>
                  <div className="font-semibold text-white">
                    {isDeposit ? '+' : '-'}₹{formatCash(Math.abs(transaction.total))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Balance After */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-green-500" size={20} />
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Cash Balance After</div>
                  <div className="font-semibold text-white">
                    ₹{formatCash(transaction.balance)}
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
                  <div className="font-semibold text-white">{transaction.reason || (isDeposit ? 'Cash Deposit' : 'Cash Withdrawal')}</div>
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
                ? `₹${formatCash(Math.abs(transaction.total))} was deposited to ${isAdmin && userName ? `${userName}'s` : 'your'} account.`
                : `₹${formatCash(Math.abs(transaction.total))} was withdrawn from ${isAdmin && userName ? `${userName}'s` : 'your'} account.`
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
