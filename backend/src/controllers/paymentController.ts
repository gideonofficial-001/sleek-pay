import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { darajaService } from '../services/daraja';
import { store } from '../services/store';

export const handleSTKPush = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc, customerName } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required.'
      });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    const result = await darajaService.initiateSTKPush({
      phoneNumber,
      amount: Number(amount),
      accountReference,
      transactionDesc,
      customerName
    });

    return res.status(200).json({
      success: true,
      message: 'STK push initiated successfully.',
      data: result
    });
  } catch (error: any) {
    console.error('STK Push Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate STK push.'
    });
  }
};

export const handleSTKStatus = async (req: Request, res: Response) => {
  try {
    const checkoutRequestId = String(req.params.checkoutRequestId || '');
    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, message: 'CheckoutRequestID is required.' });
    }

    const tx = await darajaService.querySTKStatus(checkoutRequestId);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({
      success: true,
      data: tx
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error checking transaction status.'
    });
  }
};

export const handleGenerateQR = async (req: Request, res: Response) => {
  try {
    const { amount, accountReference, cpi, trxCode } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount is required for dynamic QR generation.'
      });
    }

    const qrResult = await darajaService.generateDynamicQRCode({
      amount: Number(amount),
      accountReference,
      cpi,
      trxCode
    });

    return res.status(200).json({
      success: true,
      message: 'Dynamic QR Code generated successfully.',
      data: qrResult
    });
  } catch (error: any) {
    console.error('QR Generator Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Dynamic QR code.'
    });
  }
};

export const handleTrackByCode = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Transaction code is required.'
      });
    }

    const result = await darajaService.trackByTransactionCode(code);
    return res.status(result.found ? 200 : 404).json({
      success: result.found,
      message: result.message,
      data: result.transaction,
      source: result.source
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to track transaction code.'
    });
  }
};

export const handleGetTransactions = (req: Request, res: Response) => {
  try {
    const { search, status, limit } = req.query;
    const transactions = store.getTransactions({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      limit: limit ? Number(limit) : 50
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve transactions.'
    });
  }
};

export const handleGetTransactionById = (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '');
    const tx = store.getTransactionById(id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    return res.status(200).json({ success: true, data: tx });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleSimulatePayment = (req: Request, res: Response) => {
  try {
    const {
      phoneNumber = '254712345678',
      customerName = 'GIDEON KIPCHUMBA',
      amount = 1500,
      accountReference = 'SLEEK-TEST',
      transactionType = 'STK',
      status = 'COMPLETED'
    } = req.body;

    const receipt = `SFK${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 89 + 10)}`;
    const tx = store.saveTransaction({
      id: randomUUID(),
      phoneNumber: darajaService.formatPhoneNumber(phoneNumber),
      customerName: customerName.trim().toUpperCase(),
      amount: Number(amount),
      mpesaReceiptNumber: receipt,
      accountReference: accountReference || 'SLEEK-POS',
      transactionDesc: 'Simulated POS Verification',
      transactionType: transactionType || 'STK',
      status: status || 'COMPLETED',
      resultCode: 0,
      resultDesc: 'The service request has been accepted successfully.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Simulated payment transaction created successfully.',
      data: tx
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetConfig = (req: Request, res: Response) => {
  try {
    const config = store.getConfig();
    // Mask sensitive keys for security in UI
    const masked = {
      ...config,
      consumerKey: config.consumerKey ? `${config.consumerKey.slice(0, 4)}••••••••${config.consumerKey.slice(-4)}` : '',
      consumerSecret: config.consumerSecret ? `••••••••••••••••` : '',
      passkey: config.passkey ? `••••••••••••••••` : '',
      securityCredential: config.securityCredential ? `••••••••••••••••` : '',
      hasCredentials: Boolean(config.consumerKey && config.consumerSecret)
    };

    return res.status(200).json({ success: true, data: masked });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleUpdateConfig = (req: Request, res: Response) => {
  try {
    const updates = req.body;
    // Don't overwrite with masked placeholders
    const cleanUpdates: any = { ...updates };
    if (cleanUpdates.consumerKey && cleanUpdates.consumerKey.includes('••••')) {
      delete cleanUpdates.consumerKey;
    }
    if (cleanUpdates.consumerSecret && cleanUpdates.consumerSecret.includes('••••')) {
      delete cleanUpdates.consumerSecret;
    }
    if (cleanUpdates.passkey && cleanUpdates.passkey.includes('••••')) {
      delete cleanUpdates.passkey;
    }
    if (cleanUpdates.securityCredential && cleanUpdates.securityCredential.includes('••••')) {
      delete cleanUpdates.securityCredential;
    }

    const updated = store.updateConfig(cleanUpdates);
    return res.status(200).json({
      success: true,
      message: 'Configuration saved successfully.',
      data: {
        environment: updated.environment,
        shortcode: updated.shortcode,
        partyB: updated.partyB,
        accountReference: updated.accountReference,
        businessType: updated.businessType,
        callbackUrl: updated.callbackUrl,
        hasCredentials: Boolean(updated.consumerKey && updated.consumerSecret)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleTestConnection = async (req: Request, res: Response) => {
  try {
    const token = await darajaService.getAccessToken();
    return res.status(200).json({
      success: true,
      message: 'Connection to Safaricom Daraja API verified successfully!',
      environment: store.getConfig().environment,
      tokenSnippet: `${token.slice(0, 6)}...${token.slice(-6)}`
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to authenticate with Safaricom.'
    });
  }
};

export const handleSTKCallback = (req: Request, res: Response) => {
  try {
    console.log('[M-PESA Webhook] STK Callback received:', JSON.stringify(req.body));
    darajaService.handleSTKCallback(req.body);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback processed successfully' });
  } catch (err: any) {
    console.error('Error handling STK callback:', err);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback acknowledged' });
  }
};

export const handleC2BConfirmation = (req: Request, res: Response) => {
  try {
    console.log('[M-PESA Webhook] C2B Confirmation received:', JSON.stringify(req.body));
    const tx = darajaService.handleC2BConfirmation(req.body);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Confirmation accepted' });
  } catch (err: any) {
    console.error('Error handling C2B confirmation:', err);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Confirmation acknowledged' });
  }
};

export const handleC2BValidation = (req: Request, res: Response) => {
  console.log('[M-PESA Webhook] C2B Validation check:', JSON.stringify(req.body));
  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: 'Accepted'
  });
};
