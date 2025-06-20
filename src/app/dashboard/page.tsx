'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, LogOut, Home, Plus, Minus, ArrowDownLeft, ArrowUpRight, ArrowUp, ArrowDown, Wallet } from 'lucide-react'
import { BitcoinIcon } from '@bitcoin-design/bitcoin-icons-react/filled'
import { signOut } from 'next-auth/react'
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice'
import BuyModal from '@/components/BuyModal'
import SellModal from '@/components/SellModal'
import TradeDetailModal from '@/components/TradeDetailModal'
import DepositDetailModal from '@/components/DepositDetailModal'
import PinConfirmationModal from '@/components/PinConfirmationModal'

// Use standard Lucide icons instead of bitcoin design icons

interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'CREDIT' | 'DEBIT'
  category: 'TRADE' | 'BALANCE'
  amount: number
  price?: number
  total: number
  btcPrice?: number
  reason: string
  balance?: number
  createdAt: string
}

interface User {
  balance: number
  btcAmount: number
}

type TabType = 'dashboard' | 'history'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { price: btcPrice, isConnected, error } = useBitcoinPrice()
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  
  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null)

  // PIN modal states
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingTrade, setPendingTrade] = useState<{ type: 'BUY' | 'SELL', amount: number, btcAmount: number } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
      fetchTransactions()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleTrade = async () => {
    if (!pendingTrade || !btcPrice) return

    setLoading(true)
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: pendingTrade.type,
          amount: pendingTrade.amount,
          btcPrice: btcPrice.btcUSD
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setShowBuyModal(false)
        setShowSellModal(false)
        setShowPinModal(false)
        setPendingTrade(null)
        fetchUserData()
        fetchTransactions()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Trade error:', error)
      alert('Trade failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePinConfirm = async (pin: string) => {
    try {
      const response = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })

      const result = await response.json()

      if (result.valid) {
        await handleTrade()
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('PIN confirmation error:', error)
      return false
    }
  }

  const initiateBuy = (inrAmount: number, btcAmount: number) => {
    setPendingTrade({ type: 'BUY', amount: inrAmount, btcAmount })
    setShowBuyModal(false)
    setShowPinModal(true)
  }

  const initiateSell = (btcAmount: number, inrAmount: number) => {
    setPendingTrade({ type: 'SELL', amount: btcAmount, btcAmount })
    setShowSellModal(false)
    setShowPinModal(true)
  }

  // Legacy handleBuy function removed - now using PIN confirmation flow

  // Legacy handleSell function removed - now using PIN confirmation flow

  // Format cash balance with Indian comma system (lakhs, crores)
  const formatCash = (amount: number) => {
    const rounded = Math.floor(amount)
    return rounded.toLocaleString('en-IN')
  }

  // Format BTC amount (remove trailing zeros, show 0 for zero amounts)
  const formatBtc = (amount: number) => {
    if (amount === 0) return '₿0'
    return `₿${amount.toFixed(8).replace(/\.?0+$/, '')}`
  }

  // Format USD price with thousand separators
  const formatUSD = (amount: number) => {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.category === 'TRADE') {
      return transaction.type === 'BUY' ? (
        <ArrowUp className="text-green-500" width={20} height={20} />
      ) : (
        <ArrowDown className="text-red-500" width={20} height={20} />
      )
    } else {
      return transaction.type === 'DEPOSIT' ? (
        <ArrowDownLeft className="text-blue-500" size={20} />
      ) : (
        <ArrowUpRight className="text-yellow-500" size={20} />
      )
    }
  }

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.category === 'TRADE') {
      return transaction.type === 'BUY' ? 'text-green-400' : 'text-red-400'
    } else {
      return transaction.type === 'DEPOSIT' ? 'text-blue-400' : 'text-yellow-400'
    }
  }

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.category === 'TRADE') {
      // Convert to trade format for the modal
      setSelectedTrade({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        price: transaction.price,
        total: transaction.total,
        btcPrice: transaction.btcPrice,
        createdAt: transaction.createdAt
      })
    } else {
      // Handle deposit/withdrawal transactions
      setSelectedDeposit({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.total, // Use total as amount for deposits
        reason: transaction.reason,
        balance: transaction.balance || 0,
        createdAt: transaction.createdAt
      })
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">BitTrade</h1>
          </div>
          <div className="flex items-center gap-4">
            {session.user.role === 'ADMIN' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="text-white hover:text-gray-300 font-bold text-lg"
            >
              <LogOut size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Connection Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <>
            {/* Portfolio Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cash Balance */}
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="text-white" width={20} height={20} />
                  <span className="text-white font-bold">Cash</span>
                </div>
                <div className="text-xl font-bold">₹{formatCash(user?.balance || 0)}</div>
              </div>

              {/* Bitcoin Holdings */}
              <div className="bg-gray-900 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BitcoinIcon style={{height: "20px", width: "20px", color: "#F7931A"}} />
                  <span className="text-white font-bold">Bitcoin</span>
                </div>
                <div className="text-xl font-bold">{formatBtc(user?.btcAmount || 0)}</div>
                
              </div>
            </div>

            {/* Bitcoin Price Card */}
            {btcPrice && (
              <div className="bg-gray-900 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg">Bitcoin Price</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">
                    ${formatUSD(btcPrice.btcUSD)}
                  </div>
                  {btcPrice.note && (
                    <div className="text-xs text-yellow-400 mt-1">{btcPrice.note}</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">Buy Rate</div>
                    <div className="text-green-400 font-semibold">₹{formatCash(btcPrice.buyRate)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">Sell Rate</div>
                    <div className="text-red-400 font-semibold">₹{formatCash(btcPrice.sellRate)}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center mt-2">
                  Last updated: {new Date(btcPrice.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* Trade Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowBuyModal(true)}
                disabled={!isConnected || !btcPrice || Math.floor(user?.balance || 0) === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={20} />
                Buy Bitcoin
              </button>
              <button
                onClick={() => setShowSellModal(true)}
                disabled={!isConnected || !btcPrice || (user?.btcAmount || 0) === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Minus size={20} />
                Sell Bitcoin
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <History size={20} />
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    <BitcoinIcon style={{height: "48px", width: "48px", color: "#6B7280"}} />
                    <div>No activity yet</div>
                    <div className="text-sm">Start trading to see your history</div>
                  </div>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      onClick={() => handleTransactionClick(transaction)}
                      className="flex justify-between items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${getTransactionColor(transaction)}`}>
                              {transaction.category === 'TRADE' ? transaction.type : 
                               transaction.type}
                            </span>
                            {transaction.category === 'TRADE' && (
                              <span className="text-sm text-gray-400">
                                {formatBtc(transaction.amount)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </div>
                          {transaction.category === 'BALANCE' && (
                            <div className="text-xs text-gray-400">{transaction.reason}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {transaction.category === 'BALANCE' && transaction.type === 'WITHDRAWAL' ? '-' : ''}
                          ₹{formatCash(transaction.total)}
                        </div>
                        {transaction.category === 'TRADE' && transaction.price && (
                          <div className="text-xs text-gray-400">
                            @₹{formatCash(transaction.price)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          /* History Tab */
          <div className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <History size={24} />
              <h2 className="text-xl font-semibold">Complete Transaction History</h2>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  <BitcoinIcon style={{height: "64px", width: "64px", color: "#6B7280"}} />
                  <div className="text-lg mb-2">No transactions yet</div>
                  <div className="text-sm">Your transaction history will appear here</div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Start Trading
                  </button>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    onClick={() => handleTransactionClick(transaction)}
                    className="flex justify-between items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getTransactionColor(transaction)}`}>
                            {transaction.category === 'TRADE' ? transaction.type : 
                             transaction.type}
                          </span>
                          {transaction.category === 'TRADE' && (
                            <span className="text-sm text-gray-400">
                              {formatBtc(transaction.amount)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                        {transaction.category === 'BALANCE' && (
                          <div className="text-xs text-gray-400">{transaction.reason}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {transaction.category === 'BALANCE' && transaction.type === 'WITHDRAWAL' ? '-' : ''}
                        ₹{formatCash(transaction.total)}
                      </div>
                      {transaction.category === 'TRADE' && transaction.price && (
                        <div className="text-xs text-gray-400">
                          @₹{formatCash(transaction.price)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === 'dashboard' ? 'tab-active' : 'tab-inactive hover:text-white'
            }`}
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === 'history' ? 'tab-active' : 'tab-inactive hover:text-white'
            }`}
          >
            <History size={20} />
            <span className="text-xs">History</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {btcPrice && (
        <>
          <BuyModal
            isOpen={showBuyModal}
            onClose={() => setShowBuyModal(false)}
            onBuy={initiateBuy}
            availableBalance={user?.balance || 0}
            btcPrice={btcPrice.btcUSD}
            buyRate={btcPrice.buyRate}
            loading={loading}
          />

          <SellModal
            isOpen={showSellModal}
            onClose={() => setShowSellModal(false)}
            onSell={initiateSell}
            availableBtc={user?.btcAmount || 0}
            btcPrice={btcPrice.btcUSD}
            sellRate={btcPrice.sellRate}
            loading={loading}
          />
        </>
      )}

      <PinConfirmationModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false)
          setPendingTrade(null)
        }}
        onConfirm={handlePinConfirm}
        title="Confirm Your Trade"
        description="Please enter your 4-digit PIN to proceed with the trade."
        isLoading={loading}
      />

      <TradeDetailModal
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        trade={selectedTrade}
      />

      <DepositDetailModal
        isOpen={!!selectedDeposit}
        onClose={() => setSelectedDeposit(null)}
        transaction={selectedDeposit}
      />
    </div>
  )
}
