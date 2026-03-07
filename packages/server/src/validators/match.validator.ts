import { z } from 'zod';

export const saveMatchSchema = z.object({
  destinationId: z.string().uuid(),
  searchQuery: z.string().min(1),
  matchScore: z.number().min(0).max(1),
});
