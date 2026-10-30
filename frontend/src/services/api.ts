import {
  Transaction,
  AppConfig,
  STKPushPayload,
  QRCodePayload,
  QRCodeResponse,
  TrackResponse
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // STK Push
  initiateSTK: async (payload: STKPushPayload) => {
    const res = await fetch(`${BASE_URL}/pay/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'STK Push failed');
    return data;
  },

  // Check STK Status
  checkSTKStatus: async (checkoutRequestId: string): Promise<{ success: boolean; data: Transaction }> => {
    const res = await fetch(`${BASE_URL}/pay/status/${checkoutRequestId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Status check failed');
    return data;
  },

  // Dynamic QR Code
  generateQR: async (payload: QRCodePayload): Promise<{ success: boolean; data: QRCodeResponse }> => {
    const res = await fetch(`${BASE_URL}/pay/qrcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'QR generation failed');
    return data;
  },

  // Track by Transaction Code only
  trackByCode: async (code: string): Promise<TrackResponse> => {
    const res = await fetch(`${BASE_URL}/transactions/track/${encodeURIComponent(code)}`);
    const data = await res.json();
    return data;
  },

  // Transactions list
  getTransactions: async (params?: { search?: string; status?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
    return data.data as Transaction[];
  },

  // Single Transaction
  getTransactionById: async (id: string): Promise<Transaction> => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Transaction not found');
    return data.data;
  },

  // Simulate payment for POS testing
  simulatePayment: async (payload: {
    phoneNumber?: string;
    customerName?: string;
    amount?: number;
    accountReference?: string;
    transactionType?: string;
  }): Promise<{ success: boolean; data: Transaction }> => {
    const res = await fetch(`${BASE_URL}/simulate/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Simulation failed');
    return data;
  },

  // Config
  getConfig: async (): Promise<AppConfig> => {
    const res = await fetch(`${BASE_URL}/config`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch configuration');
    return data.data;
  },

  updateConfig: async (payload: Partial<AppConfig>) => {
    const res = await fetch(`${BASE_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save configuration');
    return data;
  },

  testConnection: async () => {
    const res = await fetch(`${BASE_URL}/config/test-connection`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Connection test failed');
    return data;
  }
};
