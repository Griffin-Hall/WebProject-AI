import { z } from 'zod';

/**
 * Environment Configuration
 * 
 * All configuration is loaded from environment variables.
 * No hardcoded secrets or hostnames.
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Ollama (Local LLM - kept for backward compatibility)
  // For local: http://127.0.0.1:11434
  OLLAMA_BASE_URL: z.string().url().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().min(1).default('qwen3-coder:30b'),
  OLLAMA_API_KEY: z.string().min(1).optional(),
  OLLAMA_TIMEOUT_MS: z.coerce.number().default(30000),
  OLLAMA_MAX_RETRIES: z.coerce.number().default(2),
  
  // Hosted LLM (OpenAI-compatible API)
  // This takes priority over Ollama if configured
  LLM_API_KEY: z.string().min(1).optional(),
  LLM_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  LLM_MODEL: z.string().min(1).default('gpt-4o-mini'),
  LLM_TIMEOUT_MS: z.coerce.number().default(30000),
  
  // Client
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  
  // Optional: External LLM providers (for future use)
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
  
  // Log configuration (without sensitive values)
  console.log('Environment loaded:', {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    LLM_CONFIGURED: !!env.LLM_API_KEY,
    LLM_MODEL: env.LLM_MODEL,
    OLLAMA_CONFIGURED: !env.LLM_API_KEY, // Will use Ollama as fallback
    CLIENT_URL: env.CLIENT_URL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    const details = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    console.error(`Missing or invalid environment variables: ${details}`);
    process.exit(1);
  }
  throw error;
}

export { env };
