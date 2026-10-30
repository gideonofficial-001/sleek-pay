import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, DollarSign, Tag, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Radio, User } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface STKPushPortalProps {
  onPaymentSuccess: (tx: Transaction) => void;
}

export const STKPushPortal: React.FC<STKPushPortalProps> = ({ onPaymentSuccess }) => {
  const [phone, setPhone] = useState('0712345678');
  const [amount, setAmount] = useState('500');
  const [accountRef, setAccountRef] = useState('POS-ORDER-101');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingTx, setPendingTx] = useState<{ checkoutRequestId: string; transactionId: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Quick amount chips
  const quickAmounts = ['100', '250', '500', '1000', '2500', '5000'];

  // Handle STK Push Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!phone || !amount || Number(amount) <= 0) {
      setErrorMessage('Please enter a valid phone number and payment amount.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.initiateSTK({
        phoneNumber: phone,
        amount: Number(amount),
        accountReference: accountRef || 'SLEEK-POS',
        transactionDesc: 'Sleek Tech Payment',
        customerName: customerName.trim() || undefined
      });

      if (res.data?.CheckoutRequestID) {
        setPendingTx({
          checkoutRequestId: res.data.CheckoutRequestID,
          transactionId: res.data.transactionId
        });
        setStatusMessage('STK Push sent! Awaiting customer PIN on phone...');
        startPolling(res.data.CheckoutRequestID);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate STK Push.');
    } finally {
      setSubmitting(false);
    }
  };

  // Poll for completion
  const startPolling = (checkoutRequestId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.checkSTKStatus(checkoutRequestId);
        const tx = res.data;

        if (tx.status === 'COMPLETED') {
          clearInterval(pollIntervalRef.current!);
          setPendingTx(null);
          setStatusMessage(null);
          onPaymentSuccess(tx);
        } else if (tx.status === 'CANCELLED') {
          clearInterval(pollIntervalRef.current!);
          setPendingTx(null);
          setErrorMessage('Payment cancelled by customer on their phone.');
        } else if (tx.status === 'FAILED') {
          clearInterval(pollIntervalRef.current!);
          setPendingTx(null);
          setErrorMessage(tx.resultDesc || 'Payment failed or timed out.');
        }
      } catch (err) {
        // Continue polling until timeout
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleCancelPending = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setPendingTx(null);
    setStatusMessage(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <span>Lipa na M-PESA Online (STK Express)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Sends an instant payment prompt directly to the customer's Safaricom phone.
        </p>
      </div>

      {/* Main Terminal Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Pending Awaiting PIN State */}
        {pendingTx ? (
          <div className="py-8 flex flex-col items-center text-center space-y-6 animate-fadeIn">
            {/* Pulsing Radar Visual */}
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-radar pointer-events-none"></div>
              <div className="absolute inset-3 rounded-full bg-emerald-500/30 animate-pulse pointer-events-none"></div>
              <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Prompt Sent to {phone}</span>
              </span>
              <h3 className="text-xl font-bold text-white">Enter M-PESA PIN</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer has received the STK prompt on their handset for <strong className="text-emerald-400">KES {amount}</strong>. Listening for confirmation...
              </p>
            </div>

            {/* Cancel / Back Button */}
            <button
              onClick={handleCancelPending}
              className="text-xs text-slate-400 hover:text-rose-400 transition underline underline-offset-4"
            >
              Cancel this request
            </button>
          </div>
        ) : (
          /* Payment Initiation Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Payment Amount (KES)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-extrabold text-2xl tracking-tight placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <span className="absolute left-3.5 top-4 text-xs font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  KES
                </span>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      amount === amt
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Customer Safaricom Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX or 01XXXXXXXX"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-base placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <Smartphone className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Accepts 07XX..., 01XX..., or 2547XX...</p>
            </div>

            {/* Account Reference / POS Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Account / Order Ref
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accountRef}
                    onChange={(e) => setAccountRef(e.target.value)}
                    placeholder="e.g. POS-ORDER-1"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all uppercase"
                  />
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Customer Name (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Gideon Kipchumba"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all capitalize"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide transition-all duration-200 active:scale-98 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Connecting to Safaricom Daraja...</span>
                </>
              ) : (
                <>
                  <span>Send STK Push Prompt</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
