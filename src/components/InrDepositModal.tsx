'use client'

import { X, ArrowDownLeft, Calendar, User, DollarSign } from 'lucide-react'

interface InrDepositTransaction {
  id: string
  type: 'DEPOSIT_INR'
  total: number
  reason: string
  balance: number
  createdAt: string
}

interface InrDepositModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: InrDepositTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function InrDepositModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: InrDepositModalProps) {
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

  const formatCash = (amount: number) => {
    return Math.floor(amount).toLocaleString('en-IN')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-black rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">

        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-black rounded-t-3xl">
          <div className="flex items-center gap-3">
            <ArrowDownLeft className="text-white" size={24} />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Cash Deposit Completed
              </h2>
              <div className="text-xs sm:text-sm text-gray-400">Transaction ID: {transaction.id}</div>
            </div>
          </div>
          <button
        </div>

        <div className="p-4 space-y-3">

          {isAdmin && userName && (
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="text-white" size={20} />
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">User</div>
                  <div className="font-semibold text-white">{userName}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-white" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Cash Deposit Amount</div>
                <div className="font-semibold text-white">+₹{formatCash(transaction.total)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-white" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Cash Balance After</div>
                <div className="font-semibold text-white">₹{formatCash(transaction.balance)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-500" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Date & Time</div>
                <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
              </div>
            </div>
          </div>

          {transaction.reason && (
            <div className="p-4 bg-zinc-800 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-400">Reason</div>
              <p className="text-white mt-1">{transaction.reason}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
