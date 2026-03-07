/**
 * Ollama Client - Local/Hosted LLM Integration
 * 
 * Supports:
 * - Local Ollama (http://localhost:11434)
 * - Self-hosted Ollama (custom URL)
 * - Cloud Ollama services (RunPod, OpenRouter, etc.)
 * 
 * Falls back to keyword-based extraction if Ollama is unavailable.
 */

import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OllamaOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  repeat_penalty?: number;
}

interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
  };
}

interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;
  private timeout: number;
  private maxRetries: number;
  private apiKey?: string;

  constructor(
    baseUrl: string = env.OLLAMA_BASE_URL,
    model: string = env.OLLAMA_MODEL,
    timeout: number = env.OLLAMA_TIMEOUT_MS,
    maxRetries: number = env.OLLAMA_MAX_RETRIES,
    apiKey: string | undefined = env.OLLAMA_API_KEY
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.model = model;
    this.timeout = timeout;
    this.maxRetries = maxRetries;
    this.apiKey = apiKey;
  }

  /**
   * Get headers for requests (includes API key if set)
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    return headers;
  }

  /**
   * Check if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try /api/tags for local Ollama, /api/health for some hosted versions
      const endpoints = ['/api/tags', '/api/health', '/health'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
            signal: controller.signal,
          });
          
          if (response.ok) {
            clearTimeout(timeoutId);
            return true;
          }
        } catch {
          // Try next endpoint
        }
      }
      
      clearTimeout(timeoutId);
      return false;
    } catch (error) {
      logger.debug({ msg: 'Ollama health check failed', error });
      return false;
    }
  }

  /**
   * Generate a chat completion
   */
  async chat(
    messages: OllamaMessage[],
    options: OllamaOptions = {}
  ): Promise<string> {
    const requestBody: OllamaRequest = {
      model: this.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.2,
        num_predict: options.max_tokens ?? 500,
        top_p: options.top_p ?? 0.9,
        top_k: options.top_k ?? 40,
        repeat_penalty: options.repeat_penalty ?? 1.1,
      },
    };

    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.info(`Retrying Ollama request (attempt ${attempt + 1}/${this.maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        const response = await this.makeRequest(requestBody);
        
        if (response.message?.content) {
          logger.debug({ 
            msg: 'Ollama response received',
            model: this.model,
            duration: response.total_duration,
            tokens: response.eval_count 
          });
          return response.message.content;
        }
        
        throw new Error('Empty response from Ollama');
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn({ 
          msg: `Ollama request failed (attempt ${attempt + 1})`,
          error: lastError?.message,
          model: this.model 
        });
      }
    }

    throw new Error(
      `Ollama request failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`
    );
  }

  private async makeRequest(requestBody: OllamaRequest): Promise<OllamaResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Ollama HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json() as OllamaResponse;
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Is Ollama running?`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Stream a chat completion (for future use)
   */
  async *streamChat(
    messages: OllamaMessage[],
    options: OllamaOptions = {}
  ): AsyncGenerator<string> {
    const requestBody: OllamaRequest = {
      model: this.model,
      messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.2,
        num_predict: options.max_tokens ?? 500,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line) as OllamaResponse;
              if (chunk.message?.content) {
                yield chunk.message.content;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Singleton instance with env configuration
export const ollamaClient = new OllamaClient();
