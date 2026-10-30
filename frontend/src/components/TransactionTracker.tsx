import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, Clock, Copy, User, Phone, DollarSign, Calendar, ExternalLink, ArrowRight, Printer } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface TransactionTrackerProps {
  onViewReceipt?: (tx: Transaction) => void;
}

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({ onViewReceipt }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    transaction?: Transaction;
    message: string;
    source?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await api.trackByCode(code.trim());
      setResult({
        found: res.found,
        transaction: res.data,
        message: res.message,
        source: res.source
      });
    } catch (err: any) {
      setResult({
        found: false,
        message: err.message || 'Error occurred while tracking transaction code.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick preset test codes
  const sampleCodes = ['SFK1049281', 'NL82XP91MK', 'QA4992K810', 'RBF7819203'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Safaricom M-Pesa Transaction Verification</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Track by Transaction Code
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Enter only the M-PESA confirmation code (from customer SMS or receipt) to instantly verify customer name, amount, and payment status.
        </p>
      </div>

      {/* Glow Search Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <form onSubmit={handleTrack} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            M-PESA Confirmation Code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. NL92XYZ890 or RBF4819..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-base tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase"
                disabled={loading}
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-4" />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="py-3.5 px-7 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Track Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick preset hints */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
            <span className="text-slate-500">Try sample code:</span>
            {sampleCodes.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCode(c);
                }}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition"
              >
                {c}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Result Display Card */}
      {result && (
        <div className="animate-fadeIn">
          {result.found && result.transaction ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
              {/* Badge & Source */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-extrabold text-white">Valid & Verified Transaction</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {result.transaction.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Source: {result.source || 'Safaricom Daraja Network'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 font-mono text-sm bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200">
                  <span>{result.transaction.mpesaReceiptNumber || code}</span>
                  <button
                    onClick={() => handleCopy(result.transaction?.mpesaReceiptNumber || code)}
                    className="p-1 hover:text-emerald-400 transition"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-400">Copied!</span>}
                </div>
              </div>

              {/* Main Customer Name Display */}
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
                <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Payer / Customer Full Name
                </div>
                <div className="text-2xl font-black text-white tracking-wide text-emerald-300">
                  {result.transaction.customerName || 'M-PESA CUSTOMER'}
                </div>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number: {result.transaction.phoneNumber}</span>
                </div>
              </div>

              {/* Grid details */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Amount Paid</span>
                  <span className="text-xl font-black text-emerald-400">
                    KES {result.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Account / Order Ref</span>
                  <span className="text-base font-semibold text-white">
                    {result.transaction.accountReference}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Date & Time</span>
                  <span className="text-sm font-medium text-slate-300">
                    {new Date(result.transaction.createdAt).toLocaleString('en-KE', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {onViewReceipt && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => onViewReceipt(result.transaction!)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>View & Print Thermal POS Receipt</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/30 shadow-2xl flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Transaction Code Not Found</h4>
                <p className="text-sm text-slate-400">{result.message}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Tip: Confirm that the code matches the Safaricom SMS receipt exactly (typically 10 alphanumeric characters, e.g. RBF89XP42Q).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
