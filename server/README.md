SaveTheServe Server
===================

Backend API for the SaveTheServe platform (NGO ↔ restaurant food rescue). This README covers local development, testing, frontend integration touchpoints, and production deployment (Docker/Nginx).

 Contents
 --------
 - Overview
 - Tech stack
 - Quick start (local)
 - Development workflow
 - Environment variables
 - Database (Prisma/Migrations/Seeds)
 - Running tests
 - API/Frontend integration notes
 - Docker workflow (dev/prod)
 - Production deployment checklist
 - Health checks and monitoring

Overview
--------
- HTTP API: Express (Node 20, ES modules), JWT auth, Joi validation.
- Data: PostgreSQL via Prisma ORM; Redis for caching/session support.
- Auth roles: NGO, Restaurant (aka "restaurant"), Admin.
- Files: uploads stored on host volume `./uploads` (mounted in Docker).

Tech Stack
----------
- Runtime: Node 20
- Framework: Express 5
- ORM: Prisma
- DB: PostgreSQL 15
- Cache: Redis 7
- Tests: Jest + Supertest
- Container: Docker + docker-compose (optional Nginx reverse proxy)

Quick Start (Local, no Docker)
------------------------------
1) Install Node 20 and npm.
2) Install dependencies:
	npm ci
3) Copy environment template and adjust secrets:
	cp .env.example .env   # If .env.example is absent, create .env using the table below.
4) Ensure PostgreSQL is running and DATABASE_URL points to it.
5) Run database migrations and seeds:
	npm run db:migrate
	npm run db:seed
6) Start the API:
	npm start   # or npm run dev for nodemon
7) API base URL: http://localhost:3000/api

Environment Variables
---------------------
Set these in `.env` (or supply via the Docker compose env). Example values are non-secure; change in production.

| Name            | Example / Default                                         | Purpose                                  |
| ----------------| --------------------------------------------------------- | ---------------------------------------- |
| NODE_ENV        | development                                               | Runtime environment                      |
| PORT            | 3000                                                      | API listen port                          |
| DATABASE_URL    | postgresql://postgres:password@localhost:5432/SaveTheServe| Prisma connection string                 |
| REDIS_URL       | redis://:redis123@localhost:6379                         | Redis connection string (optional local) |
| JWT_SECRET      | change-me                                                 | JWT signing key                          |
| JWT_EXPIRES_IN  | 7d                                                        | Token lifetime                           |
| ALLOWED_ORIGINS | http://localhost:3000,http://localhost:3001              | CORS origins for frontend                 |
| LOG_LEVEL       | info                                                      | winston log level                         |

Sample .env
-----------
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/SaveTheServe
REDIS_URL=redis://:redis123@localhost:6379
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

Development Workflow
--------------------
- Install deps and generate Prisma client: npm ci && npm run db:generate
- Apply migrations and seed: npm run db:migrate && npm run db:seed
- Start API: npm run dev (hot reload) or npm start
- Validate with tests: npm test -- --runInBand
- Iterate schema changes: update prisma/schema.prisma → npm run db:migrate → npm run db:generate
- View DB with Prisma Studio: npm run db:studio

Environments at a Glance
------------------------
| Stage         | How to run                                  | Base URL                                | Notes                                      |
| ------------- | ------------------------------------------- | --------------------------------------- | ------------------------------------------ |
| Local (bare)  | npm start                                   | http://localhost:3000/api               | Requires local Postgres/Redis              |
| Dev (Docker)  | docker-compose --profile development up -d  | http://localhost:3000/api               | Adds pgAdmin at http://localhost:5050      |
| Prod (Docker) | docker-compose --profile production up -d   | http://localhost/api (via Nginx)        | Add SSL certs to ./ssl for HTTPS           |

Database (Prisma)
-----------------
- Generate client:      npm run db:generate
- Apply migrations dev: npm run db:migrate
- Push schema (no mig): npm run db:push
- Seed data:            npm run db:seed  (uses prisma/seed.js)
- Studio (GUI):         npm run db:studio

Tests
-----
- Full suite:     npm test -- --runInBand
- Watch:          npm run test:watch
- Coverage:       npm run test:coverage

API / Frontend Integration Notes
--------------------------------
- Base URL: http://localhost:3000/api (via Nginx in prod: http://<host>/api)
- Auth:
  - Register: POST /api/auth/register (role: NGO or restaurant)
  - Login: POST /api/auth/login → returns { token }
  - Profile: GET /api/auth/profile (Authorization: Bearer <token>)
