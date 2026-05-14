# BharatBuild — AI-Powered Telangana Construction Marketplace 🏗️

![BharatBuild Banner](https://via.placeholder.com/1200x300.png?text=BharatBuild+-+AI+Construction+Marketplace)

BharatBuild is a highly specialized, AI-enhanced MERN+Python marketplace platform tailored for the construction industry in Telangana. It connects users directly with verified *Mestris*, heavy machinery operators, and material suppliers via a robust geospatial search engine, while utilizing artificial intelligence and machine learning to estimate materials, predict prices, and parse complex, multilingual voice queries.

Built with scalability, modularity, and a clean architecture in mind, the platform acts as an intelligent discovery engine designed specifically for the heavy lifting of construction.

## 🌟 Comprehensive Feature Set

### 🧠 Artificial Intelligence & Machine Learning
* **Multilingual AI Voice Search:** Uses browser Web Speech API for voice input and an advanced Gemini AI prompt to parse complex, conversational queries in English, Telugu, Hindi, or Hinglish (e.g., *"Naku Kukatpally lo mestri kavali"*).
* **Intelligent Synonym Mapping:** AI automatically maps regional colloquialisms and synonyms (e.g., "bavilu" -> "Borewell Rig", "mistri" -> "Mestri") to exact database subcategories.
* **ML Material Estimator:** A Python/FastAPI microservice running scikit-learn models to estimate precise material quantities (cement bags, sand cft, steel kg, etc.) based on work type, area, and thickness.
* **Dynamic Price Prediction Engine:** Predicts fair market rates for labor, machinery, and materials based on deep market knowledge, adjusting for premium areas and worker experience.

### 🗺️ Geospatial & Search Capabilities
* **Location-Aware Discovery (`$geoNear`):** Find providers within a highly customizable kilometer radius of any project site using MongoDB 2dsphere indexing.
* **Interactive Map/Grid View:** A split-screen interface using React Leaflet (OpenStreetMap) synced in real-time with React Query search results.
* **Granular Filtering:** Filter by precise category, subcategory, price bounds, availability, and verification status.

### 🔐 Security & Access Control
* **Role-Based Access Control (RBAC):** Secure JWT flows and separated logic for `seeker`, `provider`, and `admin` roles.
* **Admin Moderation Gateway:** Platform security through a strict admin-approval pipeline for all newly created provider listings.
* **Global Error Handling:** Standardized API error responses and custom ApiError utilities across the backend.

### 🏢 Dashboards & Provider Tools
* **Provider Dashboards:** Dedicated UI for providers to create their business profiles, set pricing, and manage their inbound inquiries.
* **Cloud Media Storage:** Direct integration with Cloudinary for uploading and managing professional image galleries of past construction work.
* **Industrial UI/UX:** A bespoke, construction-themed design system built from scratch using Tailwind CSS.

## 🚀 Architectural Stack

**Frontend (Client)**
* React 18 (Vite)
* Tailwind CSS + Custom Industrial Theme
* TanStack Query (React Query)
* React Router v6
* React Leaflet (OpenStreetMap)
* Web Speech API for STT

**Backend (Node.js API)**
* Node.js / Express
* MongoDB Atlas + Mongoose 9 (2dsphere indexing)
* @google/generative-ai (Gemini 2.5 Flash for NLP)
* JSON Web Tokens (JWT) & bcryptjs
* Joi (Validation)
* Cloudinary + Multer (Memory Storage)

**Microservice (Python ML Engine)**
* Python 3.10+
* FastAPI & Uvicorn
* scikit-learn & joblib
* Pandas & NumPy

## 📁 Project Architecture

The codebase strictly follows a modular, scalable architecture separating concerns across multiple services.

```text
BharatBuild/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # Axios API client functions
│   │   ├── components/     # UI elements & Map components
│   │   ├── hooks/          # React Query hooks
│   │   ├── pages/          # Route-level components
│   │   └── index.css       # Global industrial design tokens
│
├── server/                 # Backend Node.js Application
│   ├── src/
│   │   ├── config/         # Environment & DB setup
│   │   ├── middleware/     # Auth, Upload, Error Handler
│   │   ├── modules/        # Domain-driven modules (auth, listings, ai, etc.)
│   │   └── app.js          # Express app configuration
│
├── ml-service/             # Python FastAPI Machine Learning Service
│   ├── models/             # Pickled scikit-learn models (.pkl)
│   ├── main.py             # FastAPI server & endpoints
│   └── train_model.py      # ML Model training scripts
│
└── render.yaml             # Render deployment configuration for all services
```

## 🚢 Deployment

The project is structured for a seamless cloud deployment:
1. **Frontend**: Static site deployment via Render or Vercel.
2. **Backend**: Node.js web service via Render.
3. **ML Microservice**: Python FastAPI web service via Render.
All three environments are orchestrated using a single `render.yaml` configuration file for continuous deployment.

---
*Developed by [Dhanush A] - Designed for Telangana's Construction Needs.*
