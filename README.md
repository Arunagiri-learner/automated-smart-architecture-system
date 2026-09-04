# AUTOMATED SMART ARCHITECTURE SYSTEM (ASAS)

> A production-quality full-stack web application for architectural floor plan analysis, room space management, building area calculations, construction budget estimation, and structured Excel report generation.

---

## 🌟 Application Capabilities & Features

- **Floor Plan Analysis Canvas**: SVG/Canvas viewer with Zoom, Pan, Fit-to-Screen, Fullscreen, Layer Toggles (*Grid, Labels, Dimensions, Doors*), and Floor Switcher (*Ground, 1st, 2nd, 3rd*).
- **Interactive Room Selection**: Click room boundaries to inspect location, clear height (ft), occupancy capacity, and area (sq.ft) in side panel.
- **Construction Budget Estimator**: Dynamic calculation engine ($Total Area \times Rate/sq.ft$), quality tier selection (*Basic ₹1,800, Standard ₹2,200, Premium ₹2,800, Luxury ₹3,500, Custom Rate*), 10-category percentage breakdown (Materials, Labour, Electrical, Plumbing, Finishing, Doors/Windows, Painting, Roofing, Other, Contingency), floor-wise budget, room-wise budget, and scenario comparison matrix.
- **ExcelJS Multi-Sheet Report Generator**: Produces complete 5-sheet `.xlsx` workbooks (*Building Summary, Room Details, Floor Summary, Cost Breakdown, Assumptions & Legal Disclaimer*).
- **Production Architecture**: Deployment-hardened Node.js Express backend with MongoDB Atlas integration, Render environment support, Vercel SPA routing fallback, and client API environment variable controls.

---

## 🚀 Live Production Deployment Guide

Follow this guide to deploy your project to **GitHub**, **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

---

### Step 1: Push Code to GitHub

1. Create a new public repository on GitHub named `automated-smart-architecture-system`.
2. Initialize git and commit your clean source code (excluding `.env` and `node_modules`):
```bash
git init
git add .
git commit -m "Production release of Automated Smart Architecture System (ASAS)"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/automated-smart-architecture-system.git
git push -u origin main
```

---

### Step 2: Set Up MongoDB Atlas (Database)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free Shared Cluster (e.g. `M0 FREE`).
3. Under **Database Access**, create a database user (e.g. username `asas_admin`, password `YOUR_STRONG_PASSWORD`).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render cloud instances can connect.
5. Click **Connect** → **Drivers** → Copy your connection string:
   `mongodb+srv://asas_admin:<password>@cluster0.mongodb.net/asas_db?retryWrites=true&w=majority`

---

### Step 3: Deploy Backend API on Render

1. Create an account on [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository `automated-smart-architecture-system`.
4. Configure service settings:
   - **Name**: `asas-backend-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add the following keys:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://asas_admin:<password>@cluster0.mongodb.net/asas_db?retryWrites=true&w=majority`
   - `CLIENT_URL`: `https://your-asas-frontend.vercel.app` (Add after Vercel deployment)
6. Click **Create Web Service**. Render will build and launch your backend API.
7. Copy your backend URL (e.g., `https://asas-backend-api.onrender.com`). Verify deployment by opening `https://asas-backend-api.onrender.com/api/health` in your browser.

---

### Step 4: Deploy Frontend Web Application on Vercel

1. Create an account on [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository `automated-smart-architecture-system`.
4. Configure Vercel project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit → Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://asas-backend-api.onrender.com/api` (Use your Render backend URL)
6. Click **Deploy**. Vercel will build and host your web application.
7. Copy your live Vercel URL (e.g., `https://your-asas-frontend.vercel.app`).

---

### Step 5: Update CORS on Render Backend

1. Return to your Render Dashboard → Select `asas-backend-api` → **Environment**.
2. Update `CLIENT_URL` to your live Vercel domain:
   - `CLIENT_URL`: `https://your-asas-frontend.vercel.app`
3. Save changes. Render will automatically redeploy.

---

## 🔑 Required Environment Variables Overview

### Frontend Environment Variables (`frontend/.env`)
| Variable Name | Description | Example Value |
|---|---|---|
| `VITE_API_BASE_URL` | Render Production API URL | `https://asas-backend-api.onrender.com/api` |

### Backend Environment Variables (`backend/.env`)
| Variable Name | Description | Example Value |
|---|---|---|
| `PORT` | Cloud Host Assigned Port | `5000` |
| `NODE_ENV` | Environment Mode | `production` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster0.mongodb.net/asas_db` |
| `CLIENT_URL` | Live Vercel Frontend Domain | `https://your-asas-frontend.vercel.app` |
| `UPLOAD_PATH` | Local Upload Path | `./uploads` |

---

## 🧪 Deployment Verification Checklist

- [x] Frontend builds cleanly (`npm run build` with Vite)
- [x] Backend builds cleanly (`npm run build` with TypeScript)
- [x] Health check endpoint active (`GET /api/health`)
- [x] Dynamic port binding enabled (`process.env.PORT`)
- [x] Dynamic CORS matching `CLIENT_URL`
- [x] SPA Router fallback configured via `vercel.json`
- [x] Floor Plan SVG Viewer interactive zoom, pan, and room selection
- [x] Live Construction Budget Estimator calculation engine
- [x] Complete 5-Sheet Excel Workbook generator (`.xlsx`)
- [x] Mobile responsive UI across 320px – 1920px viewports
