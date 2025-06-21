// API Configuration for hybrid hosting
const isDevelopment = process.env.NODE_ENV === 'development'
const isClient = typeof window !== 'undefined'

// For production frontend hosted on bittrade.co.in
// This should point to your LocalTunnel URL
const PRODUCTION_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bittrade-api.loca.lt'

// For local development
const DEVELOPMENT_API_BASE = 'http://localhost:3000'

export const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_BASE : PRODUCTION_API_BASE

// API endpoints
export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  user: `${API_BASE_URL}/api/user`,
  trade: `${API_BASE_URL}/api/trade`,
  transactions: `${API_BASE_URL}/api/transactions`,
  btcPrice: `${API_BASE_URL}/api/btc-price`,
  priceStream: `${API_BASE_URL}/api/price-stream`,
  verifyPin: `${API_BASE_URL}/api/verify-pin`,
  admin: {
    balance: `${API_BASE_URL}/api/admin/balance`,
    users: `${API_BASE_URL}/api/admin/users`,
    pin: `${API_BASE_URL}/api/admin/pin`,
    depositHistory: `${API_BASE_URL}/api/admin/deposit-history`,
  },
  ws: `${API_BASE_URL}/api/ws`,
}

export default API_ENDPOINTS
