# ⚡ Sleek Tech Pay

> Modern, production-ready Safaricom M-PESA payment platform and Point-of-Sale (POS) integration gateway.

Built with **TypeScript**, **React 19**, **Vite**, **Tailwind CSS**, and **Node.js Express**.

---

## 🌟 Key Capabilities

1. **Lipa na M-PESA Online (STK Express Push)**
   - Instant payment prompt triggered directly to the customer's Safaricom phone.
   - Real-time polling with an animated radar pulse awaiting customer PIN entry.
   - Immediate status resolution with **Customer Name**, **M-Pesa Receipt Code**, and settled amount.

2. **Dynamic M-PESA QR Code Generator**
   - Calls Safaricom Daraja Dynamic QR API (`/mpesa/qrcode/v1/generate`).
   - Generates high-contrast scannable QR codes for Buy Goods (Till) and PayBill.
   - Real-time countdown timer and payment confirmation watcher.

3. **Customer Name Display on Payment**
   - Prominently extracts and displays the customer's full name (e.g. `GIDEON KIPCHUMBA`, `FAITH WANJIKU`) upon settlement.
   - Celebratory UI with confetti animation and harmonic audio chime.
   - Standard 80mm thermal POS receipt preview with 1-click printing (`window.print()`).

4. **Track by Transaction Code Only**
   - Enter only the M-PESA confirmation code (e.g., `NL82XP91MK`, `SFK92...`).
   - Queries local ledger or Safaricom Daraja Transaction Status API (`/mpesa/transactionstatus/v1/query`).
   - Instantly reveals verified customer name, exact amount, date & time, and verified seal.

5. **Live Transactions Ledger**
   - Searchable, filterable real-time transaction history.
   - Auto-refreshes every 5 seconds.
   - One-click receipt viewer.

6. **Built-in POS Payment Simulator**
   - Allows instant testing and verification of the whole checkout workflow, customer name resolution, and receipt printing without waiting for Safaricom live approval.

---

## 💻 Local Development

### Option A: Double-Click or Run the Start Script
Run the automated launcher:
```powershell
.\start-all.ps1
```
Or in Command Prompt:
```cmd
start-all.bat
```

### Option B: Run via NPM
From the root folder:

1. **Start Backend (Port 5000):**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend (Port 5173):**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser at:
   👉 **http://localhost:5173**

---

## 🚀 Cloud Deployment Guide

