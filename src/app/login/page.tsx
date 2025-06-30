'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Eye, EyeOff, LogIn, UserPlus, User, Mail, Lock, Key } from 'lucide-react'
import PinInput from '@/components/PinInput'
import PinConfirmationModal from '@/components/PinConfirmationModal'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isRegister, setIsRegister] = useState(false)
  
  // Login form state
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    tradingPin: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // PIN confirmation modal state
  const [showPinModal, setShowPinModal] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (registerData.tradingPin.length !== 4) {
      setError('Trading PIN must be 4 digits')
      return
    }

    // Show PIN confirmation modal instead of creating account immediately
    setShowPinModal(true)
  }

  const handlePinConfirmation = async (enteredPin: string): Promise<boolean> => {
    // Check if entered PIN matches the one from registration form
    if (enteredPin !== registerData.tradingPin) {
      return false // This will show error in the modal
    }

    // PIN matches, now create the account
    setIsCreatingAccount(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Close modal and show success message
        setShowPinModal(false)
        alert(`🎉 Welcome ${registerData.name}! Your account has been created successfully. You can now sign in.`)
        
        // Switch to login tab and pre-fill email
        setIsRegister(false)
        setCredentials({ email: registerData.email, password: '' })
        setRegisterData({ email: '', name: '', password: '', confirmPassword: '', tradingPin: '' })
        
        return true
      } else {
        setError(data.error || 'Registration failed')
        setShowPinModal(false)
        return false
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setShowPinModal(false)
      return false
    } finally {
      setIsCreatingAccount(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                <h1 className="text-4xl font-semibold text-white mb-2">₿itTrade</h1>
          <p className="text-zinc-400">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => { setIsRegister(false); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              !isRegister
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              isRegister
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Register
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Login Form */}
        {!isRegister && (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        )}

        {/* Registration Form */}
        {isRegister && (
          <form className="space-y-6" onSubmit={handleRegisterSubmit}>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="Your Full Name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:ring-1 ${
                    registerData.confirmPassword && registerData.password !== registerData.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                <Key className="h-4 w-4 inline mr-1" />
                Choose Your 4-Digit Trading PIN
              </label>
              <div className="flex justify-center">
                <PinInput
                  value={registerData.tradingPin}
                  onChange={(pin) => setRegisterData({ ...registerData, tradingPin: pin })}
                />
              </div>
              <p className="text-zinc-400 text-xs mt-2 text-center">
                You'll use this PIN to confirm all trades
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || registerData.password !== registerData.confirmPassword || registerData.tradingPin.length !== 4}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Secure Bitcoin trading platform
          </p>
        </div>
      </div>

      {/* PIN Confirmation Modal */}
      <PinConfirmationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirmation}
        title="Confirm Your Trading PIN"
        description={`Please re-enter your 4-digit PIN to create your account.\nThis PIN will be used to confirm all your future trades.`}
        isLoading={isCreatingAccount}
      />
    </div>
  )
}
