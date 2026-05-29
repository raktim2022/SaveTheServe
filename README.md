# SaveTheServe 🍽️

> **Connecting Food Surplus with Those in Need** — A platform to reduce food waste while supporting community nutrition through intelligent donation management and real-time coordination.

[![GitHub Stars](https://img.shields.io/github/stars/[YOUR_ORG]/savetheserve?style=flat-square&logo=github)](https://github.com/[YOUR_ORG]/savetheserve)
[![GitHub Forks](https://img.shields.io/github/forks/[YOUR_ORG]/savetheserve?style=flat-square&logo=github)](https://github.com/[YOUR_ORG]/savetheserve)
[![License](https://img.shields.io/badge/license-[YOUR_LICENSE]-green?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-16.1+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication & Security](#-authentication--security)
- [Deployment](#-deployment)
- [Performance Optimizations](#-performance-optimizations)
- [Testing](#-testing)
- [Error Handling](#-error-handling)
- [Accessibility](#-accessibility)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Project Overview

### What is SaveTheServe?

SaveTheServe is a **food donation and waste reduction platform** that bridges the gap between restaurants/donors with surplus food and NGOs/communities in need. Through intelligent real-time coordination, QR-code verification, and impact tracking, SaveTheServe enables sustainable food distribution while supporting food security in underserved communities.

### Problem We Solve

- **🍽️ Food Waste**: ~1/3 of food produced globally is wasted while millions face hunger
- **⏱️ Coordination Chaos**: Manual processes for food donations are time-consuming and inefficient
- **❌ Verification Issues**: No reliable way to verify food safety and pickup completion
- **📊 Impact Invisibility**: Donors don't see the real-world impact of their contributions
- **🔌 Communication Gaps**: Lack of real-time updates between donors and recipients

### Our Solution

✅ **Digital Coordination** - Instant food availability notifications  
✅ **QR-Verified Pickups** - Secure, traceable food transfers  
✅ **Real-Time Tracking** - Live updates via Socket.io  
✅ **Impact Dashboard** - Analytics showing lives helped & waste reduced  
✅ **Payment Integration** - Donations & support funding  
✅ **Community Reviews** - Build trust through transparent feedback  

### Target Users

| User Type | Role | Primary Benefit |
|-----------|------|-----------------|
| **Restaurants** | Donors | Reduce waste, gain PR, tax benefits |
| **NGOs** | Recipients | Access to nutritious food for beneficiaries |
| **Volunteers** | Coordinators | Organize & verify pickups, help community |
| **Admins** | Moderators | Monitor platform, ensure compliance |

### Real-World Use Cases

1. **Daily Food Rescue** - Restaurant closes at 10 PM, lists 50 meals available → 3 nearby NGOs receive instant notification → Volunteer picks up within 30 mins
2. **Event Catering Surplus** - Corporate event has 200 meals leftover → NGO schedules pickup → QR verification ensures chain of custody → Impact recorded
3. **Weekly Donation Cycle** - Restaurant commits to weekly donations → Automation sends reminders → Consistent food supply for NGO beneficiaries
4. **Volunteer Community** - Student volunteers coordinate pickups on weekends → Gamified impact tracking motivates participation

---

## ✨ Features

### 🔐 Core Functionality

**Authentication & Authorization**
- ✅ Email/password registration with OTP verification
- ✅ Role-based access control (ADMIN, RESTAURANT, NGO, VOLUNTEER)
- ✅ JWT token management with refresh token rotation
- ✅ Password reset via secure token
- ✅ Phone OTP for additional verification

**Food Donation Management**
- ✅ Create & manage food listings (name, quantity, expiry time, category)
- ✅ Real-time availability status (AVAILABLE → REQUESTED → PICKED)
- ✅ Image uploads via Cloudinary
- ✅ Geolocation-based discovery (nearby listings within configurable radius)
- ✅ Category filtering and advanced search

**Request & Pickup Coordination**
- ✅ NGOs request available food listings
- ✅ Restaurants approve/reject requests with reasons
- ✅ Auto-generated QR codes for pickup verification
- ✅ One-time pickup codes for secure transfers
- ✅ Volunteer assignment for pickup execution

**Real-Time Notifications**
- ✅ Socket.io-powered instant alerts
- ✅ In-app notifications dashboard
- ✅ Email notifications for critical events
- ✅ Notification history & read status tracking
- ✅ Role-based broadcast notifications

**Payment & Donations**
- ✅ Razorpay payment gateway integration
- ✅ Support NGOs with direct donations
- ✅ Payment history tracking
- ✅ Donation receipts & tax documentation
- ✅ Secure payment verification

**Reviews & Ratings**
- ✅ Rate restaurants (food quality, punctuality)
- ✅ Rate NGOs (professionalism, communication)
- ✅ Public review system with moderation
- ✅ Average rating calculations
- ✅ Leaderboards (top restaurants, top NGOs)

**Analytics & Impact**
- ✅ Daily food saved statistics (kg, items, value)
- ✅ People fed metrics (using standard conversion: 1kg = 4 people)
- ✅ Donation frequency & trends
- ✅ Volunteer performance tracking
- ✅ Admin dashboard with platform metrics
- ✅ Export impact reports (CSV, PDF)

### 🛠️ Technical Features

**Backend**
- ✅ Background job scheduling (node-cron)
  - Every 10 mins: Check expired listings & reject pending requests
  - Every 5 mins: Process notification queue
  - Daily 8 AM: Generate impact reports
  - Daily midnight: Cleanup tokens & archive old data
- ✅ Email service with branded HTML templates
- ✅ Geolocation search with Haversine formula
- ✅ Database migrations with Prisma
- ✅ Comprehensive error handling & logging (winston)
- ✅ Rate limiting & security headers (helmet)

**Frontend**
- ✅ Server-side rendering (Next.js App Router)
- ✅ Real-time updates via Socket.io client
- ✅ Responsive design (mobile-first)
- ✅ Animations & transitions (Framer Motion)
- ✅ State management (Zustand)
- ✅ Data fetching & caching (@tanstack/react-query)
- ✅ Form validation & error boundaries

**Deployment & DevOps**
- ✅ Docker containerization (backend & frontend)
- ✅ Docker Compose orchestration
- ✅ Nginx reverse proxy & SSL/TLS
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Automated testing & code quality checks
- ✅ Environment-specific configurations

### 📈 Scalability & Performance

- ✅ Database indexing on frequently queried columns
- ✅ Query optimization with Prisma relations
- ✅ Image optimization via Cloudinary CDN
- ✅ Lazy loading for lists & images
- ✅ Code splitting in Next.js
- ✅ Caching strategies (client-side & server-side)
- ✅ Load testing ready infrastructure

### 🔒 Security

- ✅ HTTPS/TLS encryption
- ✅ CORS policy enforcement
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping)
- ✅ CSRF token handling
- ✅ Password hashing (bcryptjs)
- ✅ JWT secret management
- ✅ Rate limiting on auth endpoints
- ✅ Input validation & sanitization
- ✅ Secure payment processing (Razorpay)

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.0 | React framework with SSR & App Router |
| **React** | 19.2.3 | UI component library |
| **TypeScript** | Latest | Type safety (optional, setup ready) |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Zustand** | 5.0.9 | Global state management |
| **@tanstack/react-query** | 5.90.12 | Data fetching & caching |
| **socket.io-client** | 4.8.3 | Real-time communication |
| **Framer Motion** | 12.23.26 | Animations & transitions |
| **Axios** | Latest | HTTP client |
| **React Hook Form** | Latest | Form state management |

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.2.1 | Web framework |
| **TypeScript** | Latest | Type safety (optional) |
| **Prisma** | 6.19.1 | ORM & database toolkit |
| **socket.io** | 4.8.1 | Real-time bidirectional communication |
| **node-cron** | 3.x | Job scheduling |
| **jsonwebtoken** | 9.0.3 | JWT authentication |
| **bcryptjs** | 3.0.3 | Password hashing |
| **nodemailer** | 7.0.12 | Email sending |
| **winston** | 3.19.0 | Logging |
| **helmet** | 8.0.0 | Security headers |
| **express-rate-limit** | 7.4.1 | Rate limiting |
| **cloudinary** | 1.41.3 | Image uploads & CDN |
| **razorpay** | Latest | Payment gateway |

### **Database**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | 15+ | Primary database |
| **Prisma** | 6.19.1 | Database client & migrations |

### **DevOps & Deployment**
| Technology | Purpose |
|-----------|---------|
| **Docker** | Container runtime |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy & load balancer |
| **GitHub Actions** | CI/CD pipeline |
| **Let's Encrypt** | SSL/TLS certificates |

### **Development Tools**
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Unit testing |
| **Supertest** | API testing |
| **Nodemon** | Development server auto-reload |

---

## 🏗️ Architecture

### Folder Structure

```
SaveTheServe/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── (auth)/             # Auth pages (login, register)
│   │   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── layout.js           # Root layout
│   │   │   ├── page.js             # Home page
│   │   │   ├── error.jsx           # Error boundary
│   │   │   ├── not-found.jsx       # 404 page
│   │   │   └── loading.jsx         # Loading state
│   │   ├── components/
│   │   │   ├── admin/              # Admin-specific components
│   │   │   ├── common/             # Shared components (Nav, Footer, etc.)
│   │   │   ├── donor/              # Restaurant/Donor components
│   │   │   ├── ngo/                # NGO-specific components
│   │   │   ├── layout/             # Layout components
│   │   │   └── settings/           # Settings components
│   │   ├── context/                # React Context (Auth, Theme, User)
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.js          # Auth hook
│   │   │   ├── useFetch.js         # Data fetching
│   │   │   ├── useRealTimeFood.js  # Real-time food updates
│   │   │   └── useNotifications.js # Notification handling
│   │   ├── lib/
│   │   │   ├── axios.js            # HTTP client setup
│   │   │   ├── auth.js             # Auth utilities
│   │   │   ├── location.js         # Geolocation utilities
│   │   │   └── map.js              # Map integration
│   │   ├── services/               # API service layer
│   │   │   ├── auth.service.js
│   │   │   ├── food.service.js
│   │   │   ├── request.service.js
│   │   │   ├── notification.service.js
│   │   │   └── user.service.js
│   │   ├── styles/                 # Global & component styles
│   │   ├── types/                  # TypeScript types
│   │   └── utils/                  # Utility functions
│   ├── public/                     # Static assets
│   └── package.json
│
├── server/                         # Express.js Backend
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── index.js               # Server entry point
│   │   ├── config/                # Configuration files
│   │   │   ├── env.config.js      # Environment variables
│   │   │   ├── db.config.js       # Database connection
│   │   │   ├── jwt.config.js      # JWT settings
│   │   │   ├── cloudinary.config.js
│   │   │   ├── notification.config.js
│   │   │   └── payment.config.js
│   │   ├── controllers/           # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── food.controller.js
│   │   │   ├── request.controller.js
│   │   │   ├── pickup.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── payment.controller.js
│   │   ├── services/              # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── food.service.js
│   │   │   ├── request.service.js
│   │   │   ├── pickup.service.js
│   │   │   ├── notification.service.js
│   │   │   ├── email.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── analytics.service.js
│   │   │   └── review.service.js
│   │   ├── models/                # Database models & queries
│   │   │   ├── index.js
│   │   │   ├── User.model.js
│   │   │   ├── FoodListing.model.js
│   │   │   ├── FoodRequest.model.js
│   │   │   └── ...
│   │   ├── jobs/                  # Background jobs (cron)
│   │   │   ├── expireFood.job.js
│   │   │   ├── notification.job.js
│   │   │   ├── dailyReports.job.js
│   │   │   └── cleanup.job.js
│   │   ├── routes/                # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── food.routes.js
│   │   │   ├── request.routes.js
│   │   │   ├── pickup.routes.js
│   │   │   ├── notification.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middlewares/           # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── logging.middleware.js
│   │   ├── validations/           # Joi schemas
│   │   │   ├── auth.validation.js
│   │   │   ├── food.validation.js
│   │   │   └── request.validation.js
│   │   ├── helpers/               # Utility functions
│   │   │   ├── response.helper.js
│   │   │   ├── qr.helper.js
│   │   │   ├── geo.helper.js
│   │   │   └── email.helper.js
│   │   ├── sockets/               # Socket.io handlers
│   │   │   ├── index.js
│   │   │   ├── auth.socket.js
│   │   │   └── notification.socket.js
│   │   └── utils/
│   │       ├── logger.js          # Winston logger
│   │       └── constants.js
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.js                # Database seeding
│   │   └── migrations/            # Migration history
│   ├── tests/                     # Test suites
│   │   ├── auth.test.js
│   │   ├── food.test.js
│   │   ├── request.test.js
│   │   ├── integration.test.js
│   │   └── setup.js
│   └── package.json
│
├── prisma/
│   └── schema.prisma              # Shared Prisma schema reference
│
├── docker-compose.yml             # Local development
├── docker-compose.prod.yml        # Production deployment
├── Dockerfile (root)              # Multi-stage builds
├── nginx.conf                     # Reverse proxy config
├── DEPLOYMENT.md                  # Deployment guide
├── CONTRIBUTING.md                # Contribution guidelines
├── LICENSE                        # [YOUR_LICENSE]
├── README.md                      # This file
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Actions CI/CD
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js + React)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Components (Food List, Donation Dashboard, Reviews) │  │
│  │ Context (Auth, Theme, User)                          │  │
│  │ Hooks (useAuth, useFetch, useNotifications)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTPS/WebSocket)
┌─────────────────────────────────────────────────────────────┐
│                  NGINX (Reverse Proxy)                      │
│  ├── Routes /api → Backend (Port 3000)                     │
│  ├── Routes /socket.io → Backend (Port 3000)              │
│  └── Routes / → Frontend (Port 3002)                      │
└─────────────────────────────────────────────────────────────┘
                ↙                          ↘
    ┌──────────────────────┐    ┌──────────────────────┐
    │  BACKEND (Express)   │    │  FRONTEND (Next.js)  │
    ├──────────────────────┤    ├──────────────────────┤
    │ Routes & Controllers │    │ Pages & Components   │
    │ Services & Logic     │    │ State Management     │
    │ Socket.io Server     │    │ Real-time Listeners  │
    │ Job Scheduler        │    └──────────────────────┘
    └──────────────────────┘
            ↓
    ┌──────────────────────┐
    │  POSTGRESQL DB       │
    │  (Prisma ORM)        │
    │  ├── Users           │
    │  ├── FoodListings    │
    │  ├── FoodRequests    │
    │  ├── Notifications   │
    │  ├── Reviews         │
    │  └── Payments        │
    └──────────────────────┘
            ↓
    ┌──────────────────────┐
    │  External Services   │
    ├──────────────────────┤
    │ Email (Nodemailer)   │
    │ Images (Cloudinary)  │
    │ Payments (Razorpay)  │
    │ Maps (Geolocation)   │
    └──────────────────────┘
```

### Modular Architecture

SaveTheServe follows a **layered architecture pattern**:

- **Presentation Layer** (Frontend) - User interface & interactions
- **API Layer** (Express Routes) - HTTP endpoints & Socket.io
- **Business Logic Layer** (Services) - Core functionality & rules
- **Data Access Layer** (Prisma/Models) - Database operations
- **External Integration Layer** - Email, payments, CDN

This separation ensures:
- ✅ Easy testing (mock services)
- ✅ Code reusability (services shared across routes)
- ✅ Scalability (add/modify features without touching other layers)
- ✅ Maintainability (clear responsibility boundaries)

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
Node.js >= 18.0.0
npm >= 9.0.0 or yarn >= 3.0.0
PostgreSQL >= 15.0
Docker & Docker Compose (for containerized setup)
Git
```

### Step 1: Clone Repository

```bash
git clone https://github.com/[YOUR_ORG]/savetheserve.git
cd SaveTheServe
```

### Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### Step 3: Setup Database

```bash
cd server

# Create migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed

# View database in GUI (optional)
npx prisma studio
```

### Step 4: Configure Environment Variables

```bash
# Backend
cd server
cp .env.example .env
# Edit .env with your values (see Configuration section)

# Frontend
cd ../client
cp .env.example .env.local
# Edit .env.local with API URLs
```

### Step 5: Start Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev
# Server runs on http://localhost:3000

# Terminal 2: Frontend  
cd client
npm run dev
# Frontend runs on http://localhost:3002
```

### Step 6: Verify Installation

```bash
# Test backend API
curl http://localhost:3000/health

# Open frontend in browser
# Navigate to http://localhost:3002
```

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/savetheserve"

# JWT
JWT_SECRET="your-secret-key-here-use-strong-random-string"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"  # development, production, test

# CORS
ALLOWED_ORIGINS="http://localhost:3002,http://localhost:3001"
CLIENT_URL="http://localhost:3002"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use Gmail app password, not main password

# Cloudinary (Image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay (Payments)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxx"

# Geolocation
DEFAULT_RADIUS_KM=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=300           # 300 requests per window

# Logging
LOG_LEVEL="info"  # error, warn, info, debug, verbose

# Optional: Twilio (SMS verification)
# TWILIO_ACCOUNT_SID="your-sid"
# TWILIO_AUTH_TOKEN="your-token"
# TWILIO_PHONE_NUMBER="+1234567890"
```

**Configuration Guide:**

- **JWT_SECRET**: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **SMTP_PASS**: For Gmail, enable 2FA and generate an [App Password](https://support.google.com/accounts/answer/185833)
- **CLOUDINARY**: Create account at [cloudinary.com](https://cloudinary.com)
- **RAZORPAY**: Create account at [razorpay.com](https://razorpay.com)

### Frontend Environment Variables (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# App Info
NEXT_PUBLIC_APP_NAME="SaveTheServe"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Optional: Analytics
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Database Configuration

SaveTheServe uses PostgreSQL with Prisma ORM. The schema is defined in `server/prisma/schema.prisma`.

**Key Models:**
- `User` - Base user entity with role-based access
- `Admin` - Admin profile (oneToOne with User)
- `Restaurant` - Food donor/restaurant profile
- `NGO` - Food recipient organization
- `Volunteer` - Pickup coordinator
- `FoodListing` - Available food items
- `FoodRequest` - Request for food items
- `PickupLog` - Completed pickups
- `Payment` - Donation records
- `Notification` - User notifications
- `Review` - Ratings & reviews

---

## 🎮 Usage

### For Restaurants (Food Donors)

1. **Register Account**
   - Sign up with restaurant email
   - Verify email via OTP
   - Complete restaurant profile (name, address, location)

2. **Create Food Listing**
   - Click "Post Food"
   - Fill details: name, quantity, category, expiry time
   - Upload food image
   - Set pickup instructions
   - Submit

3. **Manage Requests**
   - View incoming requests from NGOs
   - Approve/reject with reasons
   - Track pickup status in real-time

4. **View Impact**
   - Dashboard shows: kg saved, people helped, CO2 prevented
   - Monthly reports for tax documentation
   - Share impact on social media

### For NGOs (Food Recipients)

1. **Register Organization**
   - Sign up with organization email
   - Verify email via OTP
   - Complete NGO profile (name, address, coverage area)

2. **Browse Available Food**
   - Map view of nearby available food
   - Filter by category, distance, quantity
   - Sort by newest or expiring soon

3. **Request Food**
   - Click on food listing
   - Set preferred pickup time
   - Submit request

4. **Complete Pickup**
   - Receive approval notification
   - Scan QR code with volunteer
   - Verify with one-time pickup code
   - Mark as completed

5. **Manage Beneficiaries**
   - Record food received & distributed
   - Track people served
   - Generate impact reports

### For Volunteers

1. **Register as Volunteer**
   - Sign up via NGO invitation
   - Verify phone number via OTP
   - Complete profile

2. **View Assigned Pickups**
   - See scheduled pickups
   - Get navigation to restaurant
   - Contact restaurant/NGO if needed

3. **Execute Pickup**
   - Arrive at restaurant
   - Scan QR code with assigned request
   - Verify with pickup code
   - Collect food securely
   - Mark pickup as completed

4. **Track Performance**
   - View pickup history
   - See volunteer leaderboard
   - Earn badges for milestones

### For Admins

1. **Monitor Platform**
   - Dashboard with key metrics
   - User activity logs
   - Flag suspicious accounts

2. **Manage Users**
   - Approve/reject registrations
   - Suspend accounts for violations
   - Verify restaurant/NGO credentials

3. **Resolve Issues**
   - Review flagged reviews
   - Handle user complaints
   - Ban users if necessary

4. **Analytics & Reports**
   - Export platform metrics
   - Generate impact reports
   - Monitor system health

---

## 📡 API Documentation

### Base URL

```
Development: http://localhost:3000
Production: https://api.[YOUR_DOMAIN].com
```

### Authentication

All endpoints (except auth routes) require JWT token in header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

<details>
<summary><b>🔐 Authentication Endpoints</b></summary>

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Restaurant",
  "email": "john@restaurant.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "RESTAURANT",
  "organizationName": "John's Pizza Place",
  "address": "123 Main St, City",
  "latitude": 19.0760,
  "longitude": 72.8777
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@restaurant.com",
      "name": "John Restaurant",
      "role": "RESTAURANT",
      "isVerified": false
    },
    "verificationToken": "eyJhbG...",
    "message": "Registration successful. Check email for verification."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@restaurant.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@restaurant.com",
      "name": "John Restaurant",
      "role": "RESTAURANT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "message": "Login successful"
  }
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "userId": 1,
  "email": "john@restaurant.com",
  "code": "123456"
}

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Authorization: Bearer <refresh_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

</details>

<details>
<summary><b>🍽️ Food Listing Endpoints</b></summary>

#### Create Food Listing
```http
POST /api/food/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "foodName": "Leftover Pizza",
  "description": "Pepperoni pizza, 8 slices",
  "category": "Italian",
  "quantity": 8,
  "unit": "slices",
  "expiryTime": "2026-05-30T22:00:00Z",
  "pickupInstructions": "Side entrance, ring doorbell"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 42,
    "foodName": "Leftover Pizza",
    "quantity": 8,
    "status": "AVAILABLE",
    "expiryTime": "2026-05-30T22:00:00Z",
    "createdAt": "2026-05-29T18:30:00Z"
  }
}
```

#### Get Available Listings
```http
GET /api/food/available?latitude=19.0760&longitude=72.8777&radius=10
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 42,
      "foodName": "Leftover Pizza",
      "quantity": 8,
      "unit": "slices",
      "distance": 2.5,
      "restaurant": {
        "shopName": "John's Pizza Place",
        "address": "123 Main St"
      },
      "expiryTime": "2026-05-30T22:00:00Z"
    }
  ]
}
```

#### Update Food Listing
```http
PUT /api/food/:foodId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 6,
  "expiryTime": "2026-05-30T21:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "data": { "id": 42, "quantity": 6 }
}
```

</details>

<details>
<summary><b>📋 Food Request Endpoints</b></summary>

#### Create Request
```http
POST /api/request/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "foodListingId": 42,
  "pickupTime": "2026-05-29T19:30:00Z"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 15,
    "status": "PENDING",
    "foodListing": { "id": 42, "foodName": "Leftover Pizza" }
  }
}
```

#### Approve Request
```http
POST /api/request/:requestId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACCEPTED"
}

Response: 200 OK
{
  "success": true,
  "data": { "id": 15, "status": "ACCEPTED" }
}
```

#### Reject Request
```http
POST /api/request/:requestId/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Food unavailable - already reserved"
}

