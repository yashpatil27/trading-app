# 🚀 Bitcoin Trading App

A modern, full-stack Bitcoin trading application built with Next.js 15, featuring real-time price tracking, secure authentication, and a professional admin panel. This application simulates Bitcoin trading with mock data and provides a complete trading experience.

![Bitcoin Trading App](https://img.shields.io/badge/Bitcoin-Trading-orange?style=for-the-badge&logo=bitcoin)
![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748?style=for-the-badge&logo=prisma)

## 📋 Table of Contents
- [🌟 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📖 API Documentation](#-api-documentation)
- [🏗️ Architecture](#️-architecture)
- [🎨 UI Components](#-ui-components)
- [🔒 Security Features](#-security-features)
- [📱 Responsive Design](#-responsive-design)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

### 💰 Trading Features
- **Real-time Bitcoin Price Tracking** - Live price updates every 30 seconds
- **Buy/Sell Bitcoin** - Execute trades with instant confirmation
- **Portfolio Management** - Track your Bitcoin holdings and USD balance
- **Transaction History** - Complete audit trail of all trades and balance changes
- **Price Charts** - Visual representation of price movements (using Recharts)

### 👤 User Management
- **Secure Authentication** - NextAuth.js with credential-based login
- **User Dashboard** - Personalized trading interface
- **Balance Management** - Real-time balance updates and tracking
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

## 📦 Installation

### Prerequisites

Make sure you have the following installed:
- **Node.js**: v18.17+ (recommended: v20+)
- **npm**: v9+
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

# Bitcoin Price API (Optional - uses mock data if not provided)
# BITCOIN_API_KEY=your-api-key-here
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
Username: admin
Password: admin123
```

```
Username: user
Password: user123
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
model User {
  id          String   @id @default(cuid())
  username    String   @unique
  password    String
  usdBalance  Float    @default(10000.0)
  btcBalance  Float    @default(0.0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  transactions Transaction[]
  accounts     Account[]
  sessions     Session[]
}
```

### Authentication Configuration

NextAuth.js is configured in `src/lib/auth.ts`:

- **Provider**: Credentials (username/password)
- **Session Strategy**: JWT
- **Password Hashing**: bcryptjs with salt rounds

### API Rate Limiting

Price updates are throttled to prevent API abuse:
- **Price Updates**: Every 30 seconds
- **Max Concurrent Requests**: Limited per user session

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signin`
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Trading Endpoints

#### GET `/api/btc-price`
Get current Bitcoin price
```json
{
  "price": 45000.50,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/trade`
Execute a trade
```json
{
  "type": "BUY",
  "amount": 0.1,
  "price": 45000.50
}
```

#### GET `/api/transactions`
Get user transaction history
```json
{
  "transactions": [
    {
      "id": "1",
      "type": "BUY",
      "amount": 0.1,
      "price": 45000.50,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### User Management

#### GET `/api/user`
Get current user profile
```json
{
  "id": "user_123",
  "username": "admin",
  "usdBalance": 10000.00,
  "btcBalance": 0.1
}
```

### Admin Endpoints

#### GET `/api/admin/users`
Get all platform users (Admin only)

#### GET `/api/admin/balance`
Get platform balance statistics (Admin only)

## 🏗️ Architecture

### Project Structure

```
trading-app/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Database schema definition
│   ├── seed.ts           # Database seeding script
│   └── migrations/       # Database migration files
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── login/       # Login page
│   │   └── admin/       # Admin panel
│   ├── components/       # React components
│   │   ├── BuyModal.tsx
│   │   ├── SellModal.tsx
│   │   └── TradeDetailModal.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useBitcoinPrice.ts
│   ├── lib/             # Utility libraries
│   │   ├── auth.ts      # NextAuth configuration
│   │   └── prisma.ts    # Prisma client
│   ├── services/        # Business logic services
│   │   └── priceService.ts
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── package.json        # Dependencies and scripts
```

### Data Flow

1. **Authentication**: NextAuth.js handles user sessions
2. **Price Service**: Background service fetches Bitcoin prices
3. **Database**: Prisma manages all data operations
4. **Real-time Updates**: WebSocket connections for live data
5. **API Layer**: RESTful endpoints for client-server communication

## 🎨 UI Components

### Core Components

#### Dashboard (`src/app/dashboard/page.tsx`)
- Real-time Bitcoin price display
- Portfolio overview (USD + BTC balances)
- Quick trade buttons (Buy/Sell)
- Recent transaction history

#### Trading Modals
- **BuyModal**: Execute Bitcoin purchases
- **SellModal**: Execute Bitcoin sales
- **TradeDetailModal**: View transaction details

#### Admin Panel (`src/app/admin/page.tsx`)
- User management interface
- Platform statistics
- Transaction monitoring

### Icon System

The app uses the official Bitcoin Design Icons for consistency:

```tsx
import { BitcoinCircle, ArrowUp, ArrowDown } from '@bitcoin-design/bitcoin-icons-react'

// Bitcoin logo
<BitcoinCircle className="w-6 h-6 text-orange-500" />

// Trade directions
<ArrowUp className="w-4 h-4 text-green-500" />   // Buy
<ArrowDown className="w-4 h-4 text-red-500" />   // Sell
```

### Styling System

Tailwind CSS classes used throughout:

```css
/* Primary Bitcoin orange theme */
.bitcoin-orange { @apply text-orange-500 bg-orange-100; }

/* Success/Error states */
.success { @apply text-green-600 bg-green-100; }
.error { @apply text-red-600 bg-red-100; }

/* Card components */
.card { @apply bg-white rounded-lg shadow-md p-6; }
```

## 🔒 Security Features

### Authentication Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure session management
- **CSRF Protection**: Built-in NextAuth.js protection
- **Session Expiry**: Configurable session timeouts

### API Security
- **Route Protection**: Middleware-based auth checks
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Rate Limiting**: API endpoint throttling

### Data Security
- **Environment Variables**: Sensitive data in .env files
- **Database Encryption**: SQLite file-level security
- **Secure Headers**: Next.js security headers enabled

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Mobile Features
- Touch-friendly interface
- Optimized modal interactions
- Responsive navigation
- Mobile-first CSS approach

## 🧪 Testing

### Running Tests

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── components/          # Component tests
├── api/                # API endpoint tests
├── hooks/              # Hook tests
└── utils/              # Utility function tests
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
```

## 🔄 Development Workflow

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-feature`
2. Develop and test locally
3. Update database schema if needed: `npx prisma migrate dev`
4. Run tests: `npm test`
5. Commit changes: `git commit -m "feat: add new feature"`
6. Push and create PR: `git push origin feature/new-feature`

### Database Changes

```bash
# Create migration
npx prisma migrate dev --name descriptive-name

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## 🤝 Contributing

### Guidelines

1. **Code Style**: Follow ESLint configuration
2. **Commits**: Use conventional commit messages
3. **Testing**: Write tests for new features
4. **Documentation**: Update README for significant changes

### Commit Message Format

```
feat: add new trading feature
fix: resolve price update bug
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for trading logic
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bitcoin Design Community** for the excellent icon library
- **Next.js Team** for the amazing framework
- **Prisma Team** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

For support and questions:

- **GitHub Issues**: [Create an issue](https://github.com/yashpatil27/trading-app/issues)
- **Documentation**: Check this README and inline code comments
- **Email**: Contact the repository owner

---

**⚠️ Disclaimer**: This is a demo trading application for educational purposes. It uses mock data and should not be used for actual Bitcoin trading. Always use proper financial software for real trading activities.

---

Made with ❤️ and ⚡ by [Yash Patil](https://github.com/yashpatil27)
