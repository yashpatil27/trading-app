import PriceService from '@/services/priceService'

// Initialize the price service when the app starts
let priceServiceInitialized = false

export function initializeServices() {
  if (!priceServiceInitialized) {
    PriceService.getInstance()
    priceServiceInitialized = true
    console.log('🚀 Application services initialized')
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  initializeServices()
}
