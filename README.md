# ₿itTrade - Bitcoin Trading Platform

A modern Bitcoin trading platform built with Next.js, allowing users to buy and sell Bitcoin with Indian Rupees (INR).

## 🚀 Features

- **Real-time Bitcoin Trading** - Buy and sell Bitcoin with live price updates
- **Portfolio Analytics** - Track performance with detailed metrics
- **Transaction History** - Complete trading and balance history with enhanced UI
- **Admin Panel** - User management and balance administration
- **Mobile-First Design** - Optimized for mobile trading experience
- **Performance Metrics** - Profit/loss tracking, win rates, cost basis analysis
- **Enhanced Transaction Types** - Clear distinction between BTC and INR transactions
- **Improved User Experience** - User-friendly transaction labels and visual indicators

## 📱 Three Main Tabs

1. **Home** - Trading interface with buy/sell functionality
2. **Portfolio** - Investment overview and performance analytics
3. **History** - Complete transaction and trading history with enhanced transaction display

## 🆕 Recent Improvements (v2.0)

### Transaction System Overhaul
- **Clear Transaction Types**: Distinct types for DEPOSIT_BTC, DEPOSIT_INR, WITHDRAWAL_BTC, WITHDRAWAL_INR, BUY, SELL, and ADMIN
- **User-Friendly Labels**: "BTC DEPOSIT", "CASH DEPOSIT", "BTC WITHDRAWAL", "CASH WITHDRAWAL" instead of technical terms
- **Accurate Balance Tracking**: Proper INR equivalents calculated and stored for BTC transactions
- **Enhanced Modal System**: Separate modals for BTC and INR transactions with appropriate currency displays

### Visual Enhancements
- **Color-Coded Transactions**: 
  - Blue for deposits (both INR and BTC)
  - Yellow for withdrawals
  - Green for buy orders
  - Red for sell orders
  - Gray for admin transactions
- **Custom Icons**: Bitcoin-specific icons for BTC transactions, cash icons for INR transactions
- **Improved Typography**: Better readability with consistent styling

### Performance Fixes
- **Accurate Portfolio Calculations**: Fixed inflated returns caused by admin deposits
- **Proper Balance Display**: BTC modals now show correct Bitcoin balances instead of INR balances
- **Database Consistency**: Clean transaction type handling throughout the system

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Caching**: Redis for balance caching
- **Real-time**: Server-Sent Events for price updates
- **Process Management**: PM2 for production deployment
- **Icons**: Lucide React, Bitcoin Design Icons

## 📚 Documentation

**👉 For detailed explanations of every file and how to make changes, see [DOCUMENTATION.md](./DOCUMENTATION.md)**

The documentation explains:
- What every file does in simple terms
- How to make common changes (colors, rates, features)
- Step-by-step customization examples
- Transaction type system and modal architecture
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

### Cache Management
```bash
# Clear Redis cache for fresh data
redis-cli FLUSHALL
```

## 🔧 Common Changes

- **Change buy/sell rates**: Edit `/src/app/api/trade/route.ts`
- **Modify colors**: Update `/src/app/globals.css` and component-specific styles
- **Add new transaction types**: Update interfaces in `/src/app/dashboard/page.tsx`
- **Customize modal behavior**: Modify components in `/src/components/`
- **Database changes**: Modify `/prisma/schema.prisma`

## 📊 Performance Features

- **Realized P&L**: Profit from completed trades using FIFO cost basis
- **Unrealized P&L**: Paper gains on current Bitcoin holdings
- **Win Rate**: Percentage of profitable trading sessions
- **Cost Basis Analysis**: Average purchase price and break-even points
- **Trading Statistics**: Volume, frequency, and performance metrics
- **Transaction Analytics**: Detailed breakdown by transaction type

## 🎨 Transaction Display System

### Transaction Types
- **BUY/SELL**: Trading transactions with green/red indicators
- **DEPOSIT_INR/DEPOSIT_BTC**: Cash and Bitcoin deposits with blue styling
- **WITHDRAWAL_INR/WITHDRAWAL_BTC**: Cash and Bitcoin withdrawals with yellow styling
- **ADMIN**: Administrative transactions with gray indicators

### Modal System
- **Trade Modals**: For BUY/SELL transactions showing trade details
- **Deposit/Withdrawal Modals**: Currency-specific modals showing appropriate balances
- **Consistent Theming**: Dark UI with color-coded elements matching transaction types

## 🔐 Security Features

- **PIN Confirmation**: 4-digit PIN for trade execution
- **Session Management**: Secure user authentication
- **Admin Controls**: Separate admin interface for user management
- **Balance Caching**: Redis-based fast balance lookups
- **Transaction Integrity**: Proper validation and error handling

## 🌐 Access

- **Local**: http://localhost:3000
- **Network**: http://your-server-ip:3000

## 🔄 Deployment Notes

The application uses PM2 for process management. Recent changes include:
- Enhanced error handling for build processes
- Improved component import management
- Better cache invalidation strategies
- Streamlined modal architecture

## 📖 Need Help?

1. **Read the [DOCUMENTATION.md](./DOCUMENTATION.md)** - Comprehensive guide for beginners
2. **Check the code comments** - Inline explanations throughout the codebase
3. **Study existing patterns** - See how features are implemented and replicate
4. **Review recent changes** - Check git history for implementation examples

## 🚀 Future Enhancements

- Additional cryptocurrency support
- Advanced charting and technical analysis
- Mobile app development
- Enhanced admin analytics
- Multi-language support

---

*Built with ❤️ for the Bitcoin community*

**Version 2.0** - Enhanced Transaction Management & User Experience
