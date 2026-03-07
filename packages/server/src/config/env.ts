import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().min(1).default('ollama/qwen3-coder:30b'),
  OLLAMA_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('DEBUG: env var keys:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NODE') || k.includes('PORT')).join(', '));
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const details = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    console.error(`Missing or invalid environment variables: ${details}`);
    process.exit(1);
  }
  throw error;
}

export { env };
