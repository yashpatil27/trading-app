import { useState, useEffect, useRef } from 'react'

interface BtcPrice {
  btcUSD: number
  buyRate: number
  sellRate: number
  timestamp: string
  note?: string
}

export function useBitcoinPrice() {
  const [price, setPrice] = useState<BtcPrice | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Fetch initial price
    fetchInitialPrice()
    
    // Set up Server-Sent Events for real-time updates
    setupEventSource()

    // Start countdown timer
    startCountdownTimer()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  const startCountdownTimer = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Reset to 30 when countdown reaches 0
          // The price should update around this time
          return 30
        }
        return prev - 1
      })
    }, 1000)
  }

  const resetCountdown = () => {
    setCountdown(30)
    setLastUpdateTime(new Date())
  }

  const fetchInitialPrice = async () => {
    try {
      const response = await fetch('/api/btc-price')
      const data = await response.json()
      setPrice(data)
      resetCountdown()
    } catch (error) {
      console.error('Error fetching initial price:', error)
      setError('Failed to fetch initial price')
    }
  }

  const setupEventSource = () => {
    try {
      const eventSource = new EventSource('/api/price-stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
        console.log('🟢 Real-time price stream connected')
      }

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'connected') {
            console.log('✅ Price stream connection confirmed')
          } else if (message.type === 'price') {
            setPrice(message.data)
            resetCountdown() // Reset countdown when price updates
            console.log('📈 Price updated:', message.data.btcUSD)
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('🔴 EventSource error:', error)
        setIsConnected(false)
        setError('Connection lost. Retrying...')
        
        // Reconnect after a delay
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            setupEventSource()
          }
        }, 5000)
      }

    } catch (error) {
      console.error('Error setting up EventSource:', error)
      setError('Failed to connect to price stream')
    }
  }

  return {
    price,
    isConnected,
    error,
    countdown,
    lastUpdateTime
  }
}
