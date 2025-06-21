#!/bin/bash

echo "🚀 Starting local backend for bittrade.co.in..."

# Copy local environment config
cp .env.local .env

# Start the backend on port 3001
echo "📡 Starting Next.js backend on port 3001..."
npm run dev -- --port 3001 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Backend running on http://localhost:3001"

# Wait a bit for the backend to start
sleep 8

# Start simple SSH tunnel without subdomain requirement
echo "🌐 Starting simple tunnel..."
ssh -o StrictHostKeyChecking=no -R 80:localhost:3001 serveo.net &
TUNNEL_PID=$!

echo "Tunnel PID: $TUNNEL_PID"

# Keep the script running
echo "✅ Local backend and tunnel started!"
echo "🌐 Your API tunnel URL will be displayed above"
echo "📝 Copy the HTTPS URL and update it in Vercel environment variables"
echo "🛑 Press Ctrl+C to stop both services"

# Trap to kill both processes on exit
trap "kill $BACKEND_PID $TUNNEL_PID 2>/dev/null" EXIT

wait
