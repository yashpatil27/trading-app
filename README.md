# 🚀 Bitcoin Trading App

A modern, full-stack Bitcoin trading application built with Next.js 15, featuring real-time price tracking, secure authentication, Redis caching, and a professional admin panel. This application simulates Bitcoin trading with mock data and provides a complete trading experience.

![Bitcoin Trading App](https://img.shields.io/badge/Bitcoin-Trading-orange?style=for-the-badge&logo=bitcoin)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748?style=for-the-badge&logo=prisma)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)

## 🆕 Latest Features (v2.0)

### ⚡ **Enterprise-Grade Performance Optimizations**
- **Redis Caching**: Lightning-fast balance lookups (39x performance improvement)
- **Consolidated Database Schema**: Single-table approach for better performance
- **Smart Cache Management**: Write-through caching with automatic invalidation
- **Performance Monitoring**: Built-in Redis monitoring and analytics

### 💎 **Enhanced Database Architecture**
- **Unified Transaction Model**: All financial operations in one optimized table
- **Clear Field Naming**: INR/BTC prefixed fields for better clarity
- **USD/INR Rate Tracking**: Transparent tracking of buy (91) and sell (88) rates
- **Atomic Operations**: Race-condition-free balance updates

### 🔧 **Developer Experience Improvements**
- **Cache Warming**: Automatic cache population on application startup
- **Graceful Fallbacks**: Application works seamlessly even if Redis is unavailable
- **Debug Information**: Cache hit/miss information in API responses
- **Monitoring Tools**: Redis performance monitoring scripts

## 📋 Table of Contents
- [🌟 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📖 API Documentation](#-api-documentation)
- [🏗️ Architecture](#️-architecture)
- [⚡ Performance](#-performance)
- [🔍 Monitoring](#-monitoring)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

## 🌟 Features

### 💰 Trading Features
- **Real-time Bitcoin Price Tracking** - Live price updates every 30 seconds
- **Buy/Sell Bitcoin** - Execute trades with instant confirmation
- **Portfolio Management** - Track your Bitcoin holdings and INR balance
- **Transaction History** - Complete audit trail of all trades and balance changes
- **Price Charts** - Visual representation of price movements (using Recharts)
- **Smart Rate Calculation** - Automatic buy/sell rate calculation with spreads

### 👤 User Management
- **Secure Authentication** - NextAuth.js with credential-based login
- **User Dashboard** - Personalized trading interface
- **Real-time Balance Updates** - Instant balance updates with Redis caching
- **Session Management** - Secure session handling with JWT

### 🛡️ Admin Panel
- **User Administration** - View and manage all registered users
- **Transaction Monitoring** - Monitor all platform transactions
- **Balance Management** - Admin tools for user balance management
- **System Analytics** - Platform usage and performance metrics

### 🎨 Modern UI/UX
- **Bitcoin Design Icons** - Professional Bitcoin-themed iconography
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Theme Support** - Elegant theme switching
- **Interactive Modals** - Smooth modal interactions for trades and details
- **Real-time Updates** - Live data without page refreshes

### ⚡ Performance & Scalability
- **Redis Caching** - 39x faster balance lookups
- **Optimized Queries** - Single-table architecture for better performance
- **Connection Pooling** - Efficient database connection management
- **Cache Warming** - Pre-populated cache for active users
- **Graceful Degradation** - Fallback mechanisms for high availability

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: 
  - Bitcoin Design Icons React (v0.1.10)
  - Lucide React (v0.518.0)
- **Charts**: Recharts (v2.15.3)
- **HTTP Client**: Axios (v1.10.0)

### Backend
- **Runtime**: Node.js
- **Database**: SQLite (via Prisma)
- **Cache**: Redis 7
- **ORM**: Prisma (v6.10.1)
- **Authentication**: NextAuth.js (v4.24.11)
- **Password Hashing**: bcryptjs (v3.0.2)
- **WebSockets**: ws (v8.18.2)
- **Cron Jobs**: node-cron (v4.1.0)

### Development Tools
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Build Tool**: Next.js Turbopack
- **TypeScript Compiler**: TSX (v4.20.3)
- **Containerization**: Docker (for Redis)

## 📦 Installation

### Prerequisites

Make sure you have the following installed:
- **Node.js**: v18.17+ (recommended: v20+)
- **npm**: v9+
- **Docker**: Latest version (for Redis)
- **Git**: Latest version

### Clone the Repository

```bash
git clone https://github.com/yashpatil27/trading-app.git
cd trading-app
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Bitcoin Price API (Optional - uses mock data if not provided)
# BITCOIN_API_KEY=your-api-key-here
```

### Start Redis Server

```bash
# Using Docker
docker run -d -p 6379:6379 --name trading-app-redis redis:7-alpine

# Or install Redis locally on Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
```

### Database Setup

Initialize and seed the database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npm run db:seed
```

## 🚀 Quick Start

### Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

### Default Login Credentials

```
Admin User:
Email: admin@bittrade.com
Password: admin123
```

```
Demo User:
Email: user@bittrade.com  
Password: user123
Initial Balance: ₹100,000
```

### Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration

### Database Configuration

The app uses SQLite by default with Prisma ORM. Database schema is defined in `prisma/schema.prisma`:

```prisma
model Transaction {
  id               String          @id @default(cuid())
  userId           String
  type             TransactionType
  btcAmount        Float?          // Amount in BTC
  btcPriceUsd      Float?          // BTC/USD price at time
  btcPriceInr      Float?          // BTC/INR price at time  
  usdInrRate       Float?          // USD/INR rate used (91 for BUY, 88 for SELL)
  inrAmount        Float           // INR amount
  inrBalanceAfter  Float           // INR balance after transaction
  btcBalanceAfter  Float           // BTC balance after transaction
  reason           String?         // Transaction reason
  createdAt        DateTime        @default(now())
  
  user             User            @relation(fields: [userId], references: [id])
}
```

### Authentication Configuration

NextAuth.js is configured in `src/lib/auth.ts`:

- **Provider**: Credentials (email/password)
- **Session Strategy**: JWT
- **Password Hashing**: bcryptjs with salt rounds

### Redis Configuration

Redis caching is configured in `src/lib/redis.ts`:

- **Connection**: Automatic connection management
- **Fallback**: Graceful fallback to database if Redis is unavailable
- **TTL**: 1-hour cache expiration for balance data
- **Monitoring**: Built-in performance monitoring

## ⚡ Performance

### Cache Performance Metrics

```
Without Redis: Balance lookup ~500-600ms
With Redis:    Balance lookup ~15-20ms

Performance Improvement: 30-40x faster! 🚀
```

### Redis Cache Monitoring

Monitor your Redis cache performance:

```bash
node scripts/redis-monitor.js
```

Sample output:
```
🔍 Redis Cache Monitor
======================
📊 Total cached balances: 4
💰 Current Cached Balances:
  balance:inr:user123: 95000.50 (TTL: 3550s)
  balance:btc:user123: 0.12345678 (TTL: 3550s)

⚡ Cache Performance Test:
  SET 100 keys: 12ms (0.12ms per key)
  GET 100 keys: 9ms (0.09ms per key)
```

### Scalability Considerations

- **Current setup**: Optimized for 1K-10K users
- **SQLite limits**: Consider PostgreSQL for 10K+ users
- **Redis scaling**: Current setup handles thousands of concurrent users
- **Horizontal scaling**: Stateless API design allows easy scaling

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signin`
```json
{
  "email": "user@bittrade.com",
  "password": "user123"
}
```

### Trading Endpoints

#### GET `/api/btc-price`
Get current Bitcoin price with buy/sell rates
```json
{
  "btcUSD": 95000.50,
  "buyRate": 8645000,  // btcUSD * 91
  "sellRate": 8360000, // btcUSD * 88
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/trade`
Execute a trade
```json
{
  "type": "BUY",
  "amount": 10000,      // INR amount for BUY
  "btcPrice": 95000.50
}
```

#### GET `/api/transactions`
Get user transaction history with unified format

#### GET `/api/user`
Get current user profile with cached balances
```json
{
  "id": "user_123",
  "email": "user@bittrade.com",
  "balance": 95000.50,
  "btcAmount": 0.12345678,
  "_debug": {
    "fromCache": true,
    "source": "redis"
  }
}
```

## 🏗️ Architecture

### Project Structure

```
trading-app/
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma             # Unified transaction model
│   ├── seed.ts                   # Database seeding
│   └── migrations/               # Database migrations
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes with caching
│   │   ├── dashboard/            # Dashboard page
│   │   ├── login/                # Login page
│   │   └── admin/                # Admin panel
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── prisma.ts            # Prisma client
│   │   ├── redis.ts             # Redis client
│   │   └── balanceCache.ts      # Cache management
│   ├── services/                 # Business logic services
│   └── types/                    # TypeScript definitions
├── scripts/                      # Utility scripts
│   └── redis-monitor.js         # Redis monitoring
└── package.json                 # Dependencies and scripts
```

### Data Flow with Caching

```
1. User Request → API Endpoint
2. Check Redis Cache → Cache Hit? Return immediately
3. Cache Miss? → Query Database → Update Cache → Return result
4. Trade Execution → Update Database → Update Cache → Notify user
```

## 🔍 Monitoring

### Application Logs
The application provides detailed logging for:
- Redis cache hits/misses
- Trade executions with cache updates
- Performance metrics
- Error handling and fallbacks

### Redis Monitoring
Use the built-in monitoring script:
```bash
node scripts/redis-monitor.js
```

### Performance Tracking
Monitor API response times in the application logs:
```
💰 Balance lookup for user@bittrade.com: ⚡ Redis cache
GET /api/user 200 in 16ms
```

## 🚀 Deployment

### Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=file:./dev.db
    depends_on:
      - redis
```

### Production Considerations

1. **Database**: Migrate to PostgreSQL for production
2. **Redis**: Use Redis Cluster for high availability
3. **Environment**: Use proper secrets management
4. **Monitoring**: Implement application monitoring (e.g., Sentry)
5. **Scaling**: Use load balancers for multiple app instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Monitor cache performance impact
- Ensure graceful fallbacks for Redis dependencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the Trading App Team

**Key Technologies**: Next.js 15 • TypeScript • Prisma • Redis • SQLite • NextAuth.js • Tailwind CSS
