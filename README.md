# ⚡ Sleek Tech Pay

> Modern, production-ready Safaricom M-PESA payment platform and Point-of-Sale (POS) integration gateway.

Built with **TypeScript**, **React 19**, **Vite**, **Tailwind CSS**, and **Node.js Express**.

---

## 🌟 Key Capabilities

1. **Lipa na M-PESA Online (STK Express Push)**
   - Instant payment prompt triggered to customer's handset.
   - Real-time polling with animated radar pulse awaiting customer PIN.
   - Immediate status resolution with **Customer Name**, **M-Pesa Receipt Code**, and amount.
2. **Dynamic M-PESA QR Code Generator**
   - Calls Safaricom Daraja Dynamic QR API (`/mpesa/qrcode/v1/generate`).
   - Generates high-contrast scannable QR codes for Buy Goods (Till) and PayBill.
   - Real-time expiry countdown timer and live confirmation watcher.
3. **Customer Name Display on Payment**
   - Extracts and displays customer full name (e.g. `GIDEON KIPCHUMBA`, `FAITH WANJIKU`) directly upon settlement.
   - Celebratory UI celebration with sound chime and confetti.
   - Thermal POS Receipt preview with 1-click standard 80mm printing.
4. **Track by Transaction Code Only**
   - Enter only the M-PESA Confirmation Receipt (e.g., `NL82XP91MK`, `SFK92...`).
   - Queries local ledger or Safaricom Daraja Transaction Status API (`/mpesa/transactionstatus/v1/query`).
   - Instantly reveals customer name, exact amount, date & time, and verified seal.
5. **Live Transactions Ledger**
   - Searchable, filterable real-time transaction history.
   - Auto-refreshes every 5 seconds.
   - One-click receipt viewer.
6. **Built-in POS Payment Simulator**
   - Allows instant testing and verification of the whole checkout workflow, customer name resolution, and receipt printing without waiting for Safaricom live approval.

---

## 🚀 Quick Start

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
From the root folder `C:\Users\User\SLEEK`:

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

## ⚙️ Configuring Live Safaricom Daraja Production Credentials

In the web interface, navigate to the **"Daraja Config"** tab, or edit `backend/data/store.json`:

1. Select **"Production (Live)"** mode.
2. Enter your credentials obtained from Safaricom:
   - **Consumer Key**
   - **Consumer Secret**
   - **Passkey** (for Lipa na Mpesa Online)
   - **Business Short Code** (Your PayBill or Till number)
   - **Business Type**: Select `Buy Goods (Till Number)` or `PayBill`
   - **Webhook Callback URL**: Your public HTTPS webhook URL (e.g., via ngrok: `https://your-domain.ngrok-free.app/api/mpesa/callback/stk`)
3. Click **"Save Configuration"** and hit **"Test Connection to Daraja"**.

### Production URLs Reference
All official Safaricom Production endpoints provided are mapped:
- **OAuth2 Token**: `https://api.safaricom.co.ke/oauth/v1/generate`
- **STK Push (Express)**: `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
- **STK Push Query**: `https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query`
- **Dynamic QRCode**: `https://api.safaricom.co.ke/mpesa/qrcode/v1/generate`
- **Transaction Status**: `https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query`
- **Account Balance**: `https://api.safaricom.co.ke/mpesa/accountbalance/v1/query`
- **Reversal**: `https://api.safaricom.co.ke/mpesa/reversal/v1/request`
- **C2B Register URL**: `https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl`
- **B2C Payment**: `https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest`

---

## 🔌 Integrating into your Point of Sale (POS)

When you are ready to integrate **Sleek Tech Pay** with your POS system, you can connect directly via the REST API:

### 1. Trigger STK Push from POS:
```http
POST http://localhost:5000/api/pay/stk-push
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
    "CheckoutRequestID": "ws_CO_...",
    "transactionId": "..."
  }
}
```

### 2. Poll POS Payment Status:
```http
GET http://localhost:5000/api/pay/status/{CheckoutRequestID}
```
When settled, it returns:
```json
{
  "status": "COMPLETED",
  "customerName": "GIDEON KIPCHUMBA",
  "mpesaReceiptNumber": "NL98XYZ...",
  "amount": 1500
}
```

### 3. Track / Verify by M-Pesa Code from Customer's Phone SMS:
```http
GET http://localhost:5000/api/transactions/track/NL98XYZ
```
Returns:
```json
{
  "found": true,
  "data": {
    "customerName": "GIDEON KIPCHUMBA",
    "amount": 1500,
    "status": "COMPLETED"
  }
}
```

---

## 📂 Project Architecture

```
SLEEK/
├── backend/                       # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── paymentController.ts # STK, QR, Track by Code, Webhooks
│   │   ├── routes/
│   │   │   └── paymentRoutes.ts     # Express routes
│   │   ├── services/
│   │   │   ├── daraja.ts            # Safaricom Daraja API client
│   │   │   └── store.ts             # ACID JSON transaction store & name resolver
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   └── server.ts                # Express server setup & static serving
│   ├── data/
│   │   └── store.json               # Persistent transaction records & config
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Brand header, status indicator & tab switcher
│   │   │   ├── STKPushPortal.tsx    # Lipa na M-Pesa Express & pulse animations
│   │   │   ├── DynamicQRCodePortal.tsx # Dynamic Safaricom QR generator
│   │   │   ├── TransactionTracker.tsx # Track by transaction code only
│   │   │   ├── TransactionHistory.tsx # Live ledger & auto-refresh
│   │   │   ├── SettingsPortal.tsx   # Production/Sandbox credentials & endpoints
│   │   │   ├── PaymentSuccessModal.tsx # Customer name celebration & POS receipt
│   │   │   └── POSSimulatorModal.tsx # Instant 1-click POS test scenarios
│   │   ├── services/
│   │   │   └── api.ts               # Typed frontend API client
│   │   ├── utils/
│   │   │   └── audio.ts             # Web Audio chime generator
│   │   ├── types/
│   │   │   └── index.ts             # Frontend TypeScript types
│   │   ├── App.tsx                  # Main application orchestrator
│   │   └── index.css                # Dark modern sleek tech aesthetic
│   ├── package.json
│   └── vite.config.ts
│
├── start-all.bat                  # Windows 1-click launcher
├── start-all.ps1                  # PowerShell 1-click launcher
├── package.json                   # Root monorepo scripts
└── README.md
```