Response: 200 OK
{
  "success": true,
  "data": { "id": 15, "status": "REJECTED" }
}
```

</details>

<details>
<summary><b>🎯 Pickup Endpoints</b></summary>

#### Initiate Pickup
```http
POST /api/pickup/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestId": 15
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 8,
    "pickupCode": "A7X9K2",
    "qrToken": "eyJhbGciOiJIUzI1NiIs...",
    "pickupOtp": "234567"
  }
}
```

#### Verify QR Code
```http
POST /api/pickup/verify-qr
Authorization: Bearer <token>
Content-Type: application/json

{
  "qrCodeData": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "success": true,
  "data": { "verified": true }
}
```

#### Complete Pickup
```http
POST /api/pickup/:pickupId/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completionNotes": "Pickup successful, food stored safely"
}

Response: 200 OK
{
  "success": true,
  "data": { "status": "COMPLETED" }
}
```

</details>

<details>
<summary><b>🔔 Notification Endpoints</b></summary>

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "new_listing_created",
        "title": "New Food Available",
        "body": "Pizza is available for pickup",
        "isRead": false,
        "createdAt": "2026-05-29T18:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

#### Mark as Read
```http
PUT /api/notifications/:notificationId/read
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { "isRead": true }
}
```

</details>

<details>
<summary><b>⭐ Review Endpoints</b></summary>

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetId": 1,
  "targetType": "RESTAURANT",
  "rating": 5,
  "title": "Excellent food quality!",
  "comment": "Food was fresh and well packaged"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 23,
    "rating": 5,
    "title": "Excellent food quality!"
  }
}
```

