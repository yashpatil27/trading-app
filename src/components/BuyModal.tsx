'use client'

import { useState, useEffect } from 'react'
import { X, Clock } from 'lucide-react'
import { Wallet } from 'lucide-react'

interface BuyModalProps {
  isOpen: boolean
  onClose: () => void
  onBuy: (inrAmount: number, btcAmount: number) => void
  availableBalance: number
  btcPrice: number
  buyRate: number
  loading: boolean
  countdown?: number
}

export default function BuyModal({ 
  isOpen, 
  onClose, 
  onBuy, 
  availableBalance, 
  btcPrice, 
  buyRate,
  loading,
  countdown 
}: BuyModalProps) {
  const [inrAmount, setInrAmount] = useState('')
  const [btcAmount, setBtcAmount] = useState(0)

  // Round balance to whole number for display and calculations
  const roundedBalance = Math.floor(availableBalance)

  // Format cash with Indian comma system
  const formatCash = (amount: number) => {
    return Math.floor(amount).toLocaleString('en-IN')
  }

  useEffect(() => {
    if (inrAmount && buyRate) {
      const inr = parseInt(inrAmount) || 0
      const btc = inr / buyRate
      // Round to nearest satoshi (8 decimal places)
      const roundedBtc = Math.round(btc * 100000000) / 100000000
      setBtcAmount(roundedBtc)
    } else {
      setBtcAmount(0)
    }
  }, [inrAmount, buyRate])

  const handlePercentageClick = (percentage: number) => {
    // Calculate percentage of available balance and round down to whole number
    const amount = Math.floor(roundedBalance * percentage / 100)
    setInrAmount(amount.toString())
  }

  const handleBuy = () => {
    const inr = parseInt(inrAmount) || 0
    if (inr > 0 && btcAmount > 0 && inr <= roundedBalance) {
      onBuy(inr, btcAmount)
      setInrAmount('')
      setBtcAmount(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow whole numbers
    if (value === '' || /^\d+$/.test(value)) {
      setInrAmount(value)
    }
  }

  const inrValue = parseInt(inrAmount) || 0
  const isValidAmount = inrValue > 0 && inrValue <= roundedBalance

  // Format BTC display with Bitcoin symbol
  const formatBtc = (amount: number) => {
    if (amount === 0) return '₿0'
    return `₿${amount.toFixed(8).replace(/\.?0+$/, '')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-black rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Buy Bitcoin</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg">
            <Wallet className="text-white" width={20} height={20} />
            <div>
              <div className="text-sm text-zinc-400">Available Balance</div>
              <div className="font-semibold text-white">₹{formatCash(roundedBalance)}</div>
            </div>
          </div>

          {/* Current Price */}
          <div className="text-center p-4 bg-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-400">Buy Rate</div>
            <div className="text-lg font-semibold text-white">₹{formatCash(buyRate)}</div>
            <div className="text-xs text-zinc-500">per ₿</div>
            {countdown !== undefined && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="bg-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock size={10} className="text-black" />
                  <span className="text-xs text-black">Update: {countdown}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Enter Amount (INR)</label>
            <input
              type="text"
              value={inrAmount}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
              disabled={loading}
            />
            {inrAmount && (
              <div className="text-sm text-zinc-400 mt-2">
                You will receive: <span className="text-white font-semibold">{formatBtc(btcAmount)}</span>
              </div>
            )}
          </div>

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={() => handlePercentageClick(percentage)}
                disabled={loading || roundedBalance === 0}
                className="bg-zinc-800 hover:bg-gray-700 disabled:bg-zinc-800 text-white py-3 px-3 rounded-lg font-medium transition-colors text-sm"
              >
                {percentage === 100 ? 'Max' : `${percentage}%`}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {inrAmount && inrValue > roundedBalance && (
            <div className="text-white text-sm text-center">
              Insufficient balance. Maximum: ₹{formatCash(roundedBalance)}
            </div>
          )}

          {roundedBalance === 0 && (
            <div className="text-white text-sm text-center">
              You don&apos;t have any cash to buy Bitcoin
            </div>
          )}

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            disabled={!isValidAmount || loading || roundedBalance === 0}
            className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-200 text-black font-semibold py-4 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : `Buy ₹${inrAmount ? formatCash(parseInt(inrAmount)) : '0'} worth of Bitcoin`}
          </button>
        </div>
      </div>
    </div>
  )
}
