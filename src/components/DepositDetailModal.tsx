'use client'

import { X, ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, User, Settings, Bitcoin } from 'lucide-react'

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
  isADMIN?: boolean
  userName?: string
}

export default function DepositDetailModal({ 
  isOpen, 
  onClose, 
  transaction, 
  isADMIN = false,
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
      <div className="bg-black rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up max-h-[95vh] overflow-y-auto">
        {/* Header with Transaction Status */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-black rounded-t-3xl">
          <div className="flex items-center gap-3">
            {(transaction.type === 'DEPOSIT_INR' || transaction.type === 'DEPOSIT_BTC') ? (
              <ArrowDownLeft className="text-white" size={24} />
            ) : (transaction.type === 'WITHDRAWAL_INR' || transaction.type === 'WITHDRAWAL_BTC') ? (
              <ArrowUpRight className="text-white" size={24} />
            ) : (
              <ArrowDownLeft className="text-zinc-500" size={24} />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {{"BUY": "Buy", "SELL": "Sell", "DEPOSIT_INR": "Cash Deposit", "DEPOSIT_BTC": "BTC Deposit", "WITHDRAWAL_INR": "Cash Withdrawal", "WITHDRAWAL_BTC": "BTC Withdrawal", "ADMIN": "Admin"}[transaction.type] || transaction.type} Completed
              </h2>
              <div className="text-xs sm:text-sm text-zinc-400">Transaction ID: {transaction.id}</div>
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

          {/* Transaction Details */}
          <div className="space-y-3">
            {/* User Name (for admin view) */}
            {isADMIN && userName && (
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="text-white" size={20} />
                  <div>
                    <div className="text-xs sm:text-sm text-zinc-400">User</div>
                    <div className="font-semibold text-white">{userName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                {isBitcoinTransaction ? (
                  <Bitcoin className="text-white" size={20} />
                ) : (
                  <DollarSign className={isDeposit ? "text-white" : "text-white"} size={20} />
                )}
                <div>
                  <div className="text-xs sm:text-sm text-zinc-400">{{"DEPOSIT_INR": "Cash Deposit", "DEPOSIT_BTC": "BTC Deposit", "WITHDRAWAL_INR": "Cash Withdrawal", "WITHDRAWAL_BTC": "BTC Withdrawal", "ADMIN": "Admin"}[transaction.type] || transaction.type} Amount</div>
                  <div className="font-semibold text-white">
                    {isDeposit ? '+' : '-'}{isBitcoinTransaction ? formatBtc(Math.abs(displayAmount)) : `₹${formatCash(Math.abs(displayAmount))}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Balance After (show appropriate balance) */}
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                {isBitcoinTransaction ? (
                  <Bitcoin className="text-white" size={20} />
                ) : (
                  <DollarSign className="text-white" size={20} />
                )}
                <div>
                  <div className="text-xs sm:text-sm text-zinc-400">
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


            {/* Timestamp */}
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="text-white" size={20} />
                <div>
                  <div className="text-xs sm:text-sm text-zinc-400">Date & Time</div>
                  <div className="font-semibold text-white">{formatDate(transaction.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-zinc-800 rounded-lg border border-gray-700">
            <div className="text-xs sm:text-sm text-zinc-400 mb-2">Transaction Summary</div>
            <div className="text-sm text-white">
              {isDeposit 
                ? `${isBitcoinTransaction ? formatBtc(Math.abs(displayAmount)) : `₹${formatCash(Math.abs(displayAmount))}`} was deposited to ${isADMIN && userName ? `${userName}'s` : 'your'} account.`
                : `${isBitcoinTransaction ? formatBtc(Math.abs(displayAmount)) : `₹${formatCash(Math.abs(displayAmount))}`} was withdrawn from ${isADMIN && userName ? `${userName}'s` : 'your'} account.`
              }
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-lg transition-colors mb-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
