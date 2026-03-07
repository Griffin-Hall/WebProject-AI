import { Request, Response, NextFunction } from 'express';
import * as destinationService from '../services/destination.service.js';
import { destinationQuerySchema } from '../validators/destination.validator.js';

export async function listDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const query = destinationQuerySchema.parse(req.query);
    const result = await destinationService.getDestinations(query);
    // Cache list responses for 5 minutes (CDN/browser)
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const destination = await destinationService.getDestinationById(id);
    // Cache individual destinations for 10 minutes
    res.set('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=120');
    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
}

export async function getFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const destinations = await destinationService.getFeaturedDestinations();
    // Cache featured list for 10 minutes
    res.set('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=120');
    res.json({ success: true, data: destinations });
  } catch (error) {
    next(error);
  }
}
