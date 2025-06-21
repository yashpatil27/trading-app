#!/bin/bash

echo "🏗️  Building production version for bittrade.co.in..."

# Copy production environment
cp .env.production .env

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Production build complete!"
echo "📁 Build files are in the .next directory"
echo "🚀 You can deploy the .next directory to your hosting service"