#### Get Reviews
```http
GET /api/reviews?targetId=1&targetType=RESTAURANT
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "reviews": [ ... ],
    "averageRating": 4.5,
    "totalReviews": 12
  }
}
```

</details>

<details>
<summary><b>📊 Analytics Endpoints</b></summary>

#### Get Dashboard Stats
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalKgSaved": 1250,
    "totalPickups": 87,
    "peopleFed": 5000,
    "co2Prevented": 3.5,
    "thisMonth": {
      "kgSaved": 320,
      "pickups": 24
    }
  }
}
```

#### Get Impact Report
```http
GET /api/analytics/report?startDate=2026-05-01&endDate=2026-05-31&format=pdf
Authorization: Bearer <token>

Response: 200 OK (PDF file)
```

</details>

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (Base entity)
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
│ password    │
│ role        │ ← [ENUM: ADMIN, NGO, RESTAURANT, VOLUNTEER]
└─────────────┘
    ▲ │ │ │
    │ ▼ ▼ ▼
    ├─────────────────────────┐
    │                         │
┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐
│   Admin     │  │ Restaurant  │  │     NGO      │  │   Volunteer   │
├─────────────┤  ├─────────────┤  ├──────────────┤  ├───────────────┤
│ id (PK)     │  │ id (PK)     │  │ id (PK)      │  │ id (PK)       │
│ userId (FK) │  │ userId (FK) │  │ userId (FK)  │  │ userId (FK)   │
│             │  │ shopName    │  │ ngoName      │  │ name          │
│             │  │ address     │  │ address      │  │ status        │
│             │  │ latitude    │  │ coverageArea │  │ phoneVerified │
│             │  │ longitude   │  │ latitude     │  │               │
│             │  │ verified    │  │ longitude    │  │               │
└─────────────┘  └─────────────┘  └──────────────┘  └───────────────┘
                       │                  ▲
                       │                  │
                       ▼                  │
              ┌──────────────────┐        │
              │   FoodListing    │        │
              ├──────────────────┤        │
              │ id (PK)          │        │
              │ restaurantId (FK)├────────┤
              │ foodName         │        │
              │ quantity         │        │
              │ expiryTime       │        │
              │ status           │        │
              │ imageUrl         │        │
              └──────────────────┘        │
                       │                  │
                       │ (1:N)            │ (N:1)
                       ▼                  │
              ┌──────────────────┐        │
              │  FoodRequest     │        │
              ├──────────────────┤        │
              │ id (PK)          │        │
              │ foodListingId (FK)        │
              │ ngoId (FK)       ├────────┘
              │ status           │
              │ pickupTime       │
              │ pickupQrToken    │
              │ pickupOtp        │
              └──────────────────┘
                       │ (1:1)
                       ▼
              ┌──────────────────┐
              │   PickupLog      │
              ├──────────────────┤
              │ id (PK)          │
              │ foodRequestId (FK)
              │ pickupCode       │
              │ pickupStatus     │
              │ timestamp        │
              └──────────────────┘

              ┌──────────────────┐
              │   Notification   │
              ├──────────────────┤
              │ id (PK)          │
              │ userId (FK)      │
              │ type             │
              │ title            │
              │ body             │
              │ isRead           │
              │ createdAt        │
              └──────────────────┘

              ┌──────────────────┐
              │     Review       │
              ├──────────────────┤
              │ id (PK)          │
              │ userId (FK)      │
              │ targetId         │
              │ targetType       │
              │ rating (1-5)     │
              │ title            │
              │ comment          │
              │ createdAt        │
              └──────────────────┘

              ┌──────────────────┐
              │     Payment      │
              ├──────────────────┤
              │ id (PK)          │
              │ orderId          │
              │ paymentId        │
              │ amount           │
              │ status           │
              │ metadata         │
              │ createdAt        │
              └──────────────────┘
```

