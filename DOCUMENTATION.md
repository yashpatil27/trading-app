# 📚 BitTrade App Documentation

Welcome to the BitTrade documentation! This guide explains every file and folder in simple terms so anyone can understand and make changes to the project.

## 🎯 What This App Does

BitTrade is a Bitcoin trading platform where users can:
- Buy and sell Bitcoin with Indian Rupees (INR)
- View their portfolio performance
- Track transaction history
- See real-time Bitcoin prices

## 📁 Project Structure Overview

```
trading-app/
├── src/                    # Main application code
├── prisma/                 # Database setup
├── public/                 # Public files (images, icons)
├── .next/                  # Built application (auto-generated)
├── node_modules/           # Installed packages (auto-generated)
└── Configuration files
```

---

## 📂 Main Folders Explained

### 🔧 `/src/` - The Heart of the Application

This is where all your app's code lives. Think of it as the brain of your application.

#### `/src/app/` - Pages and API Routes
Contains all the pages users see and backend functionality.

**🏠 Pages (What Users See):**
- `layout.tsx` - The wrapper around all pages (header, fonts, etc.)
- `page.tsx` - Home/landing page
- `globals.css` - Global styles for the entire app

**📱 User Pages:**
- `/dashboard/page.tsx` - Main trading interface (Home, Portfolio, History tabs)
- `/login/page.tsx` - User login page
- `/admin/page.tsx` - Admin control panel

**🔌 API Routes (Backend Logic):**
- `/api/auth/` - User login/logout system
- `/api/trade/` - Buy/sell Bitcoin functionality
- `/api/user/` - Get user balance and info
- `/api/btc-price/` - Bitcoin price fetching
- `/api/performance/` - Portfolio analytics
- `/api/transactions/` - Transaction history
- `/api/admin/` - Admin functions (add money, manage users)

#### `/src/components/` - Reusable UI Parts
Think of these as LEGO blocks you can use anywhere in your app.

- `BuyModal.tsx` - Pop-up window for buying Bitcoin
- `SellModal.tsx` - Pop-up window for selling Bitcoin
- `TradeDetailModal.tsx` - Shows details of a completed trade
- `DepositDetailModal.tsx` - Shows details of deposits/withdrawals
- `PinConfirmationModal.tsx` - PIN entry for trade confirmation
- `SessionProvider.tsx` - Handles user login sessions

#### `/src/hooks/` - Custom React Logic
Special functions that handle complex operations.

- `useBitcoinPrice.ts` - Automatically fetches and updates Bitcoin prices every 30 seconds

#### `/src/lib/` - Utility Functions
Helper functions that do specific tasks.

- `auth.ts` - Authentication configuration (login system)
- `prisma.ts` - Database connection setup
- `balanceCache.ts` - Fast balance lookup using Redis
- `currencyUtils.ts` - Money and Bitcoin calculation helpers
- `performanceCalculations.ts` - Portfolio performance analytics
- `startup.ts` - App initialization when server starts

### 🗄️ `/prisma/` - Database Configuration

Controls how data is stored and retrieved.

- `schema.prisma` - Database structure (tables, columns, relationships)
- `dev.db` - SQLite database file (your actual data)
- `seed.ts` - Sample data for testing

### 🌐 `/public/` - Public Files

Files that users can directly access (images, favicons, etc.)

---

## 🔍 Key Files Explained in Detail

### 📱 `/src/app/dashboard/page.tsx` - Main App Interface

**🎯 What it does:** The main page where users trade Bitcoin and view their portfolio.

**📋 Contains 3 tabs:**
1. **Home Tab** - Trading interface with buy/sell buttons
2. **Portfolio Tab** - Investment overview and performance metrics  
3. **History Tab** - Complete transaction history

**💡 How to modify:**
- **Change colors:** Look for `className` with color names (e.g., `bg-green-600`, `text-red-400`)
- **Add new sections:** Copy existing card structure and modify content
- **Change tab order:** Modify the bottom navigation section
- **Update performance metrics:** Edit the `PortfolioOverview` component

### 🔐 `/src/app/api/trade/route.ts` - Buy/Sell Logic

**🎯 What it does:** Handles when users buy or sell Bitcoin.

**💡 Key sections:**
- **BUY logic:** Calculates how much Bitcoin user gets for their INR
- **SELL logic:** Calculates how much INR user gets for their Bitcoin
- **Rate differences:** Buy rate (91 INR/USD) vs Sell rate (88 INR/USD)

