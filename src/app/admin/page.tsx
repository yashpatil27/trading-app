'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Minus, ArrowLeft, User, Wallet, Calendar, TrendingUp, Shield, Key } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  tradingPin: string
  balance: number
  createdAt: string
  _count: {
    trades: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState<User | null>(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceReason, setBalanceReason] = useState('')
  const [showPinModal, setShowPinModal] = useState<User | null>(null)
  const [newPin, setNewPin] = useState('')
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'USER'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        setNewUser({ email: '', name: '', password: '', role: 'USER' })
        setShowCreateUser(false)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }

  const adjustBalance = async (type: 'CREDIT' | 'DEBIT') => {
    if (!showBalanceModal || !balanceAmount) return

    try {
      const response = await fetch('/api/admin/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: showBalanceModal.id,
          amount: parseFloat(balanceAmount),
          reason: balanceReason,
          type
        })
      })

      if (response.ok) {
        setShowBalanceModal(null)
        setBalanceAmount('')
        setBalanceReason('')
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error adjusting balance:', error)
      alert('Failed to adjust balance')
    }
  }

  const resetPin = async () => {
    if (!showPinModal || !newPin) return

    try {
      const response = await fetch('/api/admin/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: showPinModal.id,
          newPin: newPin
        })
      })

      if (response.ok) {
        const result = await response.json()
        setShowPinModal(null)
        setNewPin('')
        fetchUsers()
        alert(result.message)
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error resetting PIN:', error)
      alert('Failed to reset PIN')
    }
  }

  // Format cash with Indian comma system
  const formatCash = (amount: number) => {
    const rounded = Math.floor(amount)
    return rounded.toLocaleString('en-IN')
  }

  // Calculate totals for summary cards
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0)
  const totalTrades = users.reduce((sum, user) => sum + user._count.trades, 0)
  const adminUsers = users.filter(user => user.role === 'ADMIN').length

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            Create User
          </button>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Users */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Users className="text-blue-400" size={20} />
              </div>
              <span className="text-gray-400 text-sm">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {adminUsers} admin{adminUsers !== 1 ? 's' : ''}, {users.length - adminUsers} user{users.length - adminUsers !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Total Balance */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Wallet className="text-green-400" size={20} />
              </div>
              <span className="text-gray-400 text-sm">Total Balance</span>
            </div>
            <div className="text-2xl font-bold">₹{formatCash(totalBalance)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Across all user accounts
            </div>
          </div>

          {/* Total Trades */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <TrendingUp className="text-orange-400" size={20} />
              </div>
              <span className="text-gray-400 text-sm">Total Trades</span>
            </div>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <div className="text-xs text-gray-500 mt-1">
              Platform-wide transactions
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-orange-500" />
            <h2 className="text-xl font-semibold">User Management</h2>
            <span className="text-sm text-gray-400">({users.length} users)</span>
          </div>

          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <User size={20} className="text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-900/50 text-purple-200 border border-purple-700' 
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    <Shield size={12} className="inline mr-1" />
                    {user.role}
                  </span>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet size={14} className="text-green-400" />
                      <span className="text-xs text-gray-400">Balance</span>
                    </div>
                    <div className="font-semibold text-green-400">₹{formatCash(user.balance)}</div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-blue-400" />
                      <span className="text-xs text-gray-400">Trades</span>
                    </div>
                    <div className="font-semibold text-blue-400">{user._count.trades}</div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Key size={14} className="text-orange-400" />
                      <span className="text-xs text-gray-400">PIN</span>
                    </div>
                    <div className="font-mono text-orange-400 text-sm">•••{user.tradingPin.slice(-1)}</div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400">Joined</span>
                    </div>
                    <div className="font-semibold text-gray-300 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowBalanceModal(user)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Wallet size={18} />
                    Adjust Balance
                  </button>
                  <button
                    onClick={() => setShowPinModal(user)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Key size={18} />
                    Reset PIN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Create New User</h3>
            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Adjust Balance</h3>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <div className="font-semibold">{showBalanceModal.name}</div>
                  <div className="text-sm text-gray-400">Current: ₹{formatCash(showBalanceModal.balance)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => adjustBalance('CREDIT')}
                  disabled={!balanceAmount}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
                <button
                  onClick={() => adjustBalance('DEBIT')}
                  disabled={!balanceAmount}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded-lg flex items-center justify-center gap-1 font-medium transition-colors"
                >
                  <Minus size={16} />
                  Subtract
                </button>
                <button
                  onClick={() => setShowBalanceModal(null)}
                  className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Reset Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Reset Trading PIN</h3>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-orange-400" />
                <div>
                  <div className="font-semibold">{showPinModal.name}</div>
                  <div className="text-sm text-gray-400">
                    Current PIN: <span className="font-mono text-orange-400">•••{showPinModal.tradingPin.slice(-1)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">New 4-Digit PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setNewPin(value)
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1234"
                />
                <p className="text-xs text-gray-500 mt-1">Enter exactly 4 digits</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetPin}
                  disabled={newPin.length !== 4}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 py-3 rounded-lg transition-colors font-medium"
                >
                  Reset PIN
                </button>
                <button
                  onClick={() => {
                    setShowPinModal(null)
                    setNewPin('')
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