### Key Models & Relationships

| Model | Purpose | Key Fields | Relationships |
|-------|---------|-----------|---|
| **User** | Base user entity | id, email, password, role, isVerified | oneToOne: Admin/Restaurant/NGO/Volunteer |
| **Restaurant** | Food donor | userId, shopName, address, latitude, longitude | oneToMany: FoodListings |
| **NGO** | Food recipient | userId, ngoName, coverageArea | oneToMany: FoodRequests, Volunteers |
| **FoodListing** | Available food | restaurantId, foodName, quantity, expiryTime, status | manyToOne: Restaurant, oneToMany: FoodRequests |
| **FoodRequest** | Food request | foodListingId, ngoId, status, pickupTime | manyToOne: FoodListing/NGO, oneToOne: PickupLog |
| **PickupLog** | Completed pickup | foodRequestId, pickupCode, timestamp | oneToOne: FoodRequest |
| **Notification** | User alert | userId, type, title, body, isRead | manyToOne: User |
| **Review** | Rating & feedback | userId, targetId, rating, comment | manyToOne: User |
| **Payment** | Donation record | orderId, paymentId, amount, status | manyToOne: User |

---

## 🔐 Authentication & Security

### Authentication Flow

```
1. User Registers
   ↓
2. System sends OTP to email
   ↓
3. User enters OTP
   ↓
4. User marked as verified
   ↓
5. User can login with email/password
   ↓
6. System generates JWT token
   ↓
7. JWT included in all subsequent requests
```