**💡 How to modify:**
- **Change buy/sell rates:** Look for `usdInrRateToInt(91)` and `usdInrRateToInt(88)`
- **Add transaction fees:** Add percentage calculation before final amounts
- **Change minimum amounts:** Add validation checks

### 💰 `/src/app/api/btc-price/route.ts` - Bitcoin Price Fetching

**🎯 What it does:** Gets current Bitcoin price from external API and calculates INR rates.

**💡 How to modify:**
- **Change price source:** Modify the fetch URL
- **Update rates:** Change the 91/88 USD-INR conversion rates
- **Add other cryptocurrencies:** Extend the logic for Ethereum, etc.

### 📊 `/src/lib/performanceCalculations.ts` - Portfolio Analytics

**🎯 What it does:** Calculates profit/loss, win rates, cost basis, and other trading metrics.

**💡 Key features:**
- **Realized P&L:** Profit from completed trades
- **Unrealized P&L:** Paper gains on current holdings
- **Cost Basis:** Average purchase price using FIFO method
- **Win Rate:** Percentage of profitable trades

**💡 How to modify:**
- **Change P&L calculation method:** Modify the `calculateRealizedPnL()` function
- **Add new metrics:** Create new calculation functions
- **Change cost basis method:** Switch from FIFO to LIFO or weighted average

### 🎨 `/src/app/globals.css` - Visual Styling

**🎯 What it does:** Controls how the app looks (colors, fonts, animations).

**💡 Key sections:**
- **Color scheme:** Dark theme with orange accents
- **Tab styling:** Active/inactive tab appearances
- **Animations:** Slide-up effects for modals

**💡 How to modify:**
- **Change theme colors:** Modify CSS color variables
- **Add new animations:** Create new `@keyframes` rules
- **Change fonts:** Update font imports and variables

### 🗄️ `/prisma/schema.prisma` - Database Structure

**🎯 What it does:** Defines how data is stored (users, transactions, prices).

**📋 Main tables:**
- **User:** User accounts, balances, roles
- **Transaction:** All buy/sell/deposit/withdrawal records
- **BtcPrice:** Historical Bitcoin price data

**💡 How to modify:**
- **Add new fields:** Add lines under existing models
- **Create new tables:** Add new `model` blocks
- **After changes:** Run `npx prisma db push` to update database

---

## 🛠️ How to Make Common Changes

### 🎨 Change Colors

**Location:** `/src/app/globals.css` and component files
```css
/* Change orange accent color */
.tab-active { color: #f97316; } /* Change this color */

/* Change background colors in components */
className="bg-gray-900"  /* Change to bg-blue-900, etc. */
```

### 💱 Change Buy/Sell Rates

**Location:** `/src/app/api/trade/route.ts`
```javascript
// Current rates
const usdInrRateInt = usdInrRateToInt(91) // Buy rate
const usdInrRateInt = usdInrRateToInt(88) // Sell rate

// Change to new rates
const usdInrRateInt = usdInrRateToInt(92) // New buy rate
const usdInrRateInt = usdInrRateToInt(87) // New sell rate
```

### 📱 Add New Tab to Navigation

**Location:** `/src/app/dashboard/page.tsx`

1. **Add tab type:**
```javascript
type TabType = 'dashboard' | 'history' | 'portfolio' | 'settings' // Add 'settings'
```

2. **Add navigation button:**
```javascript
<button
  onClick={() => setActiveTab('settings')}
  className={`flex-1 py-4 px-6 ... ${activeTab === 'settings' ? 'tab-active' : 'tab-inactive'}`}
>
  <Settings size={20} />
  <span className="text-xs">Settings</span>
</button>
```

3. **Add tab content:**
```javascript
{activeTab === 'settings' && (
  <div>Your settings content here</div>
)}
```

### 💳 Add Transaction Fee

**Location:** `/src/app/api/trade/route.ts`

```javascript
// In BUY section, after calculating btcSatoshi
const feePercentage = 0.01 // 1% fee
const feeAmount = Math.floor(inrTotalInt * feePercentage)
const finalInrAmount = inrTotalInt + feeAmount

// Update balance calculation
const newInrBalanceInt = currentInrSatoshi - finalInrAmount
```

### 📊 Add New Performance Metric

**Location:** `/src/lib/performanceCalculations.ts`

1. **Add to interface:**
```javascript
interface PerformanceMetrics {
  // ... existing metrics
  sharpeRatio: number // Add new metric
}
```