This project is configured for cloud deployment with:
* **Backend:** Deployed as a Web Service on [Render](https://render.com) using the included `render.yaml`.
* **Frontend:** Deployed as a static SPA on [Vercel](https://vercel.com) using `frontend/vercel.json`.

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│       Frontend on Vercel        │       │        Backend on Render        │
│    (sleek-tech-pay.vercel.app)  │──────▶│ (sleek-backend.onrender.com)    │
└─────────────────────────────────┘       └────────────────┬────────────────┘
                                                           │
                                                           ▼
                                          ┌─────────────────────────────────┐
                                          │     Safaricom Daraja API        │
                                          │    (api.safaricom.co.ke)        │
                                          └─────────────────────────────────┘
```

---

### 1. Backend Deployment on Render (`render.yaml`)

The repository includes a `render.yaml` blueprint file for Render deployment.

#### Method 1: Deploy with Render Blueprint (Recommended)
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [dashboard.render.com](https://dashboard.render.com).
3. Click **"New +"** ➔ **"Blueprint"**.
4. Select your `SLEEK` repository. Render will automatically detect `render.yaml`.
5. Enter your Safaricom production credentials in the environment variables prompt.
6. Click **"Apply"**. Render will build and deploy your backend with a public HTTPS URL (e.g., `https://sleek-tech-pay-backend.onrender.com`).

#### Method 2: Manual Web Service Setup on Render
If setting up manually without Blueprint:
1. In the Render Dashboard, click **"New +"** ➔ **"Web Service"**.
2. Connect your repository.
3. Configure the following fields:
   * **Name:** `sleek-tech-pay-backend`
   * **Region:** Any (e.g. `Oregon` or `Frankfurt`)
   * **Branch:** `main` (or `master`)
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Health Check Path:** `/api/health`
4. Under **Environment Variables**, add:
   | Key | Example Value | Description |
   | --- | --- | --- |
   | `NODE_ENV` | `production` | Node environment |
   | `PORT` | `10000` | Render port (auto-assigned) |
   | `ENVIRONMENT` | `production` | `production` or `sandbox` |
   | `CONSUMER_KEY` | `YourConsumerKey` | Safaricom Daraja Consumer Key |
   | `CONSUMER_SECRET` | `YourConsumerSecret`| Safaricom Daraja Consumer Secret |
   | `PASSKEY` | `YourPasskey` | Lipa na M-Pesa Online Passkey |
   | `SHORTCODE` | `174379` | Your PayBill or Till Shortcode |
   | `BUSINESS_TYPE` | `BuyGoods` | `BuyGoods` or `PayBill` |
   | `CALLBACK_URL` | `https://sleek-tech-pay-backend.onrender.com/api/mpesa/callback/stk` | Webhook URL for M-Pesa callbacks |
5. Click **"Create Web Service"**.

> [!IMPORTANT]
> Once Render deploys your backend, copy your public service URL (e.g., `https://sleek-tech-pay-backend.onrender.com`). You will need this for the frontend configuration on Vercel and your M-Pesa Callback URL.

---

### 2. Frontend Deployment on Vercel

The frontend is built with Vite and React 19, pre-configured with `frontend/vercel.json` for SPA routing.

#### Deployment Steps:
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your `SLEEK` GitHub repository.
4. In the **Configure Project** screen:
   * **Project Name:** `sleek-tech-pay`
   * **Framework Preset:** `Vite`
   * **Root Directory:** Click **Edit** and choose `frontend`
   * **Build Command:** `npm run build` (default)
   * **Output Directory:** `dist` (default)
5. Under **Environment Variables**, add:
   * **Key:** `VITE_API_BASE_URL`
   * **Value:** `https://your-backend.onrender.com/api` *(Replace with your actual Render backend URL)*
6. Click **"Deploy"**.

Vercel will build the frontend and provide your live application URL (e.g., `https://sleek-tech-pay.vercel.app`).

---

### 3. Registering the Live Webhook Callback with Safaricom

For Lipa na M-Pesa STK callbacks to reach your Render backend, set the Callback URL in the **Daraja Config** tab (or in Render's `CALLBACK_URL` environment variable):

```
https://<YOUR-RENDER-BACKEND-URL>/api/mpesa/callback/stk
```

Example:
```
https://sleek-tech-pay-backend.onrender.com/api/mpesa/callback/stk
```

---

## ⚙️ Production Safaricom Daraja Endpoints Reference

All endpoints called by this platform in production:

* **OAuth2 Token:** `https://api.safaricom.co.ke/oauth/v1/generate`
* **STK Push (Lipa na M-Pesa Express):** `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
* **STK Push Query:** `https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query`
* **Dynamic QRCode:** `https://api.safaricom.co.ke/mpesa/qrcode/v1/generate`
* **Transaction Status:** `https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query`
* **Account Balance:** `https://api.safaricom.co.ke/mpesa/accountbalance/v1/query`
* **Reversal:** `https://api.safaricom.co.ke/mpesa/reversal/v1/request`
* **C2B Register URL:** `https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl`
* **B2C Payment:** `https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest`

---

## 🔌 Point of Sale (POS) Integration Endpoints

When you are ready to integrate **Sleek Tech Pay** directly into your POS system, call these backend endpoints:

### 1. Trigger STK Push from POS:
```http
POST https://<YOUR-BACKEND>/api/pay/stk-push
Content-Type: application/json

{
  "phoneNumber": "0712345678",
  "amount": 1500,
  "accountReference": "POS-ORDER-101",
  "transactionDesc": "Counter Checkout"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "CheckoutRequestID": "ws_CO_1793355451716_23029",
    "transactionId": "..."
  }
}
```

### 2. Poll POS Payment Status:
```http
GET https://<YOUR-BACKEND>/api/pay/status/{CheckoutRequestID}
```
When settled, it returns:
```json
{
  "status": "COMPLETED",
  "customerName": "GIDEON KIPCHUMBA",
  "mpesaReceiptNumber": "NLMVUTJD9K34",
  "amount": 1500
}
```

### 3. Track / Verify by Code from Customer's SMS:
```http
GET https://<YOUR-BACKEND>/api/transactions/track/{mpesaReceiptNumber}
```
Returns:
```json
{
  "found": true,
  "data": {
    "customerName": "GIDEON KIPCHUMBA",
    "amount": 1500,
    "status": "COMPLETED",
    "mpesaReceiptNumber": "NLMVUTJD9K34"
  }
}
```

---

## 📂 Project Architecture

```
SLEEK/
├── render.yaml                       # Render Infrastructure-as-Code Blueprint
├── backend/                          # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── paymentController.ts  # STK, Dynamic QR, Track by Code, Webhooks
│   │   ├── routes/
│   │   │   └── paymentRoutes.ts      # Express routes
│   │   ├── services/
│   │   │   ├── daraja.ts             # Safaricom Daraja API client
│   │   │   └── store.ts              # Transaction store & customer name resolver
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   └── server.ts                 # Express server & CORS
│   ├── data/
│   │   └── store.json                # Local persistent transaction ledger
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── vercel.json                   # Vercel SPA routing configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header with status indicator & tab switcher
│   │   │   ├── STKPushPortal.tsx     # Lipa na M-Pesa Express & pulse animations
│   │   │   ├── DynamicQRCodePortal.tsx # Dynamic Safaricom QR generator
│   │   │   ├── TransactionTracker.tsx# Track by transaction code only
│   │   │   ├── TransactionHistory.tsx# Live ledger & auto-refresh
│   │   │   ├── SettingsPortal.tsx    # Production/Sandbox credentials & endpoints
│   │   │   ├── PaymentSuccessModal.tsx # Customer name celebration & POS receipt
│   │   │   └── POSSimulatorModal.tsx # Instant 1-click POS test scenarios
│   │   ├── services/
│   │   │   └── api.ts                # API client with VITE_API_BASE_URL support
│   │   └── utils/
│   │       └── audio.ts              # Web Audio chime generator
│   ├── package.json
│   └── vite.config.ts
│
├── start-all.bat                     # Windows 1-click launcher
├── start-all.ps1                     # PowerShell 1-click launcher
├── package.json                      # Monorepo scripts
└── README.md                         # Documentation & deployment guide
```