- Food listings (restaurant role):
  - Create: POST /api/food/create
  - Update: PUT /api/food/:id
  - Delete: DELETE /api/food/:id
  - My listings: GET /api/food/my-listings
- Discovery (NGO + restaurant):
  - Available: GET /api/food/available[?latitude&longitude&radius]
- Requests (NGO initiates; restaurant acts on incoming):
  - Create request: POST /api/requests/create
  - My requests (NGO): GET /api/requests/my-requests
  - Incoming (restaurant): GET /api/requests/incoming
  - Update status (restaurant): PUT /api/requests/:id/status (ACCEPTED|COMPLETED)
  - Cancel (NGO): DELETE /api/requests/:id
- Auth/CORS for frontend:
  - Send Authorization header with Bearer token for protected routes.
  - Ensure frontend origin is listed in ALLOWED_ORIGINS.
- File uploads: stored under ./uploads (mounted volume in Docker). Keep path stable for CDN/proxy exposure.

Response Format
---------------
- Success: { "message": string, "data": object|array }
- Validation error: 400 { "message": string }
- Unauthorized: 401 { "message": "Unauthorized" }
- Forbidden: 403 { "message": "Access forbidden" }
- Not found: 404 { "message": "... not found" }

API Routes (Request/Response Examples)
--------------------------------------
All protected routes require `Authorization: Bearer <token>`. Content-Type is `application/json` unless noted.

Auth
- POST /api/auth/register
	- Body: { "name": "Ngo One", "email": "ngo1@example.com", "password": "secret123", "role": "ngo", "address": "Somewhere" }
	- 201 Response: { "message": "User registered successfully", "data": { "token": "...", "user": { "id": 1, "email": "ngo1@example.com", "role": "ngo" } } }
- POST /api/auth/login
	- Body: { "email": "ngo1@example.com", "password": "secret123" }
	- 200 Response: { "message": "Login successful", "data": { "token": "...", "user": { "id": 1, "email": "ngo1@example.com", "role": "ngo" } } }
- GET /api/auth/profile
	- Headers: Authorization
	- 200 Response: { "message": "Profile fetched successfully", "data": { "id": 1, "email": "ngo1@example.com", "role": "ngo", ... } }

Food Listings
- POST /api/food/create (restaurant only)
	- Headers: Authorization
	- Body: { "title": "Sandwiches", "description": "20 packed sandwiches", "quantity": 20, "category": "Food", "expiresAt": "2025-12-31T18:00:00Z", "location": { "latitude": 19.076, "longitude": 72.8777 } }
	- 201 Response: { "message": "Food listing created successfully", "data": { "id": 10, "title": "Sandwiches", "status": "AVAILABLE", ... } }
- GET /api/food/available
	- Query (optional): latitude, longitude, radius (km) e.g. `?latitude=19.076&longitude=72.8777&radius=10`
	- 200 Response: { "message": "Available food listings retrieved successfully", "data": [ { "id": 10, "title": "Sandwiches", "status": "AVAILABLE" } ] }
- GET /api/food/my-listings (restaurant only)
	- Headers: Authorization
	- 200 Response: { "message": "Food listings retrieved successfully", "data": [ { "id": 10, "title": "Sandwiches" } ] }
- PUT /api/food/:id (restaurant owner only)
	- Headers: Authorization
	- Body: { "title": "Sandwiches - updated", "quantity": 18, "expiresAt": "2025-12-31T19:00:00Z" }
	- 200 Response: { "message": "Food listing updated successfully", "data": { "id": 10, "title": "Sandwiches - updated" } }
- DELETE /api/food/:id (restaurant owner only)
	- Headers: Authorization
	- 200 Response: { "message": "Food listing deleted successfully", "data": { "id": 10 } }

Requests (NGO initiates, restaurant responds)
- POST /api/requests/create (NGO only)
	- Headers: Authorization
	- Body: { "foodListingId": 10, "pickupTime": "2025-12-31T17:00:00Z", "notes": "Need insulated transport" }
	- 201 Response: { "message": "Request created successfully", "data": { "id": 25, "status": "PENDING", "foodListingId": 10 } }
- GET /api/requests/my-requests (NGO only)
	- Headers: Authorization
	- 200 Response: { "message": "Requests retrieved successfully", "data": [ { "id": 25, "status": "PENDING", "foodListing": { ... } } ] }
