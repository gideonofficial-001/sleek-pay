import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { STKPushPortal } from './components/STKPushPortal';
import { DynamicQRCodePortal } from './components/DynamicQRCodePortal';
import { TransactionTracker } from './components/TransactionTracker';
import { TransactionHistory } from './components/TransactionHistory';
import { SettingsPortal } from './components/SettingsPortal';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { POSSimulatorModal } from './components/POSSimulatorModal';
import { api } from './services/api';
import { AppConfig, Transaction } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('stk');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Load config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const conf = await api.getConfig();
        setConfig(conf);
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handlePaymentSuccess = (tx: Transaction) => {
    setActiveReceiptTx(tx);
  };

  const handleViewReceipt = (tx: Transaction) => {
    setActiveReceiptTx(tx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stk' && (
          <div className="space-y-6">
            <STKPushPortal onPaymentSuccess={handlePaymentSuccess} />
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-6">
            <DynamicQRCodePortal onPaymentSuccess={handlePaymentSuccess} />
          </div>
        )}

        {activeTab === 'track' && (
          <div className="space-y-6">
            <TransactionTracker onViewReceipt={handleViewReceipt} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <TransactionHistory onViewReceipt={handleViewReceipt} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <SettingsPortal
              config={config}
              onConfigSaved={(updated) => setConfig(updated)}
            />
          </div>
        )}
      </main>

      {/* Celebratory Success Modal (Displays Customer's Name, M-Pesa Code, Receipt) */}
      <PaymentSuccessModal
        transaction={activeReceiptTx}
        onClose={() => setActiveReceiptTx(null)}
        onNewPayment={() => {
          setActiveReceiptTx(null);
          setActiveTab('stk');
        }}
      />

      {/* POS Simulation Modal */}
      <POSSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulatedSuccess={handlePaymentSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300">SLEEK TECH PAY</span>
            <span>•</span>
            <span>Safaricom Daraja Production Gateway</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('track')}
              className="hover:text-emerald-400 transition"
            >
              Verify Code
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="hover:text-emerald-400 transition"
            >
              Endpoints & Keys
            </button>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="text-emerald-400 font-semibold hover:underline"
            >
              Simulate POS Payment
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
