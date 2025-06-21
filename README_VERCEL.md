# BitTrade Frontend - Vercel Deployment

This branch contains the frontend-only version of the BitTrade application, optimized for deployment on Vercel.

## Architecture
- **Frontend**: Deployed on Vercel (connected to bittrade.co.in)
- **Backend**: Runs locally with secure tunnel
- **Database**: Stays completely local

## Deployment Steps

### 1. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project" 
3. Import this repository
4. Select the `vercel-frontend` branch
5. Configure environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://bittrade-api.loca.lt`
   - `NEXTAUTH_URL`: `https://bittrade.co.in`
   - `NODE_ENV`: `production`

### 2. Configure Custom Domain
1. In Vercel project settings, go to "Domains"
2. Add your domain: `bittrade.co.in`
3. Follow Vercel's DNS configuration instructions

### 3. Start Local Backend
On your local machine, switch to main branch and run:
```bash
git checkout main
./scripts/start-local-backend.sh
```

## How It Works
1. Users visit `https://bittrade.co.in` (served by Vercel)
2. Frontend makes API calls to `/api/*` routes
3. Next.js rewrites proxy these to your local backend tunnel
4. Your local backend processes requests and accesses local database
5. Responses flow back through the tunnel to the frontend

## Environment Variables
The following environment variables are configured in Vercel:

- `NEXT_PUBLIC_API_BASE_URL`: Points to your local backend tunnel
- `NEXTAUTH_URL`: Your production domain
- `NODE_ENV`: Set to production

## Security Notes
- All sensitive data stays on your local machine
- LocalTunnel provides HTTPS encryption
- Consider upgrading to ngrok Pro for production use
- Implement proper API authentication

## Monitoring
- Frontend logs: Available in Vercel dashboard
- Backend logs: Check your local terminal
- Tunnel status: Visit the tunnel URL directly

## Troubleshooting
- If API calls fail, check if local backend is running
- Verify tunnel URL is accessible
- Check Vercel environment variables are set correctly
