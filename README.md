# BitTrade - Bitcoin Trading Platform

A Next.js web application for Bitcoin trading with INR in India, featuring a Strike-like mobile UI/UX.

## Features

- **User Authentication**: Secure login system
- **Bitcoin Trading**: Buy/sell Bitcoin with custom rates (BTC/USD * 91 for buy, BTC/USD * 88 for sell)
- **Real-time Pricing**: Live Bitcoin price updates from Coinbase API
- **Admin Dashboard**: Create users and manage balances
- **Transaction History**: Complete trade and balance history
- **Mobile-First Design**: Strike-like clean and intuitive interface

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v4
- **UI Components**: Lucide React icons
- **Charts**: Recharts (for future analytics)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trading-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Seed the database with test users:
```bash
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Credentials

### Admin User
- **Email**: admin@bittrade.com
- **Password**: admin123
- **Features**: Can create users, adjust balances, view all users

### Demo User
- **Email**: user@bittrade.com
- **Password**: user123
- **Starting Balance**: ₹100,000
- **Features**: Can trade Bitcoin, view trade history

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### User APIs
- `GET /api/user` - Get current user data
- `GET /api/btc-price` - Get current Bitcoin price and rates

### Trading APIs
- `POST /api/trade` - Create a new trade
- `GET /api/trade` - Get user's trade history

### Admin APIs (Admin only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `POST /api/admin/balance` - Adjust user balance

## Database Schema

### User
- Basic user information, role, and balance

### Trade
- Trade records with type (BUY/SELL), amount, price, and totals

### BalanceHistory
- Complete audit trail of all balance changes

### BtcPrice
- Historical Bitcoin price records

## Trading Logic

- **Buy Rate**: BTC/USD price × 91
- **Sell Rate**: BTC/USD price × 88
- **No actual Bitcoin**: All trades are recorded in database only
- **Balance Management**: Automatic balance updates on trades

## Deployment

For production deployment:

1. Set up a PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Set `NEXTAUTH_SECRET` to a secure random string
4. Update `NEXTAUTH_URL` to your domain
5. Run migrations: `npx prisma migrate deploy`
6. Build and deploy: `npm run build && npm start`

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Role-based access control
- API route protection
- Input validation and sanitization

## Future Enhancements

- Real-time price updates with WebSockets
- Advanced charting and analytics
- Mobile app with React Native
- KYC integration
- Payment gateway integration
- Email notifications
- Two-factor authentication
