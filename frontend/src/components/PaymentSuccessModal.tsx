import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Printer, X, ShieldCheck, ArrowRight, Copy, Share2, Sparkles, User, Hash, Clock, Phone } from 'lucide-react';
import { Transaction } from '../types';
import { playSuccessChime } from '../utils/audio';

interface PaymentSuccessModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onNewPayment: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  transaction,
  onClose,
  onNewPayment
}) => {
  useEffect(() => {
    if (transaction && transaction.status === 'COMPLETED') {
      // Play fintech success chime
      playSuccessChime();

      // Fire celebratory confetti explosion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#06b6d4', '#3b82f6', '#f59e0b']
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [transaction]);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const copyReceiptCode = () => {
    if (transaction.mpesaReceiptNumber) {
      navigator.clipboard.writeText(transaction.mpesaReceiptNumber);
    }
  };

  const formattedDate = new Date(transaction.createdAt).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Glow Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Success Animated Icon */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              </div>
              <div className="absolute -inset-1 rounded-full bg-emerald-400 opacity-20 blur-md -z-10 animate-pulse"></div>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>M-PESA VERIFIED PAYMENT</span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">Payment Received!</h3>
            <p className="text-sm text-slate-400 mt-1">Transaction settled and verified instantly.</p>
          </div>

          {/* Customer Highlight Card (Primary User Requirement) */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-inner">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-500/10">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Customer Name
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/80 px-2 py-0.5 rounded">
                Verified Payer
              </span>
            </div>
            
            <div className="text-xl font-extrabold text-white tracking-wide flex items-center justify-between">
              <span className="text-emerald-300">
                {transaction.customerName || 'M-PESA REGISTERED CUSTOMER'}
              </span>
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <div className="mt-2 flex items-center text-xs text-slate-300 space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{transaction.phoneNumber}</span>
            </div>
          </div>

          {/* Receipt Breakdown Details */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                M-Pesa Receipt Code:
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {transaction.mpesaReceiptNumber || 'PENDING'}
                </span>
                {transaction.mpesaReceiptNumber && (
                  <button
                    onClick={copyReceiptCode}
                    className="p-1 hover:text-emerald-400 transition"
                    title="Copy receipt number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Amount Paid:</span>
              <span className="font-black text-emerald-400 text-base">
                KES {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Account / Order Ref:</span>
              <span className="font-medium text-slate-200">{transaction.accountReference}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Timestamp:
              </span>
              <span className="text-slate-300">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Payment Channel:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                {transaction.transactionType} EXPRESS
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95 shadow-sm"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print POS Receipt</span>
            </button>

            <button
              onClick={onNewPayment}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <span>Next Payment</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>

        {/* Hidden Printable Thermal POS Receipt for window.print() */}
        <div id="printable-receipt" className="hidden">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>SLEEK TECH PAY</h2>
            <p style={{ fontSize: '12px', margin: '2px 0' }}>POINT OF SALE RECEIPT</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>SAFARICOM M-PESA CONFIRMATION</p>
            <p style={{ margin: '5px 0' }}>--------------------------------</p>
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            <p><strong>Receipt:</strong> {transaction.mpesaReceiptNumber}</p>
            <p><strong>Customer:</strong> {transaction.customerName}</p>
            <p><strong>Phone:</strong> {transaction.phoneNumber}</p>
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Ref / Order:</strong> {transaction.accountReference}</p>
            <p style={{ margin: '5px 0' }}>--------------------------------</p>
            <p style={{ fontSize: '15px' }}><strong>TOTAL PAID: KES {transaction.amount.toFixed(2)}</strong></p>
            <p style={{ margin: '5px 0' }}>--------------------------------</p>
            <p style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
              Verified via Safaricom Daraja API<br />
              Thank you for your business!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
