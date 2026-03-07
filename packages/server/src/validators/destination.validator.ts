import { z } from 'zod';

export const destinationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  continent: z.string().optional(),
  budget: z.enum(['budget', 'mid', 'luxury']).optional(),
  search: z.string().optional(),
});
