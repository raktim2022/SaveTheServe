# SaveTheServe Docker Setup

This directory contains Docker configuration for the SaveTheServe application.

## Quick Start

### Development Mode
```bash
# Start with development profile (includes pgAdmin)
docker-compose --profile development up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production Mode
```bash
# Start with production profile (includes Nginx)
docker-compose --profile production up -d

# View logs
docker-compose logs -f api nginx

# Stop services
docker-compose down
```

## Services

### Core Services (Always Running)
- **PostgreSQL Database** (`postgres:5432`)
- **Redis Cache** (`redis:6379`)
- **SaveTheServe API** (`api:3000`)

### Development Profile
- **pgAdmin** (`localhost:5050`)
  - Email: admin@savetheserve.com
  - Password: admin123

### Production Profile
- **Nginx Reverse Proxy** (`localhost:80`)

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

## Database Access

### Via pgAdmin (Development)
1. Open http://localhost:5050
2. Login with admin credentials
3. Add server:
   - Host: postgres
   - Port: 5432
   - Database: SaveTheServe
   - Username: postgres
   - Password: Raktim05@

### Direct Connection
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d SaveTheServe

# View database logs
docker-compose logs postgres
```

## API Access

### Direct (Development)
- API: http://localhost:3000/api
- Health: http://localhost:3000/health

### Via Nginx (Production)
- API: http://localhost/api
- Health: http://localhost/health

## Useful Commands

```bash
# View all containers
docker-compose ps

# Rebuild API container
docker-compose build api

# View real-time logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec api npm run db:migrate
docker-compose exec postgres pg_dump -U postgres SaveTheServe

# Clean up
docker-compose down -v  # Remove volumes
docker system prune     # Clean up unused containers/images
```

## Volumes

- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis persistence files
- `./uploads`: API file uploads (mounted to host)

## Networking

All services communicate via the `savetheserve-network` bridge network.

## Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready` check
- **Redis**: Connection test
- **API**: HTTP health endpoint check
- **Nginx**: Depends on API health

## SSL/HTTPS (Production)

To enable HTTPS:
1. Place SSL certificates in `./ssl/` directory
2. Uncomment HTTPS server block in `nginx.conf`
3. Update ports as needed