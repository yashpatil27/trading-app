import React from 'react'
import { ArrowUp, ArrowDown, Wifi, WifiOff } from 'lucide-react'

interface BtcPrice {
  btcUSD: number
  buyRate: number
  sellRate: number
  timestamp: string
  note?: string
}

interface BitcoinPriceDisplayProps {
  price: BtcPrice | null
  isConnected: boolean
  error: string | null
}

// Memoized component to prevent unnecessary re-renders
const BitcoinPriceDisplay = React.memo(({ price, isConnected, error }: BitcoinPriceDisplayProps) => {
  if (error) {
    return (
      <div className="bg-zinc-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Price data unavailable</span>
        </div>
      </div>
    )
  }

  if (!price) {
    return (
      <div className="bg-zinc-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white">
          <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-white rounded-full"></div>
          <span className="text-sm">Loading price...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-white">Bitcoin Price</h2>
            {isConnected ? (
              <Wifi className="h-4 w-4 text-white" />
            ) : (
              <WifiOff className="h-4 w-4 text-white" />
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              ₹{price.btcUSD.toLocaleString('en-IN')}
            </div>
            <div className="bg-white text-black text-sm px-2 py-1 rounded inline-block">
              Updated: {new Date(price.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <div className="flex items-center gap-1 text-white">
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              Buy: ₹{price.buyRate.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white">
            <ArrowDown className="h-4 w-4" />
            <span className="text-sm font-medium">
              Sell: ₹{price.sellRate.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
      
      {price.note && (
        <div className="mt-3 text-xs text-white bg-zinc-700 px-2 py-1 rounded">
          {price.note}
        </div>
      )}
    </div>
  )
})

BitcoinPriceDisplay.displayName = 'BitcoinPriceDisplay'

export default BitcoinPriceDisplay
