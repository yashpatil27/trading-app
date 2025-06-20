'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Minus, ArrowLeft, User } from 'lucide-react'

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
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Create User
          </button>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Users List */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} />
            <h2 className="text-xl font-semibold">Users ({users.length})</h2>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={18} />
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">Balance: </span>
                        <span className="font-semibold">₹{Math.floor(user.balance).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Trades: </span>
                        <span>{user._count.trades}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">PIN: </span>
                        <span className="font-mono text-orange-400">•••{user.tradingPin.slice(-1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Joined: </span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBalanceModal(user)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      Adjust Balance
                    </button>
                    <button
                      onClick={() => setShowPinModal(user)}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                    >
                      Reset PIN
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New User</h3>
            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 py-2 rounded-lg"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
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
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Adjust Balance</h3>
            <p className="text-gray-400 mb-4">
              {showBalanceModal.name} - Current Balance: ₹{Math.floor(showBalanceModal.balance).toLocaleString('en-IN')}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => adjustBalance('CREDIT')}
                  disabled={!balanceAmount}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded-lg flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  Add
                </button>
                <button
                  onClick={() => adjustBalance('DEBIT')}
                  disabled={!balanceAmount}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-2 rounded-lg flex items-center justify-center gap-1"
                >
                  <Minus size={16} />
                  Subtract
                </button>
                <button
                  onClick={() => setShowBalanceModal(null)}
                  className="bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
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
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reset Trading PIN</h3>
            <p className="text-gray-400 mb-4">
              Reset PIN for: <span className="text-white font-semibold">{showPinModal.name}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Current PIN: <span className="font-mono text-orange-400">•••{showPinModal.tradingPin.slice(-1)}</span>
            </p>
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-center text-lg tracking-widest"
                  placeholder="1234"
                />
                <p className="text-xs text-gray-500 mt-1">Enter exactly 4 digits</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetPin}
                  disabled={newPin.length !== 4}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-2 rounded-lg transition-colors"
                >
                  Reset PIN
                </button>
                <button
                  onClick={() => {
                    setShowPinModal(null)
                    setNewPin('')
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
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
