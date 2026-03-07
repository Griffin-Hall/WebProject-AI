import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Check, AlertCircle, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIConfig, DEFAULT_MODELS, PROVIDER_LABELS, type AIConfig } from '@/hooks/useAIConfig';

const PROVIDERS: AIConfig['provider'][] = ['openai', 'anthropic', 'gemini', 'kimi', 'openrouter'];

export function AIKeyButton() {
  const { config, isConfigured } = useAIConfig();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 border',
          isConfigured
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
            : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white hover:border-white/[0.15] hover:bg-white/[0.06]'
        )}
      >
        <Key className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {isConfigured ? `AI: ${PROVIDER_LABELS[config!.provider]}` : 'AI API Key'}
        </span>
        {isConfigured && (
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96"
          >
            <AIKeyPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AIKeyPanel({ onClose }: { onClose: () => void }) {
  const { config, setConfig, clearConfig, isConfigured } = useAIConfig();

  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [provider, setProvider] = useState<AIConfig['provider']>(config?.provider || 'openai');
  const [model, setModel] = useState(config?.model || DEFAULT_MODELS.openai);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Update model when provider changes (only if using default)
  const handleProviderChange = (newProvider: AIConfig['provider']) => {
    setProvider(newProvider);
    // Only auto-switch model if it was a default model
    const isDefault = Object.values(DEFAULT_MODELS).includes(model);
    if (isDefault || !model) {
      setModel(DEFAULT_MODELS[newProvider]);
    }
    setTestResult(null);
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    setConfig({ apiKey: apiKey.trim(), provider, model: model.trim() || DEFAULT_MODELS[provider] });
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    setTestMessage('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': apiKey.trim(),
          'X-AI-Provider': provider,
          'X-AI-Model': model.trim() || DEFAULT_MODELS[provider],
        },
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('success');
        setTestMessage(data.message || 'Connection successful!');
        // Auto-save on successful test
        handleSave();
      } else {
        setTestResult('error');
        setTestMessage(data.error || 'Connection failed');
      }
    } catch (err) {
      setTestResult('error');
      setTestMessage('Could not reach the server');
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    clearConfig();
    setApiKey('');
    setProvider('openai');
    setModel(DEFAULT_MODELS.openai);
    setTestResult(null);
    setTestMessage('');
  };

  const maskedKey = apiKey ? apiKey.slice(0, 6) + '•'.repeat(Math.max(0, apiKey.length - 10)) + apiKey.slice(-4) : '';

  return (
    <div className="rounded-2xl bg-night-light/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-aurora-light" />
          <h3 className="text-sm font-semibold text-white">AI Configuration</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Provider selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Provider</label>
          <div className="relative">
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AIConfig['provider'])}
              className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-voyage-500/40 transition-colors cursor-pointer"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p} className="bg-night-light text-white">
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* API Key input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
              placeholder={`Enter your ${PROVIDER_LABELS[provider]} API key...`}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 pr-16 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-voyage-500/40 transition-colors font-mono"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-slate-600">
            Your key is stored in your browser only — never sent to our servers for storage.
          </p>
        </div>

        {/* Model input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={DEFAULT_MODELS[provider]}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-voyage-500/40 transition-colors font-mono"
          />
        </div>

        {/* Test result */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-xs',
                testResult === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              )}
            >
              {testResult === 'success' ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{testMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={!apiKey.trim() || testing}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
              apiKey.trim() && !testing
                ? 'gradient-ai text-slate-50 shadow-lg shadow-aurora/20 hover:shadow-xl'
                : 'bg-white/[0.04] text-slate-500 cursor-not-allowed'
            )}
          >
            {testing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Save & Test
              </>
            )}
          </button>
          {isConfigured && (
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer status */}
      {isConfigured && (
        <div className="px-5 py-2.5 border-t border-white/[0.06] bg-emerald-500/5">
          <div className="flex items-center gap-2 text-[10px] text-emerald-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI enabled via {PROVIDER_LABELS[config!.provider]} · {config!.model}
          </div>
        </div>
      )}
    </div>
  );
}
