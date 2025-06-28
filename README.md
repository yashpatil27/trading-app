# ₿itTrade - Bitcoin Trading Platform

A modern Bitcoin trading platform built with Next.js, allowing users to buy and sell Bitcoin with Indian Rupees (INR).

## 🚀 Features

- **Real-time Bitcoin Trading** - Buy and sell Bitcoin with live price updates
- **Portfolio Analytics** - Track performance with detailed metrics
- **Transaction History** - Complete trading and balance history
- **Admin Panel** - User management and balance administration
- **Mobile-First Design** - Optimized for mobile trading experience
- **Performance Metrics** - Profit/loss tracking, win rates, cost basis analysis

## 📱 Three Main Tabs

1. **Home** - Trading interface with buy/sell functionality
2. **Portfolio** - Investment overview and performance analytics
3. **History** - Complete transaction and trading history

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Caching**: Redis for balance caching
- **Real-time**: Server-Sent Events for price updates
- **Process Management**: PM2 for production deployment

## 📚 Documentation

**👉 For detailed explanations of every file and how to make changes, see [DOCUMENTATION.md](./DOCUMENTATION.md)**

The documentation explains:
- What every file does in simple terms
- How to make common changes (colors, rates, features)
- Step-by-step customization examples
- Troubleshooting guide

## ⚡ Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
pm2 start npm --name "trading-app" -- start
```

## 🔧 Common Changes

- **Change buy/sell rates**: Edit `/src/app/api/trade/route.ts`
- **Modify colors**: Update `/src/app/globals.css`
- **Add new features**: Follow patterns in `/src/app/dashboard/page.tsx`
- **Database changes**: Modify `/prisma/schema.prisma`

## 📊 Performance Features

- **Realized P&L**: Profit from completed trades using FIFO cost basis
- **Unrealized P&L**: Paper gains on current Bitcoin holdings
- **Win Rate**: Percentage of profitable trading sessions
- **Cost Basis Analysis**: Average purchase price and break-even points
- **Trading Statistics**: Volume, frequency, and performance metrics

## 🔐 Security Features

- **PIN Confirmation**: 4-digit PIN for trade execution
- **Session Management**: Secure user authentication
- **Admin Controls**: Separate admin interface for user management
- **Balance Caching**: Redis-based fast balance lookups

## 🌐 Access

- **Local**: http://localhost:3000
- **Network**: http://your-server-ip:3000

## 📖 Need Help?

1. **Read the [DOCUMENTATION.md](./DOCUMENTATION.md)** - Comprehensive guide for beginners
2. **Check the code comments** - Inline explanations throughout the codebase
3. **Study existing patterns** - See how features are implemented and replicate

---

*Built with ❤️ for the Bitcoin community*
