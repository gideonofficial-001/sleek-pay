import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle2, Clock, AlertCircle, XCircle, Printer, Eye, Filter, User, Tag, ArrowUpRight, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  onViewReceipt: (tx: Transaction) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onViewReceipt }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Auto refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTransactions();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 animate-spin" />
            <span>PENDING</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/50 text-slate-400 border border-slate-600/30">
            <XCircle className="w-3 h-3" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>FAILED</span>
          </span>
        );
    }
  };

  // Calculate totals
  const totalCompletedAmount = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const completedCount = transactions.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>Total Settled Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            KES {totalCompletedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">{completedCount} successful transactions</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
            <span>Total Records</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{transactions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">All channels (STK, QR, C2B)</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Live Sync Engine</span>
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-white">Auto-Refresh (5s)</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                autoRefresh ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {autoRefresh ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, customer, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={fetchTransactions}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Refresh transactions list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">M-Pesa Code</th>
                <th className="py-3.5 px-4 font-semibold">Customer Full Name</th>
                <th className="py-3.5 px-4 font-semibold">Phone</th>
                <th className="py-3.5 px-4 font-semibold">Amount (KES)</th>
                <th className="py-3.5 px-4 font-semibold">Account Ref</th>
                <th className="py-3.5 px-4 font-semibold">Channel</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                    onClick={() => onViewReceipt(tx)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {tx.mpesaReceiptNumber || (
                        <span className="text-slate-500 italic">Processing...</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">
                        {tx.customerName || 'M-PESA CUSTOMER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{tx.phoneNumber}</td>
                    <td className="py-3 px-4 font-black text-emerald-400">
                      KES {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {tx.accountReference}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReceipt(tx);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition"
                        title="View receipt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm">No transactions found</p>
                    <p className="text-xs text-slate-600 mt-1">Initiate a payment or run a test from the POS Simulator.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
