import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle2, Download, Printer, Zap, Sparkles, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { QRCodeResponse, Transaction } from '../types';

interface DynamicQRCodePortalProps {
  onPaymentSuccess: (tx: Transaction) => void;
}

export const DynamicQRCodePortal: React.FC<DynamicQRCodePortalProps> = ({ onPaymentSuccess }) => {
  const [amount, setAmount] = useState('750');
  const [accountRef, setAccountRef] = useState('POS-TABLE-04');
  const [trxCode, setTrxCode] = useState<'BG' | 'PB'>('BG');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes expiration
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.generateQR({
        amount: Number(amount),
        accountReference: accountRef || 'SLEEK-QR',
        trxCode
      });
      setQrData(res.data);
      setTimeLeft(180);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate dynamic QR code.');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!qrData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData]);

  const handleDownload = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.qrDataUrl;
    link.download = `mpesa-qr-${qrData.accountReference}.png`;
    link.click();
  };

  // Helper to simulate instant payment for testing
  const handleSimulateQRScan = async () => {
    if (!qrData) return;
    try {
      const res = await api.simulatePayment({
        amount: qrData.amount,
        accountReference: qrData.accountReference,
        customerName: 'FAITH WANJIKU',
        phoneNumber: '254722000000',
        transactionType: 'QR'
      });
      onPaymentSuccess(res.data);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>Dynamic M-PESA QR Code Generator</span>
        </h2>
        <p className="text-xs text-slate-400">
          Generates a certified dynamic QR code encoded with transaction amount and reference.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (Left side / top) */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Amount to Charge (KES)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-extrabold text-xl tracking-tight focus:outline-none focus:border-emerald-500 transition-all"
                />
                <span className="absolute left-3 top-3.5 text-xs font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  KES
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Account / Invoice Reference
              </label>
              <input
                type="text"
                value={accountRef}
                onChange={(e) => setAccountRef(e.target.value)}
                placeholder="e.g. POS-TABLE-04"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                M-Pesa Business Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTrxCode('BG')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                    trxCode === 'BG'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Buy Goods (Till)
                </button>
                <button
                  type="button"
                  onClick={() => setTrxCode('PB')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                    trxCode === 'PB'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  PayBill
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generating QR...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 text-slate-950" />
                  <span>Generate Dynamic QR</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* QR Display Screen (Right side) */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center text-center justify-center min-h-[360px]">
          {qrData ? (
            <div className="space-y-4 animate-fadeIn w-full flex flex-col items-center">
              {/* Dynamic QR image frame */}
              <div className="relative p-3 bg-white rounded-2xl shadow-2xl border-4 border-emerald-500/40">
                <img
                  src={qrData.qrDataUrl}
                  alt="Dynamic M-PESA QR"
                  className="w-48 h-48 object-contain rounded-lg"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] font-bold text-white tracking-widest uppercase">
                  M-PESA
                </div>
              </div>

              {/* Amount badge */}
              <div className="space-y-1">
                <div className="text-xl font-black text-emerald-400">
                  KES {qrData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Ref: {qrData.accountReference}
                </div>
              </div>

              {/* Countdown badge */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Download QR image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR</span>
                </button>

                <button
                  onClick={handleSimulateQRScan}
                  className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                  title="Simulate customer scanning with phone and completing payment"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Customer Scan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center space-y-3 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                <QrCode className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                Enter an amount and click "Generate Dynamic QR" to display an instant M-Pesa QR code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
