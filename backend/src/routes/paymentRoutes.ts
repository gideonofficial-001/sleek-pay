import { Router } from 'express';
import {
  handleSTKPush,
  handleSTKStatus,
  handleGenerateQR,
  handleTrackByCode,
  handleGetTransactions,
  handleGetTransactionById,
  handleSimulatePayment,
  handleGetConfig,
  handleUpdateConfig,
  handleTestConnection,
  handleSTKCallback,
  handleC2BConfirmation,
  handleC2BValidation
} from '../controllers/paymentController';

const router = Router();

// Payment operations
router.post('/pay/stk-push', handleSTKPush);
router.get('/pay/status/:checkoutRequestId', handleSTKStatus);
router.post('/pay/qrcode', handleGenerateQR);

// Transaction tracking & queries
router.get('/transactions/track/:code', handleTrackByCode);
router.get('/transactions', handleGetTransactions);
router.get('/transactions/:id', handleGetTransactionById);

// Testing & Simulation for POS integration
router.post('/simulate/payment', handleSimulatePayment);

// Configuration & Safaricom connection
router.get('/config', handleGetConfig);
router.post('/config', handleUpdateConfig);
router.post('/config/test-connection', handleTestConnection);

// Safaricom Daraja Webhook Callbacks
router.post('/mpesa/callback/stk', handleSTKCallback);
router.post('/mpesa/callback/c2b-confirmation', handleC2BConfirmation);
router.post('/mpesa/callback/c2b-validation', handleC2BValidation);

export default router;
