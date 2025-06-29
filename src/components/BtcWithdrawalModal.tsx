'use client'

import { X, ArrowUpRight, Calendar, User, DollarSign } from 'lucide-react'

interface BtcWithdrawalTransaction {
  id: string
  type: 'WITHDRAWAL_BTC'
  amount: number
  total: number
  reason: string
  balance: number
  createdAt: string
}

interface BtcWithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: BtcWithdrawalTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function BtcWithdrawalModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: BtcWithdrawalModalProps) {
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
    return `₿${amount.toFixed(8)}`
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
            <ArrowUpRight className="text-white" size={24} />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                BTC Withdrawal Completed
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
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">₿</span>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">BTC Withdrawal Amount</div>
                <div className="font-semibold text-white">-{formatBtc(transaction.amount)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="text-white" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Total INR Equivalent</div>
                <div className="font-semibold text-white">{formatInr(transaction.total)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">₿</span>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Bitcoin Balance After</div>
                <div className="font-semibold text-white">{formatBtc(transaction.balance)}</div>
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

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
