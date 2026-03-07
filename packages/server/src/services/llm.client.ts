/**
 * LLM Client - Hosted API Integration (OpenAI-compatible)
 * 
 * Supports:
 * - OpenAI API (https://api.openai.com/v1)
 * - Any OpenAI-compatible endpoint (OpenRouter, Together, etc.)
 * - Falls back to keyword extraction if API is unavailable
 * 
 * Configuration via environment variables:
 * - LLM_API_KEY: API key for authentication
 * - LLM_BASE_URL: Base URL for the API (default: https://api.openai.com/v1)
 * - LLM_MODEL: Model name (default: gpt-4o-mini)
 * - LLM_TIMEOUT_MS: Request timeout (default: 30000)
 */

import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  response_format?: { type: 'json_object' | 'text' };
}

interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature: number;
  max_tokens: number;
  top_p: number;
  response_format?: { type: 'json_object' | 'text' };
}

interface LLMResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMClient {
  private baseUrl: string;
  private model: string;
  private apiKey: string;
  private timeout: number;
  private enabled: boolean;

  constructor() {
    this.baseUrl = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    this.model = env.LLM_MODEL || 'gpt-4o-mini';
    this.apiKey = env.LLM_API_KEY || '';
    this.timeout = env.LLM_TIMEOUT_MS || 30000;
    this.enabled = !!this.apiKey;
  }

  /**
   * Check if LLM is configured and available
   */
  isConfigured(): boolean {
    return this.enabled;
  }

  /**
   * Generate a chat completion
   */
  async chat(
    messages: LLMMessage[],
    options: LLMOptions = {}
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('LLM API key not configured');
    }

    const requestBody: LLMRequest = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens ?? 500,
      top_p: options.top_p ?? 0.9,
    };

    // Only add response_format if supported (OpenAI-compatible)
    if (options.response_format) {
      requestBody.response_format = options.response_format;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      logger.debug({ 
        msg: 'Sending LLM request',
        model: this.model,
        messageCount: messages.length 
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`LLM API HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json() as LLMResponse;
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from LLM API');
      }

      logger.debug({ 
        msg: 'LLM response received',
        model: this.model,
        tokens: data.usage?.total_tokens 
      });

      return data.choices[0].message.content;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`LLM request timeout after ${this.timeout}ms`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Generate a completion with the global system prompt
   */
  async generateWithSystemPrompt(
    userMessage: string,
    systemPrompt: string,
    options: LLMOptions = {}
  ): Promise<string> {
    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ], options);
  }
}

// Singleton instance
export const llmClient = new LLMClient();