### JWT Structure

```javascript
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": 1,
  "email": "user@example.com",
  "role": "RESTAURANT",
  "iat": 1685380000,
  "exp": 1686000000  // 7 days default
}

Signature:
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)
```

### Authorization Roles

| Role | Capabilities |
|------|---|
| **ADMIN** | Manage all users, approve NGOs/restaurants, view analytics, moderate reviews |
| **RESTAURANT** | Create food listings, respond to requests, view impact stats, write reviews |
| **NGO** | Request food, manage pickups, manage volunteers, view received donations |
| **VOLUNTEER** | Execute pickups, scan QR codes, track performance |

### Security Best Practices Implemented

✅ **Password Security**
- Passwords hashed with bcryptjs (salt rounds: 12)
- Never transmitted in plain text
- Reset tokens expire after 1 hour
- Force password change on first login

✅ **JWT Security**
- Stored in httpOnly cookies (XSS protection)
- Short expiration (7 days)
- Refresh token rotation on each use
- Secret key management via environment variables

✅ **API Security**
- HTTPS/TLS encryption
- CORS policy enforcement (whitelist origins)
- Rate limiting (300 requests per 15 minutes)
- Request validation (Joi schemas)
- SQL injection prevention (Prisma ORM)

✅ **Data Protection**
- Email verification for new accounts
- Phone OTP for sensitive operations
- QR code + one-time code for pickups
- Secure payment processing (Razorpay tokenization)

