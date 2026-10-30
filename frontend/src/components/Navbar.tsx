import React from 'react';
import { Smartphone, QrCode, Search, History, Settings, ShieldCheck, Zap, Layers } from 'lucide-react';
import { AppConfig } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: AppConfig | null;
  onOpenSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onOpenSimulator
}) => {
  const isProduction = config?.environment === 'production';

  const navItems = [
    { id: 'stk', label: 'STK Express', icon: Smartphone },
    { id: 'qr', label: 'Dynamic QR', icon: QrCode },
    { id: 'track', label: 'Track by Code', icon: Search, badge: 'Direct' },
    { id: 'history', label: 'Ledger', icon: History },
    { id: 'settings', label: 'Daraja Config', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('stk')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-black tracking-wider">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
              <div className="absolute -inset-0.5 rounded-xl bg-emerald-400 opacity-20 blur-sm -z-10 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SLEEK TECH PAY
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  POS Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Safaricom Daraja Production Ready</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-slate-800/90 shadow-inner border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Environment Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isProduction ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-medium capitalize">
                {config ? `${config.environment}` : 'Connecting...'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            </div>

            {/* Simulation / Quick Test trigger */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm"
              title="Test payment animations, receipts & customer name resolution instantly"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>POS Simulator</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-md text-[10px] font-medium transition-all ${
                  isActive ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
