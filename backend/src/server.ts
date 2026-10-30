import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for troubleshooting
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Sleek Tech Pay API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main API routes
app.use('/api', paymentRoutes);

// Optional static serve for production build
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Sleek Tech Pay Backend running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Ready for M-Pesa STK, QR Code & Tracking`);
  console.log(`===============================================`);
});
