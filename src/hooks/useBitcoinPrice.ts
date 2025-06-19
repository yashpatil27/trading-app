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
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Fetch initial price
    fetchInitialPrice()
    
    // Set up Server-Sent Events for real-time updates
    setupEventSource()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const fetchInitialPrice = async () => {
    try {
      const response = await fetch('/api/btc-price')
      const data = await response.json()
      setPrice(data)
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
    error
  }
}
