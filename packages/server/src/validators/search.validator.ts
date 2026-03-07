import { z } from 'zod';

export const searchRequestSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters').max(500),
});

export const intentSchema = z.object({
  budget: z.enum(['budget', 'mid', 'luxury']).nullable(),
  temp_pref: z.enum(['cold', 'mild', 'warm', 'hot']).nullable(),
  month: z.number().int().min(1).max(12).nullable(),
  trip_styles: z.array(z.string()),
  safety_priority: z.enum(['low', 'medium', 'high']).default('medium'),
  duration_days: z.number().int().positive().nullable(),
  region_pref: z.string().nullable(),
  vibe_description: z.string(),
});