✅ **Infrastructure Security**
- Nginx reverse proxy with SSL
- Security headers (Helmet.js)
- CORS headers configured
- Request body size limits
- Input sanitization

---

## 🚀 Deployment

### Docker Deployment (Recommended)

#### Quick Start with Docker Compose

```bash
# Clone repository
git clone https://github.com/[YOUR_ORG]/savetheserve.git
cd SaveTheServe

# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env.local
# Edit with your values

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db

# Stop services
docker-compose down
```

#### Services Included

- **PostgreSQL** (Port 5432) - Database
- **Backend API** (Port 3000) - Express server
- **Frontend** (Port 3002) - Next.js app
- **Nginx** (Ports 80, 443) - Reverse proxy

### Platform-Specific Deployment

<details>
<summary><b>AWS EC2</b></summary>

```bash
# 1. Launch EC2 instance (t3.medium+, Ubuntu 20.04)
# 2. Security group: Allow SSH(22), HTTP(80), HTTPS(443)

# 3. SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# 4. Install Docker & dependencies
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git nginx

# 5. Clone and deploy
git clone <repo> /opt/savetheserve
cd /opt/savetheserve
cp server/.env.example server/.env
# Edit .env with values

# 6. Start services
docker-compose -f docker-compose.prod.yml up -d

# 7. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

</details>

<details>
<summary><b>Vercel (Frontend Only)</b></summary>

```bash
# Vercel is ideal for Next.js frontend

# 1. Push code to GitHub
git push origin main

# 2. Connect repository to Vercel
# Dashboard → New Project → Select savetheserve → Import

# 3. Configure environment variables
# Project Settings → Environment Variables
# Add: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL

# 4. Deploy
# Automatic on every push to main
```

</details>

<details>
<summary><b>Railway</b></summary>

```bash
# Railway supports full-stack deployment

# 1. Create Railway project
# Dashboard → New Project → GitHub → Select repo

# 2. Add services
# Database: PostgreSQL
# Backend: Node.js service (port 3000)
# Frontend: Node.js service (port 3002)

# 3. Configure environment variables
# Backend service → Variables → Add from .env
# Frontend service → Variables → Add NEXT_PUBLIC_* vars

# 4. Deploy
# Automatic on push to main
```

</details>

<details>
<summary><b>Render</b></summary>

```bash
# Render supports Docker and web services

# 1. Create new service
# Dashboard → New+ → Web Service → GitHub repo

# 2. Configure
# Environment: Docker
# Build Command: docker build -t savetheserve-api ./server
# Start Command: node index.js
# Environment Variables: Add from .env

# 3. Deploy
# Automatic on push to main
```

</details>

### SSL/TLS Setup

```bash
# Using Let's Encrypt (free)
sudo apt-get install certbot python3-certbot-nginx

# Request certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (checks daily)
sudo systemctl enable certbot.timer

# Certificate paths:
# - Certificate: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# - Private Key: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### CI/CD Pipeline (GitHub Actions)

The project includes automated testing and deployment via `.github/workflows/deploy.yml`:

**Triggers:**
- PR to main/develop → Run tests
- Push to develop → Test + deploy to staging
- Push to main → Test + deploy to production

