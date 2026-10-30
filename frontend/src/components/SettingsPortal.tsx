import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Key, Globe, CheckCircle2, AlertCircle, RefreshCw, Save, ExternalLink, Link2, Server, Lock } from 'lucide-react';
import { api } from '../services/api';
import { AppConfig } from '../types';

interface SettingsPortalProps {
  config: AppConfig | null;
  onConfigSaved: (config: AppConfig) => void;
}

export const SettingsPortal: React.FC<SettingsPortalProps> = ({ config, onConfigSaved }) => {
  const [formData, setFormData] = useState<Partial<AppConfig>>({
    environment: 'production',
    consumerKey: '',
    consumerSecret: '',
    passkey: '',
    shortcode: '',
    partyB: '',
    accountReference: 'SLEEK-POS',
    businessType: 'BuyGoods',
    callbackUrl: 'https://sleek-pay.loca.lt/api/mpesa/callback/stk',
    initiatorName: '',
    securityCredential: ''
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; snippet?: string } | null>(null);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await api.updateConfig(formData);
      onConfigSaved(res.data);
      setSaveMessage({ type: 'success', text: 'Daraja configuration successfully saved!' });
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.testConnection();
      setTestResult({
        success: true,
        message: res.message,
        snippet: res.tokenSnippet
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed. Check your Consumer Key and Secret.'
      });
    } finally {
      setTesting(false);
    }
  };

  // Safaricom Production URLs provided by Gideon
  const safaricomUrls = [
    { name: 'OAuth Token', url: 'https://api.safaricom.co.ke/oauth/v1/generate' },
    { name: 'STK Push (Lipa na Mpesa)', url: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest' },
    { name: 'STK Query', url: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query' },
    { name: 'Dynamic QRCode', url: 'https://api.safaricom.co.ke/mpesa/qrcode/v1/generate' },
    { name: 'Transaction Status', url: 'https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query' },
    { name: 'Account Balance', url: 'https://api.safaricom.co.ke/mpesa/accountbalance/v1/query' },
    { name: 'Reversal', url: 'https://api.safaricom.co.ke/mpesa/reversal/v1/request' },
    { name: 'C2B Register URL', url: 'https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl' },
    { name: 'B2C Payment', url: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Safaricom Daraja API Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Manage your Safaricom credentials, switch between Sandbox and Live Production, and inspect registered gateway endpoints.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Environment Selector */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-white block">Environment Mode</span>
              <p className="text-xs text-slate-400">
                Production connects to live Safaricom network (<code className="text-emerald-400">api.safaricom.co.ke</code>).
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, environment: 'production' })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  formData.environment === 'production'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                <span>Production (Live)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, environment: 'sandbox' })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  formData.environment === 'sandbox'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Sandbox (Test)</span>
              </button>
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Consumer Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.consumerKey || ''}
                  onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                  placeholder="Paste Consumer Key"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Consumer Secret
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.consumerSecret || ''}
                  onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                  placeholder="Paste Consumer Secret"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Lipa Na Mpesa Online Passkey
              </label>
              <input
                type="password"
                value={formData.passkey || ''}
                onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                placeholder="Paste Passkey"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Business Short Code / Till Number
              </label>
              <input
                type="text"
                value={formData.shortcode || ''}
                onChange={(e) => setFormData({ ...formData, shortcode: e.target.value, partyB: e.target.value })}
                placeholder="e.g. 174379 or Till / Store number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Business Type
              </label>
              <select
                value={formData.businessType || 'BuyGoods'}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="BuyGoods">Buy Goods (Till Number)</option>
                <option value="PayBill">PayBill (PayBill + Account Number)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Default Account Reference
              </label>
              <input
                type="text"
                value={formData.accountReference || ''}
                onChange={(e) => setFormData({ ...formData, accountReference: e.target.value })}
                placeholder="e.g. SLEEK-POS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition uppercase"
              />
            </div>
          </div>

          {/* Webhook Callback URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Live Webhook Callback URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.callbackUrl || ''}
                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                placeholder="https://your-public-domain.com/api/mpesa/callback/stk"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition"
              />
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Safaricom will POST payment confirmation metadata directly to this endpoint.
            </p>
          </div>

          {/* Save Status Banner */}
          {saveMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{saveMessage.text}</span>
            </div>
          )}

          {/* Test Result Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start space-x-2.5 animate-fadeIn ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.message}</p>
                {testResult.snippet && (
                  <p className="font-mono text-[10px] text-slate-400 mt-1">OAuth Token: {testResult.snippet}</p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>Test Connection to Daraja</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Production URLs Reference Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Safaricom Live Production Endpoints</h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            api.safaricom.co.ke
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          {safaricomUrls.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <span className="font-semibold text-slate-300 font-sans text-[11px] mb-1">{item.name}</span>
              <span className="text-[10px] text-slate-500 truncate" title={item.url}>{item.url}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
