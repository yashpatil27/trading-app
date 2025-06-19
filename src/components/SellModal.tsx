'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled'

interface SellModalProps {
  isOpen: boolean
  onClose: () => void
  onSell: (btcAmount: number, inrAmount: number) => void
  availableBtc: number
  btcPrice: number
  sellRate: number
  loading: boolean
}

export default function SellModal({ 
  isOpen, 
  onClose, 
  onSell, 
  availableBtc, 
  btcPrice, 
  sellRate,
  loading 
}: SellModalProps) {
  const [btcAmount, setBtcAmount] = useState('')
  const [inrAmount, setInrAmount] = useState(0)

  // Format cash with Indian comma system
  const formatCash = (amount: number) => {
    return Math.floor(amount).toLocaleString('en-IN')
  }

  useEffect(() => {
    if (btcAmount && sellRate) {
      const btc = parseFloat(btcAmount) || 0
      const inr = btc * sellRate
      // Round up to next whole INR
      const roundedInr = Math.ceil(inr)
      setInrAmount(roundedInr)
    } else {
      setInrAmount(0)
    }
  }, [btcAmount, sellRate])

  const handlePercentageClick = (percentage: number) => {
    let amount = availableBtc * percentage / 100
    
    // For max button, use exact available amount to avoid precision issues
    if (percentage === 100) {
      amount = availableBtc
    } else {
      // Round to nearest satoshi (8 decimal places)
      amount = Math.round(amount * 100000000) / 100000000
    }
    
    setBtcAmount(amount.toString())
  }

  const handleSell = () => {
    const btc = parseFloat(btcAmount) || 0
    if (btc > 0 && inrAmount > 0 && btc <= availableBtc) {
      onSell(btc, inrAmount)
      setBtcAmount('')
      setInrAmount(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow decimal numbers for BTC
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBtcAmount(value)
    }
  }

  const btcValue = parseFloat(btcAmount) || 0
  // Use a small tolerance for floating point comparison
  const isValidAmount = btcValue > 0 && btcValue <= (availableBtc + 0.00000001)

  // Format BTC display to remove trailing zeros
  const formatBtc = (amount: number) => {
    if (amount === 0) return '0'
    return amount.toFixed(8).replace(/\.?0+$/, '')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Sell Bitcoin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Available Bitcoin */}
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
            <BitcoinIcon style={{height: "20px", width: "20px", color: "#F7931A"}} />
            <div>
              <div className="text-sm text-gray-400">Available Bitcoin</div>
              <div className="font-semibold text-white">{formatBtc(availableBtc)} BTC</div>
            </div>
          </div>

          {/* Current Price */}
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400">Sell Rate</div>
            <div className="text-lg font-bold text-red-400">₹{formatCash(sellRate)}</div>
            <div className="text-xs text-gray-500">per BTC</div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Enter Amount (BTC)</label>
            <input
              type="text"
              value={btcAmount}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0"
              disabled={loading}
            />
            {btcAmount && (
              <div className="text-sm text-gray-400 mt-2">
                You will receive: <span className="text-orange-400 font-semibold">₹{formatCash(inrAmount)}</span>
              </div>
            )}
          </div>

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => {
              let amount = availableBtc * percentage / 100
              if (percentage === 100) {
                amount = availableBtc
              } else {
                amount = Math.round(amount * 100000000) / 100000000
              }
              
              return (
                <button
                  key={percentage}
                  onClick={() => handlePercentageClick(percentage)}
                  disabled={loading || availableBtc === 0}
                  className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                >
                  {percentage === 100 ? 'Max' : `${percentage}%`}
                  <div className="text-xs text-gray-400">{formatBtc(amount)}</div>
                </button>
              )
            })}
          </div>

          {/* Error Message */}
          {btcAmount && btcValue > availableBtc && (
            <div className="text-red-400 text-sm text-center">
              Insufficient Bitcoin. Maximum: {formatBtc(availableBtc)} BTC
            </div>
          )}

          {availableBtc === 0 && (
            <div className="text-yellow-400 text-sm text-center">
              You don't have any Bitcoin to sell
            </div>
          )}

          {/* Sell Button */}
          <button
            onClick={handleSell}
            disabled={!isValidAmount || loading || availableBtc === 0}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : `Sell ${btcAmount || '0'} BTC`}
          </button>
        </div>
      </div>
    </div>
  )
}
