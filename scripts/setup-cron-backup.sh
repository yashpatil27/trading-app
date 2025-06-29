#!/bin/bash

# Setup automatic daily backups using cron

TRADING_APP_DIR="/home/ubuntu/trading-app"
CRON_JOB="0 2 * * * cd $TRADING_APP_DIR && npm run auto-backup >> /var/log/trading-app-backup.log 2>&1"

echo "Setting up automatic daily backups..."
echo "Backup will run every day at 2:00 AM"

# Add cron job if it doesn't exist
(crontab -l 2>/dev/null | grep -v "trading-app-backup"; echo "$CRON_JOB") | crontab -

echo "✅ Cron job added successfully!"
echo "To check cron jobs: crontab -l"
echo "To view backup logs: tail -f /var/log/trading-app-backup.log"

# Create initial backup
echo "Creating initial backup..."
cd "$TRADING_APP_DIR" && npm run auto-backup
