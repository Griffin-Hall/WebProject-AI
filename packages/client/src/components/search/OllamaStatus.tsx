import { motion } from 'framer-motion';
import { Cpu, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useOllamaStatus } from '@/hooks/useOllamaStatus';
import { cn } from '@/lib/utils';

/**
 * Ollama Status Indicator
 * 
 * Shows whether the local Ollama LLM is connected and being used
 * for intent extraction, or if the system is using fallback mode.
 */
export function OllamaStatus() {
  const { data, isLoading } = useOllamaStatus();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="h-3 w-3 rounded-full border border-slate-600 animate-pulse" />
        Checking AI status...
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isAvailable = data.status === 'available';
  const isUnavailable = data.status === 'unavailable';
  const isError = data.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm border',
        isAvailable && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        isUnavailable && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        isError && 'bg-red-500/10 text-red-400 border-red-500/20'
      )}
    >
      {isAvailable && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>AI Powered (Local)</span>
          {data.model && (
            <span className="text-slate-500 ml-1">• {data.model}</span>
          )}
        </>
      )}
      
      {isUnavailable && (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span>AI Offline</span>
          <span className="text-slate-500 ml-1">• Using fallback</span>
        </>
      )}
      
      {isError && (
        <>
          <XCircle className="h-3.5 w-3.5" />
          <span>AI Status Unknown</span>
        </>
      )}
    </motion.div>
  );
}

/**
 * Compact Ollama Status Badge for header/nav use
 */
export function OllamaStatusBadge() {
  const { data, isLoading } = useOllamaStatus();

  if (isLoading || !data) {
    return (
      <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" title="Checking AI status..." />
    );
  }

  const isAvailable = data.status === 'available';

  return (
    <div 
      className={cn(
        'h-2 w-2 rounded-full',
        isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
      )}
      title={isAvailable ? `AI Online: ${data.model}` : 'AI Offline - Using fallback'}
    />
  );
}
