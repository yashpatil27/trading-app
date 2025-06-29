'use client'

import { X, Calendar, User, Settings } from 'lucide-react'

interface AdminTransaction {
  id: string
  type: 'ADMIN'
  reason: string
  createdAt: string
}

interface AdminTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: AdminTransaction | null
  isAdmin?: boolean
  userName?: string
}

export default function AdminTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isAdmin = false,
  userName = ''
}: AdminTransactionModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-black rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">

        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-black rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Settings className="text-gray-500" size={24} />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                ADMIN Action
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
              <Calendar className="text-gray-500" size={20} />
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Date & Time</div>
                <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
              </div>
            </div>
          </div>

          {transaction.reason && (
            <div className="p-4 bg-zinc-800 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-400">Details</div>
              <p className="text-white mt-1">{transaction.reason}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
