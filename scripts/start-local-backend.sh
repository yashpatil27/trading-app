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

# Start Serveo tunnel (SSH-based, no password required)
echo "🌐 Starting Serveo tunnel..."
ssh -o StrictHostKeyChecking=no -R bittrade-api:80:localhost:3001 serveo.net &
TUNNEL_PID=$!

echo "Serveo PID: $TUNNEL_PID"

# Keep the script running
echo "✅ Local backend and tunnel started!"
echo "🌐 Your API is now accessible at: https://bittrade-api.serveo.net"
echo "📝 Update your frontend to use this URL as API_BASE_URL"
echo "🛑 Press Ctrl+C to stop both services"

# Trap to kill both processes on exit
trap "kill $BACKEND_PID $TUNNEL_PID 2>/dev/null" EXIT

wait
