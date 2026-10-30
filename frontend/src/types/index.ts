export type EnvironmentMode = 'sandbox' | 'production';

export type TransactionType = 'STK' | 'QR' | 'C2B' | 'B2C' | 'MANUAL';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  customerName?: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  resultCode?: number;
  resultDesc?: string;
  rawCallback?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AppConfig {
  environment: EnvironmentMode;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortcode: string;
  partyB: string;
  accountReference: string;
  businessType: 'PayBill' | 'BuyGoods';
  callbackUrl: string;
  initiatorName?: string;
  securityCredential?: string;
  hasCredentials?: boolean;
}

export interface STKPushPayload {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
  customerName?: string;
}

export interface QRCodePayload {
  amount: number;
  accountReference?: string;
  cpi?: string;
  trxCode?: 'PB' | 'BG' | 'WA' | 'SM';
}

export interface QRCodeResponse {
  qrCodeData: string;
  qrDataUrl: string;
  accountReference: string;
  amount: number;
  transactionId: string;
}

export interface TrackResponse {
  found: boolean;
  message: string;
  data?: Transaction;
  source: 'DATABASE' | 'DARAJA_API' | 'VERIFIED_LOOKUP';
}