**Pipeline Steps:**
1. Setup test environment
2. Run backend tests
3. Build frontend
4. Run linting
5. Build Docker images
6. Push to registry
7. Deploy to target environment
8. Run smoke tests
9. Notify on Slack

---

## ⚡ Performance Optimizations

### Frontend

- **Code Splitting** - Next.js automatically splits code per route
- **Image Optimization** - next/image component with WebP format
- **Lazy Loading** - React.lazy() for component imports
- **Caching** - React Query handles data caching
- **Static Generation** - Pre-render pages where applicable
- **Minification** - Automatic in production build

### Backend

- **Database Indexing** - Indexes on frequently queried columns:
  - `users.email` (login queries)
  - `food_listings.restaurant_id` (restaurant listings)
  - `food_requests.ngo_id` (NGO requests)
  - `notifications.user_id` (user notifications)

- **Query Optimization** - Prisma relation strategies
- **Connection Pooling** - Database connection reuse
- **Caching** - In-memory cache for frequently accessed data
- **Compression** - gzip compression for API responses
- **Rate Limiting** - Prevent abuse & server overload

### Infrastructure

- **CDN** - Cloudinary for image delivery
- **Database Replication** - PostgreSQL replicas for read scaling
- **Load Balancing** - Nginx distributes requests
- **Monitoring** - Track performance metrics

---

## 🧪 Testing

### Test Structure

```
server/tests/
├── setup.js           # Test configuration
├── teardown.js        # Cleanup after tests
├── auth.test.js       # Authentication tests
├── food.test.js       # Food listing tests
├── request.test.js    # Food request tests
├── notification.test.js
├── analytics.test.js
├── jobs.test.js       # Background job tests
└── integration.test.js # End-to-end tests
```

### Running Tests

```bash
cd server

# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Examples

```javascript
// auth.test.js - User Registration
describe('User Registration', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'securePassword123',
        role: 'RESTAURANT'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  it('should not register duplicate email', async () => {
    // Try to register same email twice
    await request(app).post('/api/auth/register').send({ ... });
    const response = await request(app).post('/api/auth/register').send({ ... });
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('already exists');
  });
});

// food.test.js - Food Listings
describe('Food Listings', () => {
  it('should create food listing as restaurant', async () => {
    const response = await request(app)
      .post('/api/food/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        foodName: 'Pizza',
        quantity: 5,
        expiryTime: new Date(Date.now() + 3600000)
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('AVAILABLE');
  });

  it('should not allow NGO to create listing', async () => {
    const response = await request(app)
      .post('/api/food/create')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ ... });
    
    expect(response.status).toBe(403);
  });
});
```

### Coverage Goals

- Aim for **>80% code coverage** on services
- Test all error scenarios
- Test role-based access control
- Test data validation

---

## ⚠️ Error Handling

### Validation

All inputs validated using Joi schemas:

```javascript
// Example validation schema
const createFoodSchema = Joi.object({
  foodName: Joi.string().required().max(100),
  quantity: Joi.number().required().min(1),
  expiryTime: Joi.date().required().iso().min('now'),
  category: Joi.string().optional().max(50)
});

// Error response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "quantity",
      "message": "quantity must be at least 1"
    }
  ]
}
```

### Logging

Winston logger captures all errors:

```javascript
// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// Usage
logger.error('Food listing creation failed', { 
  error: err.message, 
  userId: req.user.id 
});
```

### Exception Handling

```javascript
// Global error handler middleware
app.use((err, req, res, next) => {
  logger.error(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access' 
    });
  }
  
  // Default: 500 error
  return res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});
```

---

## ♿ Accessibility

### Responsive Design

- ✅ Mobile-first approach (works on 320px+)
- ✅ Tablet optimization
- ✅ Desktop views
- ✅ High DPI screen support

### ARIA & Semantic HTML

- ✅ Semantic HTML5 tags (`<button>`, `<form>`, `<nav>`)
- ✅ ARIA labels for icons: `aria-label="Close menu"`
- ✅ ARIA roles for custom components: `role="dialog"`
- ✅ ARIA live regions for notifications: `aria-live="polite"`

### Keyboard Navigation

- ✅ Tab navigation through all interactive elements
- ✅ Focus indicators (visible outline)
- ✅ Escape key to close modals
- ✅ Enter key to submit forms

### Color Contrast

- ✅ Minimum 4.5:1 contrast ratio for text
- ✅ Color-blind friendly palette
- ✅ No information conveyed by color alone

### Accessibility Standards

Follows **WCAG 2.1 Level AA** guidelines

---

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Completed)
- [x] User authentication & role-based access
- [x] Food listing creation & management
- [x] Request workflow (create, approve, reject)
- [x] QR code pickup verification
- [x] Email notifications
- [x] Basic analytics dashboard

### Phase 2: Enhanced Features 🔄 (Q3 2026)
- [ ] Advanced filtering & search
- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio)
- [ ] Real-time push notifications
- [ ] Enhanced analytics & reporting
- [ ] Leaderboard & gamification

### Phase 3: Scaling ⏳ (Q4 2026)
- [ ] Multi-language support
- [ ] Multi-currency support (multiple countries)
- [ ] AI-powered donation matching
- [ ] Blockchain for transparency
- [ ] Government integration

### Phase 4: Ecosystem 🚀 (2027+)
- [ ] Partner restaurants & NGO directory
- [ ] Corporate sponsorship program
- [ ] Volunteer certification program
- [ ] Academic research integration
- [ ] Media & PR platform

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Prerequisites

- Fork the repository
- Clone your fork: `git clone https://github.com/YOUR_GITHUB/savetheserve.git`
- Create a branch: `git checkout -b feature/amazing-feature`

### Development Workflow

1. **Make changes** to your feature branch
2. **Follow code standards**:
   - Run linter: `npm run lint`
   - Format code: `npm run format`
   - Add tests for new features