2. **Calculate in main function:**
```javascript
const sharpeRatio = this.calculateSharpeRatio()

return {
  // ... existing metrics
  sharpeRatio
}
```

3. **Add calculation method:**
```javascript
private calculateSharpeRatio(): number {
  // Your calculation logic
  return 0 // Return calculated value
}
```

### 🔐 Change Default PIN

**Location:** `/prisma/schema.prisma`
```prisma
model User {
  tradingPin String @default("1234")  // Change "1234" to your default
}
```

---

## 🚀 Development Workflow

### 🏃‍♂️ Running the App

**Development mode (for testing):**
```bash
npm run dev
```

**Production mode (for live use):**
```bash
npm run build
pm2 start npm --name "trading-app" -- start
```

### 🔧 Making Changes

1. **Edit files** using any text editor
2. **Test changes** with `npm run dev`
3. **Build for production** with `npm run build`
4. **Deploy** with `pm2 restart trading-app`

### 🗄️ Database Changes

After modifying `/prisma/schema.prisma`:
```bash
npx prisma db push          # Apply changes
npx prisma studio          # View database in browser
```

---

## 🎯 Common Customization Examples

### 🏪 Add New Cryptocurrency

1. **Update database schema** (add new balance fields)
2. **Modify price fetching** (add new API calls)
3. **Update trading interface** (add new buy/sell options)
4. **Extend calculations** (handle multiple currencies)

### 🎨 Change Theme to Light Mode

1. **Update colors** in `globals.css`
2. **Change background classes** from `bg-black` to `bg-white`
3. **Update text colors** from `text-white` to `text-black`
4. **Modify card backgrounds** from `bg-gray-900` to `bg-gray-100`

### 📱 Add Mobile Push Notifications

1. **Install notification library** (`npm install ...`)
2. **Add service worker** for push notifications
3. **Integrate with price updates** to notify on changes
4. **Add user preferences** for notification settings

### 💼 Add KYC Verification

1. **Extend User model** with verification fields
2. **Add document upload** functionality
3. **Create admin verification** interface
4. **Add trading limits** based on verification status

---

## 🆘 Troubleshooting

### ❌ Common Issues

**"Module not found" errors:**
```bash
npm install  # Reinstall dependencies
```

**Database connection issues:**
```bash
npx prisma generate  # Regenerate database client
npx prisma db push   # Sync database
```

**Build failures:**
```bash
npm run build  # Check for TypeScript errors
```

**PM2 not starting:**
```bash
pm2 logs trading-app  # Check error logs
pm2 restart trading-app  # Force restart
```

### 🔍 Where to Look for Errors

1. **Browser Console** - Frontend JavaScript errors
2. **Terminal/PM2 logs** - Backend server errors
3. **Network tab** - API request failures
4. **Database logs** - Data-related issues

---

## 📞 Support

This documentation covers the basics. For complex changes:

1. **Study existing code** patterns
2. **Test changes** in development mode first
3. **Make small changes** and test frequently
4. **Keep backups** of working versions

Remember: The best way to learn is by experimenting with small changes and seeing what happens! 🚀

---

*Last updated: June 28, 2025*

---

## 🆕 Version 2.0 Changelog - Transaction System Overhaul

### Major Changes Made

#### 1. Transaction Type System Redesign
**What was changed:** Complete overhaul of how transactions are categorized and displayed.

**Before:** Generic "DEPOSIT" and "WITHDRAWAL" types caused confusion and incorrect calculations.

**After:** Specific transaction types:
- `DEPOSIT_INR` - Cash deposits
- `DEPOSIT_BTC` - Bitcoin deposits  
- `WITHDRAWAL_INR` - Cash withdrawals
- `WITHDRAWAL_BTC` - Bitcoin withdrawals
- `BUY` - Bitcoin purchase transactions
- `SELL` - Bitcoin sale transactions
- `ADMIN` - Administrative balance adjustments

**Files affected:**
- `/src/app/dashboard/page.tsx` - Updated transaction interface and handling
- `/src/app/api/transactions/route.ts` - API response formatting
- Database - Transaction type standardization

#### 2. User-Friendly Display Names
**What was changed:** Technical transaction names replaced with user-friendly labels.

