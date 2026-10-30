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
}

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
  customerName?: string;
}

export interface QRCodeRequest {
  amount: number;
  accountReference?: string;
  cpi?: string; // Credit Party Identifier (Till or Paybill)
  trxCode?: 'PB' | 'BG' | 'WA' | 'SM'; // PayBill, BuyGoods, Withdraw, SendMoney
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
  transactionId: string;
}

export interface STKCallbackItem {
  Name: string;
  Value?: string | number;
}

export interface STKCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: STKCallbackItem[];
      };
    };
  };
}

export interface C2BConfirmationPayload {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber?: string;
  OrgAccountBalance?: string;
  ThirdPartyTransID?: string;
  MSISDN: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
}
