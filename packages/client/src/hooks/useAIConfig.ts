import { useState, useEffect, useCallback } from 'react';

export interface AIConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'openrouter' | 'gemini' | 'kimi';
  model: string;
}

const STORAGE_KEY = 'globesense-ai-config';

const DEFAULT_MODELS: Record<AIConfig['provider'], string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-4-20250514',
  openrouter: 'openai/gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  kimi: 'kimi-k2.5',
};

const PROVIDER_LABELS: Record<AIConfig['provider'], string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
  gemini: 'Google Gemini',
  kimi: 'Kimi (Moonshot)',
};

const PROVIDER_BASE_URLS: Record<AIConfig['provider'], string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  kimi: 'https://api.moonshot.ai/v1',
};

export { DEFAULT_MODELS, PROVIDER_LABELS, PROVIDER_BASE_URLS };

function loadConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.apiKey && parsed.provider) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveConfig(config: AIConfig | null) {
  if (config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Hook for managing the user's AI API key configuration.
 * Stores in localStorage so it persists across sessions.
 */
export function useAIConfig() {
  const [config, setConfigState] = useState<AIConfig | null>(loadConfig);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setConfigState(loadConfig());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setConfig = useCallback((newConfig: AIConfig | null) => {
    saveConfig(newConfig);
    setConfigState(newConfig);
  }, []);

  const clearConfig = useCallback(() => {
    saveConfig(null);
    setConfigState(null);
  }, []);

  const isConfigured = !!config?.apiKey;

  return { config, setConfig, clearConfig, isConfigured };
}

/**
 * Get the current AI config from localStorage (non-reactive).
 * Use in api.ts or non-component code.
 */
export function getAIConfig(): AIConfig | null {
  return loadConfig();
}

/**
 * Get headers to attach to AI-related API requests.
 */
export function getAIHeaders(): Record<string, string> {
  const config = loadConfig();
  if (!config?.apiKey) return {};
  return {
    'X-AI-API-Key': config.apiKey,
    'X-AI-Provider': config.provider,
    'X-AI-Model': config.model,
  };
}
