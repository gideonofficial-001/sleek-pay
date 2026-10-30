import fs from 'fs';
import path from 'path';
import { Transaction, AppConfig } from '../types';

interface StoreData {
  config: AppConfig;
  transactions: Transaction[];
  customerPhoneDirectory: Record<string, string>;
}

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const DEFAULT_CONFIG: AppConfig = {
  environment: (process.env.ENVIRONMENT as any) || 'production',
  consumerKey: process.env.CONSUMER_KEY || '',
  consumerSecret: process.env.CONSUMER_SECRET || '',
  passkey: process.env.PASSKEY || '',
  shortcode: process.env.SHORTCODE || '',
  partyB: process.env.SHORTCODE || '',
  accountReference: process.env.ACCOUNT_REFERENCE || 'SLEEK-POS',
  businessType: (process.env.BUSINESS_TYPE as any) || 'BuyGoods',
  callbackUrl: process.env.CALLBACK_URL || 'https://sleek-pay.loca.lt/api/mpesa/callback/stk',
  initiatorName: process.env.INITIATOR_NAME || '',
  securityCredential: process.env.SECURITY_CREDENTIAL || ''
};

// Initial realistic customer names mapped to simulated/frequent phone numbers for POS quick resolution
const DEFAULT_DIRECTORY: Record<string, string> = {
  '254712345678': 'GIDEON KIPCHUMBA',
  '254722000000': 'FAITH WANJIKU',
  '254711223344': 'BRIAN OCHIENG',
  '254790112233': 'MARY WAITHERA',
  '254745678901': 'DENNIS MUTUA',
  '254756789123': 'ALICE CHEBET',
  '254701928374': 'KEVIN KARIUKI'
};

class Store {
  private data: StoreData;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): StoreData {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const loadedConfig = { ...DEFAULT_CONFIG, ...(parsed.config || {}) };
        if (!loadedConfig.consumerKey && process.env.CONSUMER_KEY) loadedConfig.consumerKey = process.env.CONSUMER_KEY;
        if (!loadedConfig.consumerSecret && process.env.CONSUMER_SECRET) loadedConfig.consumerSecret = process.env.CONSUMER_SECRET;
        if (!loadedConfig.passkey && process.env.PASSKEY) loadedConfig.passkey = process.env.PASSKEY;
        if (!loadedConfig.shortcode && process.env.SHORTCODE) {
          loadedConfig.shortcode = process.env.SHORTCODE;
          loadedConfig.partyB = process.env.SHORTCODE;
        }
        if (!loadedConfig.callbackUrl && process.env.CALLBACK_URL) loadedConfig.callbackUrl = process.env.CALLBACK_URL;

        return {
          config: loadedConfig,
          transactions: parsed.transactions || [],
          customerPhoneDirectory: { ...DEFAULT_DIRECTORY, ...(parsed.customerPhoneDirectory || {}) }
        };
      }
    } catch (err) {
      console.error('Error loading store data, resetting to defaults:', err);
    }

    const initial: StoreData = {
      config: DEFAULT_CONFIG,
      transactions: [],
      customerPhoneDirectory: DEFAULT_DIRECTORY
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: StoreData) {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write store file:', err);
    }
  }

  public getConfig(): AppConfig {
    return { ...this.data.config };
  }

  public updateConfig(updates: Partial<AppConfig>): AppConfig {
    this.data.config = { ...this.data.config, ...updates };
    this.saveData(this.data);
    return this.getConfig();
  }

  public getTransactions(params?: { search?: string; status?: string; limit?: number }): Transaction[] {
    let list = [...this.data.transactions];

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((t) => t.status.toUpperCase() === params.status?.toUpperCase());
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((t) => {
        return (
          t.phoneNumber.toLowerCase().includes(q) ||
          (t.mpesaReceiptNumber && t.mpesaReceiptNumber.toLowerCase().includes(q)) ||
          (t.customerName && t.customerName.toLowerCase().includes(q)) ||
          t.accountReference.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
        );
      });
    }

    // Sort descending by creation date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (params?.limit && params.limit > 0) {
      list = list.slice(0, params.limit);
    }

    return list;
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find((t) => t.id === id);
  }

  public getTransactionByCheckoutId(checkoutRequestId: string): Transaction | undefined {
    return this.data.transactions.find((t) => t.checkoutRequestId === checkoutRequestId);
  }

  public getTransactionByReceipt(receiptNumber: string): Transaction | undefined {
    const clean = receiptNumber.trim().toUpperCase();
    return this.data.transactions.find(
      (t) => t.mpesaReceiptNumber && t.mpesaReceiptNumber.trim().toUpperCase() === clean
    );
  }

  public saveTransaction(tx: Transaction): Transaction {
    const index = this.data.transactions.findIndex((t) => t.id === tx.id);
    if (index >= 0) {
      this.data.transactions[index] = { ...tx, updatedAt: new Date().toISOString() };
    } else {
      this.data.transactions.unshift(tx);
    }

    if (tx.phoneNumber && tx.customerName) {
      this.data.customerPhoneDirectory[tx.phoneNumber] = tx.customerName;
    }

    this.saveData(this.data);
    return tx;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const index = this.data.transactions.findIndex((t) => t.id === id);
    if (index < 0) return null;

    const current = this.data.transactions[index];
    const updated: Transaction = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updated.phoneNumber && updated.customerName) {
      this.data.customerPhoneDirectory[updated.phoneNumber] = updated.customerName;
    }

    this.data.transactions[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  public resolveCustomerName(phoneNumber: string, providedName?: string): string {
    if (providedName && providedName.trim()) {
      return providedName.trim().toUpperCase();
    }
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (this.data.customerPhoneDirectory[cleanPhone]) {
      return this.data.customerPhoneDirectory[cleanPhone];
    }
    // If not known, create a readable customer alias or format
    return `M-PESA CUSTOMER (${cleanPhone.slice(-4)})`;
  }

  public registerCustomer(phone: string, name: string) {
    this.data.customerPhoneDirectory[phone.replace(/[^0-9]/g, '')] = name.trim().toUpperCase();
    this.saveData(this.data);
  }
}

export const store = new Store();