**Mapping:**
- `DEPOSIT_INR` → "CASH DEPOSIT"
- `DEPOSIT_BTC` → "BTC DEPOSIT"  
- `WITHDRAWAL_INR` → "CASH WITHDRAWAL"
- `WITHDRAWAL_BTC` → "BTC WITHDRAWAL"
- `BUY` → "BUY"
- `SELL` → "SELL"
- `ADMIN` → "ADMIN"

**Implementation:** Inline mapping in transaction display components.

#### 3. Enhanced Visual System
**What was changed:** Color-coded transactions with appropriate icons.

**Color scheme:**
- 🔵 Blue: All deposit transactions (INR and BTC)
- 🟡 Yellow: All withdrawal transactions (INR and BTC)
- 🟢 Green: BUY transactions
- 🔴 Red: SELL transactions
- ⚫ Gray: ADMIN transactions

**Icons:**
- Bitcoin icon for BTC transactions
- Arrow icons for INR transactions
- Settings icon for admin transactions

#### 4. Modal System Improvements
**What was changed:** Separate modal handling for different transaction types with correct balance display.

**Key fix:** BTC transaction modals now show Bitcoin balance after transaction instead of INR balance.

**Components updated:**
- `TradeTransactionModal.tsx` - For BUY/SELL transactions
- `DepositDetailModal.tsx` - For deposit/withdrawal transactions
- Modal prop handling in dashboard

#### 5. Database Balance Accuracy
**What was changed:** Proper INR equivalent calculation and storage for BTC transactions.

**Implementation:** BTC deposits/withdrawals now store INR equivalent using Bitcoin sell rate at transaction time.

**Result:** Accurate portfolio performance calculations without inflated returns from admin deposits.

### Technical Implementation Details

#### Transaction Interface Updates
```typescript
interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'DEPOSIT_INR' | 'DEPOSIT_BTC' | 'WITHDRAWAL_INR' | 'WITHDRAWAL_BTC' | 'ADMIN'
  category: 'TRADE' | 'BALANCE'
  amount: number
  price?: number
  total: number
  btcPrice?: number
  reason: string
  balance?: number
  btcBalance?: number  // Added for proper BTC balance tracking
  createdAt: string
}
```

#### Modal Props Standardization
- **Trade modals:** Receive `transaction` prop with trade details
- **Deposit/withdrawal modals:** Receive `transaction` prop with balance information
- **Consistent theming:** Dark UI with color-coded titles and icons

#### Component Architecture
```
Dashboard Page
├── Transaction Display (Recent Activity)
├── Transaction Display (History Tab)  
├── TradeTransactionModal (for BUY/SELL)
└── DepositDetailModal (for deposits/withdrawals)
```

### Deployment and Build Improvements

#### Build Process Fixes
- **Missing component imports:** Resolved TradeDetailModal vs TradeTransactionModal naming
- **Component prop matching:** Fixed trade/transaction prop naming inconsistencies
- **Cache management:** Improved Redis cache clearing for fresh data display

#### PM2 Process Management
```bash
# Updated deployment process
npm run build
pm2 restart all
redis-cli FLUSHALL  # Clear cache for fresh data
```

### Testing and Validation

#### What was tested:
1. **Transaction display accuracy:** All transaction types show correct names and colors
2. **Modal functionality:** Correct balance display for BTC vs INR transactions  
3. **Portfolio calculations:** Accurate performance metrics without admin deposit inflation
4. **Build stability:** Clean builds without import/export errors
5. **Cache behavior:** Fresh data display after cache clearing

#### Known issues resolved:
- ❌ BTC withdrawal modal showing INR balance → ✅ Shows correct BTC balance
- ❌ Admin deposits inflating portfolio returns → ✅ Excluded from performance calculations
- ❌ Generic transaction names confusing users → ✅ Clear, friendly labels
- ❌ Inconsistent transaction colors → ✅ Systematic color coding
- ❌ Build failures from missing components → ✅ Clean builds with proper imports

### Future Maintenance Notes

#### When adding new transaction types:
1. Update the Transaction interface type union
2. Add user-friendly name mapping
3. Define appropriate color scheme
4. Update modal handling logic
5. Test balance calculations

#### When modifying transaction display:
1. Update both Recent Activity and History tab display logic
2. Ensure modal props match component expectations
3. Test color and icon consistency
4. Verify cache invalidation

#### When making database changes:
1. Consider impact on existing transactions
2. Update API response formatting
3. Test balance accuracy calculations
4. Clear Redis cache after deployment

---

*This changelog documents the major improvements made in Version 2.0 of the BitTrade application, focusing on enhanced user experience and system reliability.*
