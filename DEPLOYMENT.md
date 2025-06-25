# Deployment Guide

## Nginx Configuration for EventSource/SSE

When deploying behind a reverse proxy (like Nginx), special configuration is required to support Server-Sent Events (EventSource) for real-time Bitcoin price updates.

### Required Nginx Configuration

```nginx
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Essential for Server-Sent Events (EventSource)
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 24h;
        proxy_send_timeout 24h;
    }

    # Special configuration for EventSource endpoints
    location /api/price-stream {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Critical for EventSource/SSE
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 24h;
        proxy_send_timeout 24h;
        
        # Add EventSource headers
        add_header Cache-Control no-cache;
        add_header Connection keep-alive;
        chunked_transfer_encoding off;
    }

    # SSL configuration here...
}
```

### Issue Resolution

Without proper EventSource/SSE configuration, the real-time Bitcoin price updates will fail to connect through HTTPS, causing the buy/sell buttons to be disabled due to `isConnected: false` in the `useBitcoinPrice` hook.

### Environment Variables

Make sure to set the correct `NEXTAUTH_URL` for your deployment:

- Development: `NEXTAUTH_URL=http://localhost:3000`
- Production: `NEXTAUTH_URL=https://your-domain.com`
