import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { saveMatchSchema } from '../validators/match.validator.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';

async function getUserFromAuth(req: Request) {
  const clerkId = (req as any).auth?.userId;
  if (!clerkId) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new UnauthorizedError('User not found');
  return user;
}

export async function saveMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromAuth(req);
    const { destinationId, searchQuery, matchScore } = saveMatchSchema.parse(req.body);

    const match = await prisma.savedMatch.upsert({
      where: {
        userId_destinationId_searchQuery: {
          userId: user.id,
          destinationId,
          searchQuery,
        },
      },
      update: { matchScore },
      create: {
        userId: user.id,
        destinationId,
        searchQuery,
        matchScore,
      },
    });

    res.status(201).json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
}

export async function listMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromAuth(req);

    const matches = await prisma.savedMatch.findMany({
      where: { userId: user.id },
      include: {
        destination: {
          include: { tags: true, costs: true, safety: true },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
}

export async function deleteMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromAuth(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const match = await prisma.savedMatch.findFirst({
      where: { id, userId: user.id },
    });
    if (!match) throw new NotFoundError('Saved match');

    await prisma.savedMatch.delete({ where: { id } });
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
}
