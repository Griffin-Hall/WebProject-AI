import type { Request } from 'express';
import type { ExtractedIntent } from '@globesense/shared';
import { env } from '../config/env.js';
import { INTENT_EXTRACTION_PROMPT } from '../utils/prompt-templates.js';
import { intentSchema } from '../validators/search.validator.js';

export type AIProviderName = 'openai' | 'anthropic' | 'openrouter' | 'gemini' | 'kimi';
export type AIKeySource = 'user-key' | 'server-key';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

export interface AIMetadata {
  provider: AIProviderName;
  model: string;
  source: AIKeySource;
}

interface AIProviderConfig extends AIMetadata {
  apiKey: string;
  baseUrl: string;
}

const PROVIDER_BASE_URLS: Record<AIProviderName, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
  kimi: 'https://api.moonshot.ai/v1',
};

function getHeader(req: Request, name: string): string | undefined {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeProvider(provider: string | undefined): AIProviderName {
  if (
    provider === 'openai' ||
    provider === 'anthropic' ||
    provider === 'openrouter' ||
    provider === 'gemini' ||
    provider === 'kimi'
  ) {
    return provider;
  }

  return 'openai';
}

function resolveAIProvider(req: Request): AIProviderConfig {
  const userApiKey = getHeader(req, 'x-ai-api-key')?.trim();

  if (userApiKey) {
    const provider = normalizeProvider(getHeader(req, 'x-ai-provider'));
    const model = getHeader(req, 'x-ai-model')?.trim() || 'gpt-4o-mini';

    return {
      apiKey: userApiKey,
      provider,
      model,
      baseUrl: PROVIDER_BASE_URLS[provider],
      source: 'user-key',
    };
  }

  if (env.LLM_API_KEY) {
    return {
      apiKey: env.LLM_API_KEY,
      provider: 'openai',
      model: env.LLM_MODEL,
      baseUrl: env.LLM_BASE_URL.replace(/\/$/, ''),
      source: 'server-key',
    };
  }

  throw new Error('No AI provider configured. Set LLM_API_KEY on the server or provide a user AI key.');
}

function providerSupportsResponseFormat(provider: AIProviderName): boolean {
  return provider !== 'anthropic' && provider !== 'openrouter';
}

export function getServerAIStatus() {
  return {
    configured: Boolean(env.LLM_API_KEY),
    provider: 'openai-compatible',
    model: env.LLM_MODEL,
    source: 'server-key' as const,
  };
}

export function buildLLMCall(req: Request): {
  metadata: AIMetadata;
  call: (messages: ChatMessage[], options?: LLMOptions) => Promise<string>;
} {
  const config = resolveAIProvider(req);
  const metadata: AIMetadata = {
    provider: config.provider,
    model: config.model,
    source: config.source,
  };

  return {
    metadata,
    call: async (messages: ChatMessage[], options: LLMOptions = {}): Promise<string> => {
      if (config.provider === 'anthropic') {
        const systemMsg = messages.find((message) => message.role === 'system');
        const nonSystemMsgs = messages.filter((message) => message.role !== 'system');

        const response = await fetch(`${config.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: options.max_tokens ?? 1024,
            system: systemMsg?.content || '',
            messages: nonSystemMsgs.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          }),
        });

        if (!response.ok) {
          const error = await response.text().catch(() => 'Unknown error');
          throw new Error(`Anthropic API ${response.status}: ${error}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || '';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      };

      if (config.provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://griffin-hall.github.io/GlobeSense/';
        headers['X-Title'] = 'GlobeSense Travel AI';
      }

      const body: Record<string, unknown> = {
        model: config.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
      };

      if (options.response_format && providerSupportsResponseFormat(config.provider)) {
        body.response_format = options.response_format;
      }

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text().catch(() => 'Unknown error');
        throw new Error(`LLM API ${response.status}: ${error}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    },
  };
}

export function parseJSONFromLLM(responseText: string): unknown {
  const trimmed = responseText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  const jsonText = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;

  return JSON.parse(jsonText);
}

export async function extractIntentWithAI(
  req: Request,
  query: string,
): Promise<{ intent: ExtractedIntent; metadata: AIMetadata }> {
  const { call, metadata } = buildLLMCall(req);
  const prompt = INTENT_EXTRACTION_PROMPT.replace('{query}', query);

  const response = await call(
    [
      { role: 'system', content: 'You are a precise intent extraction engine. Return only valid JSON.' },
      { role: 'user', content: prompt },
    ],
    {
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    },
  );

  const parsed = parseJSONFromLLM(response);
  const validated = intentSchema.parse(parsed);

  return { intent: validated as ExtractedIntent, metadata };
}