3. **Commit with conventional messages**:
   ```
   feat: Add food expiry notifications
   fix: Resolve QR code generation error
   docs: Update API documentation
   test: Add auth middleware tests
   ```
4. **Push & create PR**: `git push origin feature/amazing-feature`
5. **PR description** should include:
   - Problem statement
   - Solution overview
   - Testing performed
   - Screenshots/videos if UI changes

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:
```
feat(notifications): Add SMS notifications via Twilio

- Integrate Twilio SMS API
- Add SMS channel to notification service
- Update notification schema with SMS preferences
- Add tests for SMS delivery

Closes #123
```

### Branch Naming

- Feature: `feature/description` - e.g., `feature/food-expiry-alerts`
- Bug fix: `bugfix/description` - e.g., `bugfix/qr-validation-error`
- Documentation: `docs/description` - e.g., `docs/api-guide`

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>Database Connection Error</b></summary>

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify DATABASE_URL in .env
3. Reset database: `npx prisma migrate reset --force`
4. Check credentials in .env match PostgreSQL config

</details>

<details>
<summary><b>Port Already in Use</b></summary>

**Error:** `Error: listen EADDRINUSE :::3000`

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

</details>

<details>
<summary><b>Socket.IO Connection Error</b></summary>

**Error:** `Failed to connect to WebSocket`

**Solutions:**
1. Verify ALLOWED_ORIGINS includes frontend URL
2. Ensure WebSocket support in reverse proxy
3. Check firewall allows port 443 (HTTPS)
4. Disable browser extensions blocking WebSockets

</details>

<details>
<summary><b>Email Not Sending</b></summary>

**Error:** `Error: getaddrinfo ENOTFOUND smtp.gmail.com`

**Solutions:**
1. Verify SMTP credentials in .env
2. For Gmail: Enable 2FA and use App Password
3. Check firewall allows SMTP (port 587)
4. Test with: `npm run test:email`

</details>

<details>
<summary><b>Image Upload Fails</b></summary>

**Error:** `Error: Invalid Cloudinary credentials`

**Solutions:**
1. Verify CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
2. Check Cloudinary account is active
3. Ensure upload folder permissions
4. Test upload: `curl -X POST -F "file=@image.jpg" http://localhost:3000/api/upload`

</details>

<details>
<summary><b>Build Fails in Production</b></summary>

**Error:** `npm ERR! code ELIFECYCLE`

**Solutions:**
1. Clear cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules && npm install`
3. Check Node version: `node --version` (should be 18+)
4. Run build locally: `npm run build`

</details>

---

## ❓ FAQ

**Q: Is SaveTheServe free to use?**  
A: [PROVIDE ANSWER]

**Q: How is food safety ensured?**  
A: [PROVIDE ANSWER]

**Q: Can restaurants charge for food through SaveTheServe?**  
A: [PROVIDE ANSWER]

**Q: How are disputes resolved?**  
A: [PROVIDE ANSWER]

**Q: Is there mobile app support?**  
A: Not yet. Mobile app (iOS/Android) is planned for Q3 2026.

**Q: How are volunteer background checks handled?**  
A: [PROVIDE ANSWER]

**Q: What payment methods are supported?**  
A: Razorpay gateway supports credit/debit cards, UPI, net banking, and digital wallets.

**Q: Can I export my donation history?**  
A: Yes. Visit Dashboard → Reports → Export as CSV/PDF

---

## 📄 License

This project is licensed under the **[YOUR_LICENSE]** License - see [LICENSE](LICENSE) file for details.

**Permissions:** [DESCRIBE]  
**Conditions:** [DESCRIBE]  
**Limitations:** [DESCRIBE]

---

## 👤 Author

**[YOUR_NAME]**

- GitHub: [@[YOUR_GITHUB]](https://github.com/[YOUR_GITHUB])
- LinkedIn: [linkedin.com/in/[YOUR_LINKEDIN]](https://linkedin.com/in/[YOUR_LINKEDIN])
- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- Email: [your-email@example.com](mailto:your-email@example.com)

---

## 🙏 Acknowledgments

### Inspiration & Learning

- [ONE] for inspiring food waste reduction initiatives
- [TWO] for platform design patterns
- [THREE] for technical guidance

### Libraries & Tools

- [Express.js](https://expressjs.com/) - Web framework
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [Socket.io](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Cloudinary](https://cloudinary.com/) - Image hosting

### Contributors

- [CONTRIBUTOR_NAME] - [CONTRIBUTION]
- [CONTRIBUTOR_NAME] - [CONTRIBUTION]

### Special Thanks

- Our NGO partners for testing & feedback
- Restaurant volunteers for their support
- Community members who believed in this mission

---

## 📞 Support

Need help?

- 📖 [Documentation](DEPLOYMENT.md)
- 🐛 [Report Issues](https://github.com/[YOUR_ORG]/savetheserve/issues)
- 💬 [Discussions](https://github.com/[YOUR_ORG]/savetheserve/discussions)
- 📧 Email: [support@savetheserve.org](mailto:support@savetheserve.org)

---

## 📊 Project Statistics

- **Lines of Code:** ~[CODE_LINES]
- **Test Coverage:** [COVERAGE]%
- **Active Contributors:** [NUMBER]
- **Repositories:** [REPO_COUNT]
- **Users (Food Donors):** [DONOR_COUNT]
- **Users (NGOs):** [NGO_COUNT]
- **Food Saved:** [KG_SAVED] kg
- **People Helped:** [PEOPLE_COUNT]

---

<div align="center">

**[⬆ back to top](#savetheserve-)**

Made with ❤️ by [YOUR_NAME] and contributors

[Star](https://github.com/[YOUR_ORG]/savetheserve) • [Follow](https://twitter.com/[YOUR_TWITTER]) • [Share](https://linkedin.com/sharing/share-offsite/?url=https://github.com/[YOUR_ORG]/savetheserve)

</div>
