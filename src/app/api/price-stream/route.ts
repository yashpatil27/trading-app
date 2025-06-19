import { NextRequest } from 'next/server'
import PriceService from '@/services/priceService'

export async function GET(req: NextRequest) {
  const priceService = PriceService.getInstance()
  
  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      
      // Subscribe to price updates
      const unsubscribe = priceService.subscribe((price) => {
        controller.enqueue(`data: ${JSON.stringify({ type: 'price', data: price })}\n\n`)
      })

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}
