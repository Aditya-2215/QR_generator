# QRVerse — Enterprise-Grade Custom QR Generation Platform

QRVerse is a highly polished, production-ready, full-stack application built using **React 19**, **Vite**, **Tailwind CSS**, and **Express.js**. It features a modern Apple/Stripe-inspired user experience utilizing glassmorphism aesthetics, fluid micro-animations, custom HEX color selectors, high-redundancy corporate logo uploading, and dynamic cloud sync capabilities.

---

## 🚀 Key Features

*   **Multi-Format Generation**: Tailored inputs for standard URLs, WiFi configurations, vCard Business Contacts, UPI Merchant Payments, raw Text coupons, Email drafts, Datetime Calendar Events, and Geolocation lat/long pins.
*   **30% Redundancy Security**: Generated with **Error Correction Level H** (High), ensuring custom logo overlays do not impede physical scanner readability.
*   **Aesthetic Branding**: Dynamic client-side HTML5 canvas merging for custom logos, background/foreground HEX color selection, resolution scaling up to 1024px, and custom padding control.
*   **Persistent Cloud Sync**: Robust local data persistence inside `/data/db.json` using Express endpoints. Users save, favorite, edit, and track their QR configurations across logins.
*   **Statistical Analytics**: Aggregates distribution matrices and telemetry logs of cumulative exports, favorites, and code counts.

---

## 📁 Project Architecture (MVC)

The project separates the presentation layer from backend routing and database models to support scalable deployments:

```text
/
├── data/                    # JSON-file database folder (Durable Cloud Persistence)
│   └── db.json              # Active user collections & QR code designs
├── server/                  # Custom Express MVC Backend
│   ├── controllers/         # Endpoint operations (AuthController, QRController)
│   ├── middlewares/         # JWT Session authenticators & guest pass-throughs
│   ├── routes/              # Routing tables (authRoutes, qrRoutes)
│   └── services/            # Core DB operations (DatabaseService)
├── src/                     # React Client SPA Frontend
│   ├── components/          # Reusable components (Navbar, QRGenerator, Blobs)
│   ├── context/             # Dynamic global Auth contexts
│   ├── pages/               # Screen portals (LandingPage, Login, Dashboard)
│   ├── services/            # Axios API wrappers
│   ├── types.ts             # Shared Type interfaces
│   ├── index.css            # Tailwind typography, custom scrollbars, animations
│   ├── main.tsx             # React SPA mounting hub
│   └── App.tsx              # View router and authorization guards
├── server.ts                # Main Express server boot & Vite middleware proxy
├── vite.config.ts           # Bundler config (HMR switches & absolute paths)
├── tsconfig.json            # Strict TypeScript configuration
└── package.json             # Script definitions and dependency specifications
```

---

## 🛠️ API Documentation

### 🔑 Authentication Routes

*   `POST /api/auth/register` — Registers a new user. Expects `{ name, email, password }`. Generates a JWT token.
*   `POST /api/auth/login` — Initiates credentials check. Expects `{ email, password }`. Issues standard authorization session tokens.
*   `GET /api/auth/me` — Verifies current headers dynamically to restore active dashboard sessions on load.

### 🔳 QR Code Operations

*   `POST /api/qr/generate` — Renders base QR code data URL on-the-fly. Expects full design configs. Syncs design properties to the active account if an authorization token is supplied.
*   `GET /api/qr` — Retrieves user's saved QR configurations. Supports search and type filter parameters.
*   `GET /api/qr/:id` — Fetches design properties of a specific code.
*   `PUT /api/qr/:id` — Edits properties of a custom code.
*   `DELETE /api/qr/:id` — Clears custom configs from cloud directories.
*   `PATCH /api/qr/:id/favorite` — Toggles active user favoriting stats.
*   `PATCH /api/qr/:id/download` — Increments cumulative export tallies for analytical metrics.

---

## ⚙️ Environment Configurations

Declare variables in a local `.env` file referencing `.env.example`:

```env
# Server details
PORT=3000

# JSON Web Token Secret
JWT_SECRET="qrverse-super-secret-key-3591823091"

# Development URL
APP_URL="http://localhost:3000"
```

---

## 💾 Installation & Development Guide

Follow these steps to run the application locally:

### 1. Install dependencies
```bash
npm install
```

### 2. Run the full-stack development server
```bash
npm run dev
```
The server will launch at `http://localhost:3000`. API routes `/api/*` are handled by Express, while client-side requests are hot-proxied via Vite middleware automatically.

### 3. Build and Bundle for Production
```bash
npm run build
```
This builds your client SPA assets inside `/dist` and compiles your custom TypeScript backend into a single, highly optimized, self-contained file: `dist/server.cjs`.

### 4. Start Production Server
```bash
npm start
```
This directly boots up the compiled server, enabling ultra-fast container cold starts on Cloud Run, Vercel, or Heroku.
