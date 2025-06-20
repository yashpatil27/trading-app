'use client'

import { X, ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, User } from 'lucide-react'

interface DepositTransaction {
  id: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  reason: string
  balance: number
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

  const isDeposit = transaction.type === 'CREDIT'
  const transactionType = isDeposit ? 'DEPOSIT' : 'WITHDRAWAL'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {isDeposit ? (
              <ArrowDownLeft className="text-blue-500" size={24} />
            ) : (
              <ArrowUpRight className="text-yellow-500" size={24} />
            )}
            <h2 className="text-xl font-bold text-white">
              {transactionType} Details
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
          {/* Transaction Status */}
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className={`text-lg font-bold ${isDeposit ? 'text-blue-400' : 'text-yellow-400'}`}>
              {transactionType} Completed
            </div>
            <div className="text-sm text-gray-400 mt-1">Transaction ID: {transaction.id.slice(0, 8)}...</div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            {/* User Name (for admin view) */}
            {isAdmin && userName && (
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="text-purple-500" size={20} />
                  <div>
                    <div className="text-sm text-gray-400">User</div>
                    <div className="font-semibold text-white">{userName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className={isDeposit ? "text-blue-500" : "text-yellow-500"} size={20} />
                <div>
                  <div className="text-sm text-gray-400">{transactionType} Amount</div>
                  <div className="font-semibold text-white">
                    {isDeposit ? '+' : '-'}₹{formatCash(Math.abs(transaction.amount))}
                  </div>
                </div>
              </div>
            </div>

            {/* Balance After */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-green-500" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Balance After Transaction</div>
                  <div className="font-semibold text-white">₹{formatCash(transaction.balance)}</div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="text-gray-500" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Reason</div>
                  <div className="font-semibold text-white">{transaction.reason}</div>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-500" size={20} />
                <div>
                  <div className="text-sm text-gray-400">Date & Time</div>
                  <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Transaction Summary</div>
            <div className="text-sm text-white">
              {isDeposit 
                ? `₹${formatCash(Math.abs(transaction.amount))} was deposited to ${isAdmin && userName ? `${userName}'s` : 'your'} account.`
                : `₹${formatCash(Math.abs(transaction.amount))} was withdrawn from ${isAdmin && userName ? `${userName}'s` : 'your'} account.`
              }
              {transaction.reason && ` Reason: ${transaction.reason}`}
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
