# SaveTheServe Client

Modern, responsive frontend for the SaveTheServe food rescue platform. Built with Next.js 16, React 19, and Tailwind CSS, featuring role-based dashboards for NGOs, restaurants, and administrators.

## 🚀 Features

### Core Functionality
- **🔐 Authentication**: JWT-based auth with role-based access control
- **👥 Multi-role Support**: NGO, Restaurant, and Admin interfaces
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🎯 Real-time Updates**: Dynamic food listings and request status
- **🗺️ Location Services**: Geolocation for food pickup coordination
- **🔍 SEO Optimized**: Server-side rendering with structured data

### Role-Specific Features

#### NGO Dashboard
- Browse available food listings
- Filter by location, category, and expiry time
- Create pickup requests with scheduling
- Track request status and history

#### Restaurant Dashboard  
- Create and manage food listings
- Track expiry times and quantities
- Handle incoming pickup requests
- Accept/complete request workflow
- Impact tracking and analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: React 19 with concurrent features
- **Styling**: Tailwind CSS 4 with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand for global state
- **API Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- SaveTheServe server running on port 3000

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   cd client
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3002
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Visit http://localhost:3002

4. **Validate Integration**
   ```bash
   node validate.js
   ```

## 🔌 API Integration

The client integrates with the SaveTheServe server API:

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Food Listings (Restaurant Role)
- `POST /food/create` - Create food listing
- `GET /food/my-listings` - Get restaurant's listings
- `PUT /food/:id` - Update food listing
- `DELETE /food/:id` - Delete food listing

### Food Discovery (NGO Role)
- `GET /food/available` - Get available food (with geolocation)

### Request Management
- `POST /requests/create` - Create pickup request (NGO)
- `GET /requests/my-requests` - Get NGO's requests
- `GET /requests/incoming` - Get restaurant's incoming requests
- `PUT /requests/:id/status` - Update request status (Restaurant)
- `DELETE /requests/:id` - Cancel request (NGO)

## 🎯 User Roles & Permissions

### NGO Role (`ngo`)
- View available food listings
- Create pickup requests
- Track request history
- Access: `/ngo/{userId}/`

### Restaurant Role (`restaurant`)
- Create/manage food listings
- Handle incoming requests
- Accept/complete requests
- Access: `/donor/{userId}/` (UI uses 'donor' paths)

### Admin Role (`admin`)
- User management
- Platform analytics
- System administration
- Access: `/admin/{userId}/`

## 🧪 Testing & Validation

### Validation Script
Run the comprehensive validation:
```bash
node validate.js
```

Checks:
- ✅ Project structure
- ✅ Environment configuration  
- ✅ API service integration
- ✅ Role-based routing
- ✅ SEO implementation
- ✅ Build process
- ✅ Dependencies

### Manual Testing Workflow

1. **Authentication Flow**
   - Register as NGO and Restaurant
   - Login with different roles
   - Profile access and updates

2. **Restaurant Workflow**
   - Create food listings
   - Handle incoming requests
   - Update request status

3. **NGO Workflow**
   - Browse available food
   - Create pickup requests
   - Track request status

## 🚀 Deployment

### Build Process
```bash
npm run build
npm start
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.savetheserve.com/api
NEXT_PUBLIC_SITE_URL=https://savetheserve.com
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_verification_code
```

## 📚 API Documentation Alignment

This client implements all server endpoints documented in the SaveTheServe server README:

- ✅ Authentication: login, register, profile
- ✅ Food listings: create, update, delete, my-listings, available
- ✅ Requests: create, my-requests, incoming, status updates, cancel
- ✅ Role-based access control
- ✅ Geolocation filtering
- ✅ Real-time status updates

---

**Ready to make a difference? Start rescuing food and serving communities!** 🍽️💚
