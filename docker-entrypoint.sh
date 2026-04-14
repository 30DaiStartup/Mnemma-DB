#!/bin/sh
set -e

# Run Prisma migrations on startup (creates DB if it doesn't exist)
npx prisma migrate deploy 2>/dev/null || echo "Prisma migrate skipped (first run or no changes)"

# Start the Next.js server
exec node server.js