- GET /api/requests/incoming (restaurant only)
	- Headers: Authorization
	- 200 Response: { "message": "Incoming requests retrieved successfully", "data": [ { "id": 25, "status": "PENDING", "ngo": { ... } } ] }
- PUT /api/requests/:id/status (restaurant only)
	- Headers: Authorization
	- Body: { "status": "ACCEPTED" } or { "status": "COMPLETED" }
	- 200 Response: { "message": "Request status updated successfully", "data": { "id": 25, "status": "ACCEPTED" } }
- DELETE /api/requests/:id (NGO only, while pending)
	- Headers: Authorization
	- 200 Response: { "message": "Request cancelled successfully", "data": { "id": 25 } }

Example cURL Calls
------------------
- Login and store token
	- curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"ngo1@example.com\",\"password\":\"secret123\"}"
- Create food (restaurant)
	- curl -X POST http://localhost:3000/api/food/create -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"title\":\"Sandwiches\",\"description\":\"20 packed sandwiches\",\"quantity\":20,\"category\":\"Food\",\"expiresAt\":\"2025-12-31T18:00:00Z\",\"location\":{\"latitude\":19.076,\"longitude\":72.8777}}"
- List available food with geo filter
	- curl "http://localhost:3000/api/food/available?latitude=19.076&longitude=72.8777&radius=10" -H "Authorization: Bearer <token>"
- Create request (NGO)
	- curl -X POST http://localhost:3000/api/requests/create -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"foodListingId\":10,\"pickupTime\":\"2025-12-31T17:00:00Z\",\"notes\":\"Need insulated transport\"}"
- Update request status (restaurant)
	- curl -X PUT http://localhost:3000/api/requests/25/status -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\"status\":\"ACCEPTED\"}"

Docker Workflow
---------------
Profiles: `development` (adds pgAdmin), `production` (adds Nginx). Core services always run: postgres, redis, api.

Development profile (with pgAdmin):
- docker-compose --profile development up -d
- pgAdmin: http://localhost:5050 (admin@savetheserve.com / admin123)

Production profile (with Nginx reverse proxy):
- docker-compose --profile production up -d
- Nginx exposes API at http://localhost/api (or behind your domain)

Common Docker commands:
- View containers:            docker-compose ps
- Logs (API):                 docker-compose logs -f api
- Rebuild API:                docker-compose build api
- Database shell:             docker-compose exec postgres psql -U postgres -d SaveTheServe
- Run Prisma migrate in API:  docker-compose exec api npm run db:migrate
- Tear down & volumes:        docker-compose down -v

Production Deployment Checklist
--------------------------------
1) Provision infrastructure
	- Host with Docker + docker-compose
	- Persistent storage for Postgres volume and uploads
2) Secrets & config
	- Set strong JWT_SECRET, Postgres password, Redis password
	- Configure ALLOWED_ORIGINS to your frontend domains
	- Provide DATABASE_URL and REDIS_URL targeting internal service names (postgres, redis)
3) Build & start
	- docker-compose --profile production up -d
	- Verify health: docker-compose ps and docker-compose logs -f api
4) Nginx/HTTPS
	- Place cert/key in ./ssl, ensure nginx.conf HTTPS block enabled
	- Expose 80/443; set upstream to api:3000
5) Database lifecycle
	- Run migrations: docker-compose exec api npm run db:migrate
	- Seed if needed: docker-compose exec api npm run db:seed
6) Monitoring & backups
	- Enable Postgres backups (e.g., pg_dump via cron or managed backups)
	- Watch health checks; adjust restart policies if needed

Health Checks
-------------
- API: GET /health (used by Docker healthcheck)
- Postgres: pg_isready
- Redis: redis-cli ping check
- Nginx: depends_on API health in compose

Repository Layout
-----------------
- index.js / src/          Express app entry and modules
- prisma/schema.prisma     Data model
- prisma/seed.js           Seed data
- init.sql                 Bootstrap SQL for Postgres container
- docker-compose.yml       Orchestration (postgres, redis, api, nginx, pgadmin)
- Dockerfile               Production API image
- nginx.conf               Reverse proxy (prod profile)
- uploads/                 File uploads volume mount

Troubleshooting
---------------
- Database URL errors: confirm service name `postgres` when running in Docker.
- CORS issues: ensure frontend origin is in ALLOWED_ORIGINS.
- Prisma client mismatch: rerun npm run db:generate after schema changes.
- Healthcheck failing in Docker: check API logs and confirm migrations ran.
