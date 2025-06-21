# Deployment Guide for bittrade.co.in

## Overview
This guide sets up a hybrid hosting architecture where:
- **Frontend**: Hosted on bittrade.co.in (public hosting service)
- **Backend + Database**: Running locally on your machine
- **Connection**: Secure tunnel between frontend and local backend

## Architecture
```
[Users] → [bittrade.co.in Frontend] → [LocalTunnel] → [Your Local Backend + Database]
```

## Prerequisites
- Domain: bittrade.co.in configured
- Hosting service for frontend (Vercel, Netlify, etc.)
- Your local machine running the backend

## Step 1: Start Local Backend
```bash
# Run this on your local machine
./scripts/start-local-backend.sh
```
This will:
- Start your Next.js backend on port 3001
- Create a secure tunnel at: https://bittrade-api.loca.lt
- Keep your database local and secure

## Step 2: Deploy Frontend
1. Upload the `.next` directory to your hosting service
2. Configure these environment variables on your hosting service:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://bittrade-api.loca.lt
   NEXTAUTH_URL=https://bittrade.co.in
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   NODE_ENV=production
   ```

## Step 3: Configure Domain
Point your domain `bittrade.co.in` to your hosting service.

## Step 4: Test the Setup
1. Visit https://bittrade.co.in
2. The frontend should load from your hosting service
3. All API calls should go through the tunnel to your local backend
4. Your database remains completely local

## Important Notes

### Security
- LocalTunnel URLs are public but use HTTPS
- Implement proper authentication on your API routes
- Consider using ngrok with authentication for production

### Reliability
- Your local machine must be running for the site to work
- Consider using a dedicated server or always-on computer
- Monitor the tunnel connection

### Alternatives to LocalTunnel
If LocalTunnel is unreliable, consider:
1. **ngrok** (requires account but more reliable)
2. **Cloudflare Tunnel** (free and very reliable)
3. **serveo.net** (SSH-based tunneling)

## Troubleshooting

### Tunnel Connection Issues
```bash
# Check if tunnel is running
curl https://bittrade-api.loca.lt/api/btc-price

# Restart tunnel if needed
./scripts/start-local-backend.sh
```

### Frontend Not Connecting
- Verify NEXT_PUBLIC_API_BASE_URL is set correctly
- Check browser console for CORS errors
- Ensure tunnel URL is accessible

### Database Issues
- Database runs locally, no internet connection needed
- Check Prisma connection in your local backend logs

## Monitoring
- Backend logs: Available in your terminal
- Frontend logs: Check your hosting service dashboard
- Tunnel status: Visit https://bittrade-api.loca.lt in browser

## Scaling Considerations
For production scale, consider:
1. Moving database to cloud (but keeping API local)
2. Using a VPS for backend instead of local machine
3. Implementing proper CI/CD pipeline
4. Adding monitoring and alerting
