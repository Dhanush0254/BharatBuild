# BharatBuild — Telangana's Construction Marketplace 🏗️

![BharatBuild Banner](https://via.placeholder.com/1200x300.png?text=BharatBuild+-+Telangana+Construction+Marketplace)

BharatBuild is a specialized, production-grade MERN marketplace platform tailored for the construction industry in Telangana. It connects users directly with verified *Mestris*, heavy machinery operators, and material suppliers via a robust geospatial search engine. 

Built with scalability and clean architecture in mind, the platform acts as a discovery engine (like JustDial or UrbanCompany) specifically for the heavy lifting of construction.

## 🌟 Key Features

* **Geospatial Discovery (`$geoNear`)**: Find providers within a customizable kilometer radius of any project site.
* **Modular Monolith Backend**: Clean architecture separating controllers, services, routes, and validation schemas.
* **Role-Based Access Control**: Secure JWT flows for `seeker`, `provider`, and `admin` roles.
* **Split Map/Grid View**: Interactive Leaflet maps synced with real-time React Query search results.
* **Provider Dashboards**: Dedicated UI for providers to create listings, upload image galleries (Cloudinary), and manage inbound inquiries.
* **Admin Moderation Flow**: Platform security through an admin-approval gateway for all new listings.
* **Industrial UI/UX**: Custom design system using Tailwind CSS with asymmetric, construction-themed components.

## 🚀 Tech Stack

**Frontend**
* React 18 (Vite)
* Tailwind CSS + Custom Industrial Theme
* TanStack Query (React Query)
* React Router v6
* React Leaflet (OpenStreetMap)
* Lucide React Icons

**Backend**
* Node.js / Express
* MongoDB Atlas + Mongoose 9 (2dsphere indexing)
* JSON Web Tokens (JWT) & bcryptjs
* Joi (Validation)
* Cloudinary + Multer (Memory Storage)
* PM2 (Process Management)

## 📁 Project Architecture

The codebase strictly follows a modular, scalable architecture instead of a generic MVC.

```text
BharatBuild/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # Axios API client functions
│   │   ├── components/     # Reusable UI elements & Map components
│   │   ├── context/        # Auth Context
│   │   ├── hooks/          # Custom React Query hooks
│   │   ├── layouts/        # Application shell (Header/Footer)
│   │   ├── pages/          # Route-level components
│   │   └── index.css       # Global industrial design tokens
│
└── server/                 # Backend Node.js Application
    ├── src/
    │   ├── config/         # Environment & Cloudinary setup
    │   ├── middleware/     # Auth, Upload, Global Error Handler
    │   ├── modules/        # Domain-driven modules (auth, listings, users, etc.)
    │   │   └── listings/   # Example module (Controller, Service, Route, Model, Valdation)
    │   ├── utils/          # ApiError, sendResponse, geoHelpers
    │   ├── seed/           # Realistic mock data generation
    │   └── app.js          # Express app configuration
    └── ecosystem.config.js # PM2 deployment config
```

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster or Local Instance
- Cloudinary Account (for image uploads)

### 2. Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file in the `client` directory (optional, for custom API URLs):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Installation
Open two terminal instances.

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm run seed # (Optional) Seed database with 50+ realistic Telangana listings
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
```

### 4. Default Test Accounts (If Seeded)
- **Admin**: `admin@bharatbuild.com` / `password123`
- **Provider**: `suresh@example.com` / `password123`
- **Seeker**: `raju@example.com` / `password123`

## 🛡️ API Design & Error Handling

The API uses a standardized response format via a custom `sendResponse` utility and a global error handling middleware using a custom `ApiError` class.

**Success Response Example:**
```json
{
  "success": true,
  "message": "Listings retrieved successfully",
  "data": {
    "listings": [...],
    "pagination": { "total": 45, "page": 1, "pages": 4 }
  }
}
```

## 🚢 Deployment

The project is ready for deployment:
1. **Frontend**: Can be easily deployed on Vercel or Netlify via GitHub integration.
2. **Backend**: Configured for VPS or Render deployment using the included `ecosystem.config.js` for PM2 cluster mode.

## 👨‍💻 Developer Notes
This application purposefully avoids overengineering (like Kafka, Redis, or microservices) to perfectly target the needs of a Series A local marketplace startup. It demonstrates robust full-stack capabilities focused on geospatial queries, clean architecture, and polished UI/UX.

---
*Developed by [Dhanush A] - Designed for Telangana's Construction Needs.*
