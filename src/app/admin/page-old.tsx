'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Minus, ArrowLeft, User, Wallet, Calendar, TrendingUp, Shield, Key, CreditCard, Phone, Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  tradingPin: string
  balance: number
  btcAmount?: number
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
  const [balanceCurrency, setBalanceCurrency] = useState<'INR' | 'BTC'>('INR')
  const [showResetModal, setShowResetModal] = useState<User | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null)
  const [newPin, setNewPin] = useState('')
  const [newPassword, setNewPassword] = useState('')
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

  const createUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        setShowCreateUser(false)
        setNewUser({ email: '', name: '', password: '', role: 'USER' })
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
          type,
          currency: balanceCurrency
        })
      })

      if (response.ok) {
        setShowBalanceModal(null)
        setBalanceAmount('')
        setBalanceReason('')
        setBalanceCurrency('INR')
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

  const resetCredentials = async () => {
    if (!showResetModal) return

    try {
      const updates: any = {}
      if (newPin) {
        updates.newPin = newPin
      }
      if (newPassword) {
        updates.newPassword = newPassword
      }

      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: showResetModal.id,
          ...updates
        })
      })

      if (response.ok) {
        setShowResetModal(null)
        setNewPin('')
        setNewPassword('')
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error resetting credentials:', error)
      alert('Failed to reset credentials')
    }
  }

  const deleteUser = async () => {
    if (!showDeleteModal) return

    try {
      const response = await fetch(`/api/admin/users?userId=${showDeleteModal.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(null)
        fetchUsers()
        alert('User deleted successfully')
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const formatCash = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0"
    return Math.floor(amount).toLocaleString('en-IN')
  }

  const formatBitcoin = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0.00000000"
    return amount.toFixed(8)
  }


  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (session?.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Shield className="text-orange-500" size={28} />
                Admin Panel
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage users and system operations</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateUser(true)}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Plus size={16} />
            Create User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={20} />
              <span className="text-gray-400 text-sm">Total Users</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="text-green-500" size={20} />
              <span className="text-gray-400 text-sm">Total Cash</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              ₹{formatCash(users.reduce((sum, user) => sum + (user.balance || 0), 0))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-orange-500" size={20} />
              <span className="text-gray-400 text-sm">Total Bitcoin</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              ₿{formatBitcoin(users.reduce((sum, user) => sum + (user.btcAmount || 0), 0))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-purple-500" size={20} />
              <span className="text-gray-400 text-sm">Admins</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {users.filter(user => user.role === 'ADMIN').length}
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Users size={20} />
              User Management
            </h2>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Cash Balance</th>
                    <th className="text-left p-4 font-medium">Bitcoin Balance</th>
                    <th className="text-left p-4 font-medium">Trades</th>
                    <th className="text-left p-4 font-medium">PIN</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-600 rounded-full p-2">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">₹{formatCash(user.balance || 0)}</td>
                      <td className="p-4 font-medium">₿{formatBitcoin(user.btcAmount || 0)}</td>
                      <td className="p-4">{user._count.trades}</td>
                      <td className="p-4 font-mono">{user.tradingPin}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setShowBalanceModal(user)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Adjust Balance
                          </button>
                          <button
                            onClick={() => setShowResetModal(user)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(user)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                {/* User Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-600 rounded-full p-2">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                </div>

                {/* Balances Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet size={14} className="text-green-500" />
                      <span className="text-xs text-gray-400">Cash Balance</span>
                    </div>
                    <div className="font-semibold text-white">₹{formatCash(user.balance || 0)}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-orange-500" />
                      <span className="text-xs text-gray-400">Bitcoin Balance</span>
                    </div>
                    <div className="font-semibold text-white">₿{formatBitcoin(user.btcAmount || 0)}</div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>{user._count.trades} trades</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Key size={14} />
                    <span className="font-mono">PIN: {user.tradingPin}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowBalanceModal(user)}
                    className="bg-green-600 hover:bg-green-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                  >
                    <Wallet size={16} />
                    Adjust Balance
                  </button>
                  <button
                    onClick={() => setShowResetModal(user)}
                    className="bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                  >
                    <Key size={16} />
                    Reset
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(user)}
                    className="bg-red-600 hover:bg-red-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <Wallet size={20} />
              Adjust Balance
            </h3>
            
            {/* User Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <div className="font-semibold">{showBalanceModal.name}</div>
                  <div className="text-sm text-gray-400">
                    Cash: ₹{formatCash(showBalanceModal.balance || 0)} | 
                    Bitcoin: ₿{formatBitcoin(showBalanceModal.btcAmount || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Adjust Currency</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBalanceCurrency('INR')}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      balanceCurrency === 'INR' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    💰 Cash (INR)
                  </button>
                  <button
                    onClick={() => setBalanceCurrency('BTC')}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      balanceCurrency === 'BTC' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    ₿ Bitcoin
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Amount {balanceCurrency === 'INR' ? '(₹)' : '(₿)'}
                </label>
                <input
                  type="number"
                  step={balanceCurrency === 'INR' ? '0.01' : '0.00000001'}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={balanceCurrency === 'INR' ? 'Enter INR amount' : 'Enter BTC amount (e.g., 0.001)'}
                />
                {balanceCurrency === 'BTC' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Use 8 decimal places for precision (e.g., 0.00001000)
                  </div>
                )}
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`Reason for ${balanceCurrency} adjustment`}
                />
              </div>

              {/* Action Buttons */}
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
                  Remove
                </button>
                <button
                  onClick={() => {
                    setShowBalanceModal(null)
                    setBalanceAmount('')
                    setBalanceReason('')
                    setBalanceCurrency('INR')
                  }}
                  className="bg-gray-600 hover:bg-gray-500 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <Key size={20} />
              Reset Credentials
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <div className="font-semibold">{showResetModal.name}</div>
                  <div className="text-sm text-gray-400">{showResetModal.email}</div>
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
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-center font-mono text-lg"
                  placeholder="0000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="New Password"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetCredentials}
                  className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setShowResetModal(null)
                    setNewPin('')
                    setNewPassword('')
                  }}
                  className="bg-gray-600 hover:bg-gray-500 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
              <Trash2 size={20} />
              Delete User
            </h3>
            
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-red-400" />
                <div>
                  <div className="font-semibold text-white">{showDeleteModal.name}</div>
                  <div className="text-sm text-gray-400">{showDeleteModal.email}</div>
                  <div className="text-sm text-red-400">
                    Current balance: ₹{formatCash(showDeleteModal.balance || 0)} | 
                    ₿{formatBitcoin(showDeleteModal.btcAmount || 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-red-400 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-gray-300 text-sm">
                  This will permanently delete the user and all their transaction history.
                  {(showDeleteModal.balance > 0 || showDeleteModal.btcAmount > 0) && (
                    <span className="block text-red-400 mt-2">
                      User has active balance. Please adjust balance to zero first.
                    </span>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={deleteUser}
                  disabled={showDeleteModal.balance > 0 || showDeleteModal.btcAmount > 0}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <Trash2 size={16} />
                  Delete User
                </button>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="bg-gray-600 hover:bg-gray-500 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Password"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={createUser}
                  disabled={!newUser.email || !newUser.name || !newUser.password}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 py-3 rounded-lg font-medium transition-colors"
                >
                  Create User
                </button>
                <button
                  onClick={() => {
                    setShowCreateUser(false)
                    setNewUser({ email: '', name: '', password: '', role: 'USER' })
                  }}
                  className="bg-gray-600 hover:bg-gray-500 py-3 rounded-lg font-medium transition-colors"
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

// --- System Rates Section ---
const [showPinModal, setShowPinModal] = useState(false);
const [selectedRate, setSelectedRate] = useState<'buy' | 'sell' | null>(null);
const [newRate, setNewRate] = useState('');

const updateRate = async (type: 'buy' | 'sell', pin: string) => {
  const rate = parseFloat(newRate);
  if (isNaN(rate) || rate <= 0) return alert('Please enter a valid rate.');

  try {
    const response = await fetch('/api/admin/pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
    const isValidPin = await response.json();
    if (!isValidPin) {
      return alert('Invalid PIN');
    }

    await fetch(`/api/rates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, rate }) });
    setNewRate('');
    setSelectedRate(null);
    alert('Rate updated successfully.');
  } catch (error) {
    console.error('Failed to update rate:', error);
    alert('Failed to update rate.');
  }
};

return (
  <div className="min-h-screen bg-black text-white">
    {/* Existing Content ... */}

    {/* System Rates Update Section */}
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Update USD/INR Rates</h2>
      <div className="grid grid-cols-2 gap-4">
        <input type="number" className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="Enter new rate" />
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-green-600 hover:bg-green-700 p-2 rounded-lg" onClick={() => { setSelectedRate('buy'); setShowPinModal(true); }}>Set Buy Rate</button>
          <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg" onClick={() => { setSelectedRate('sell'); setShowPinModal(true); }}>Set Sell Rate</button>
        </div>
      </div>
    </div>

    {/* PIN Verification Modal */}
    <PinConfirmationModal
      isOpen={showPinModal}
      onClose={() => setShowPinModal(false)}
      onConfirm={async (pin) => {
        if (selectedRate) {
          await updateRate(selectedRate, pin);
          setShowPinModal(false);
        }
      }}
      title="Verify PIN"
      description="Enter your 4-digit PIN to confirm rate update"
    />

    {/* Existing Content ... */}
  </div>
);
