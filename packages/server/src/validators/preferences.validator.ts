import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  budgetLevel: z.enum(['budget', 'mid', 'luxury']).nullable().optional(),
  tempPreference: z.enum(['cold', 'mild', 'warm', 'hot']).nullable().optional(),
  safetyPriority: z.enum(['low', 'medium', 'high']).nullable().optional(),
  preferredVibes: z.array(z.string()).optional(),
});
