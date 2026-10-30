import React, { useState } from 'react';
import { X, Sparkles, User, DollarSign, Smartphone, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface POSSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulatedSuccess: (tx: Transaction) => void;
}

export const POSSimulatorModal: React.FC<POSSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSimulatedSuccess
}) => {
  const [customerName, setCustomerName] = useState('Gideon Kipchumba');
  const [amount, setAmount] = useState('1500');
  const [phone, setPhone] = useState('0712345678');
  const [accountRef, setAccountRef] = useState('POS-SIM-01');
  const [channel, setChannel] = useState<'STK' | 'QR' | 'C2B'>('STK');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { name: 'Gideon Kipchumba', phone: '0712345678', amount: '1500', ref: 'POS-ORDER-42' },
    { name: 'Faith Wanjiku', phone: '0722000000', amount: '3200', ref: 'POS-TABLE-09' },
    { name: 'Brian Ochieng', phone: '0711223344', amount: '850', ref: 'POS-BAR-01' },
    { name: 'Dennis Mutua', phone: '0745678901', amount: '4800', ref: 'POS-VIP-03' }
  ];

  const handleSimulate = async (custom?: { name: string; phone: string; amount: string; ref: string }) => {
    setLoading(true);
    const targetName = custom ? custom.name : customerName;
    const targetPhone = custom ? custom.phone : phone;
    const targetAmount = custom ? custom.amount : amount;
    const targetRef = custom ? custom.ref : accountRef;

    try {
      const res = await api.simulatePayment({
        customerName: targetName,
        phoneNumber: targetPhone,
        amount: Number(targetAmount),
        accountReference: targetRef,
        transactionType: channel
      });

      onClose();
      onSimulatedSuccess(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">POS Payment Simulator</h3>
                <p className="text-[11px] text-slate-400">Test name detection, receipt & animations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-4 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              1-Click Simulated Customers:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulate(p)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-700/80 text-left transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                    KES {p.amount}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Form */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Or Custom Payment Test:
            </span>

            <div>
              <label className="text-[11px] text-slate-300 font-medium block mb-1">Customer Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Gideon Kipchumba"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => handleSimulate()}
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <span>Simulating...</span>
              ) : (
                <>
                  <span>Trigger Instant POS Payment</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
