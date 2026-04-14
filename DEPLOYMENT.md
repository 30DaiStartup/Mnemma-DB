# Dashboard Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on the server
- The full project source code (this repo)

## Quick Start

1. Clone the repo onto the server
2. Copy `.env.example` to `.env` and fill in values:

```
DATABASE_URL=file:/app/db/dashboard.db
DATABASE_PATH=/app/db/dashboard.db
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-production-domain.com
```

3. Build and start:
```bash
docker compose up -d --build
```

The app will be available on port 3000.

## Entra ID (Azure AD) SSO Setup

To enable single sign-on:

1. Go to **Microsoft Entra ID** > **App registrations** > **New registration**
2. Name: `Dashboard` (or whatever you prefer)
3. Supported account types: **Single tenant** (your org only)
4. Redirect URI: **Web** — `https://your-domain.com/api/auth/callback/azure-ad`
5. After creation, go to **Certificates & secrets** > **New client secret**
6. Add these to your `.env`:

```
AZURE_AD_CLIENT_ID=<Application (client) ID from Overview page>
AZURE_AD_CLIENT_SECRET=<Secret value you just created>
AZURE_AD_TENANT_ID=<Directory (tenant) ID from Overview page>
```

7. Optional — restrict admin access to specific users:
```
ADMIN_EMAILS=admin1@yourorg.com,admin2@yourorg.com
```

8. Restart the container:
```bash
docker compose down && docker compose up -d
```

If Azure AD env vars are omitted, the app runs without authentication (useful for testing).

## Architecture

- **Runtime**: Node.js 22 (Alpine Linux)
- **Database**: SQLite (file-based, persisted in Docker volume `db-data`)
- **Migrations**: Run automatically on container start via Prisma

## Data Persistence

The SQLite database is stored in a Docker named volume (`db-data`). To back up:

```bash
# Find the volume location
docker volume inspect dashboard_db-data

# Or copy directly from the container
docker cp dashboard-dashboard-1:/app/db/dashboard.db ./backup.db
```

## Reverse Proxy

The container exposes port 3000. Put Nginx, Caddy, or an Azure Application Gateway in front for HTTPS. Example Nginx config:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

- **Container won't start**: Check logs with `docker compose logs dashboard`
- **Database errors**: The entrypoint runs `prisma migrate deploy` — check that migrations exist in `prisma/migrations/`
- **Auth not working**: Verify the redirect URI in Entra matches `NEXTAUTH_URL` + `/api/auth/callback/azure-ad`
