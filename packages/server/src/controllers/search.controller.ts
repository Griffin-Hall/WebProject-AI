import { Request, Response, NextFunction } from 'express';
import { search } from '../services/search.service.js';
import { searchRequestSchema } from '../validators/search.validator.js';

export async function handleSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = searchRequestSchema.parse(req.body);
    const userId = (req as any).auth?.userId ?? undefined;
    const results = await search(query, userId);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}
