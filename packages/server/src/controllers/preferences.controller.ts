import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { updatePreferencesSchema } from '../validators/preferences.validator.js';
import { UnauthorizedError } from '../utils/errors.js';

async function getUserFromAuth(req: Request) {
  const clerkId = (req as any).auth?.userId;
  if (!clerkId) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new UnauthorizedError('User not found');
  return user;
}

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromAuth(req);

    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    res.json({ success: true, data: prefs });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromAuth(req);
    const data = updatePreferencesSchema.parse(req.body);

    const prefs = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data, preferredVibes: data.preferredVibes ?? [] },
    });

    res.json({ success: true, data: prefs });
  } catch (error) {
    next(error);
  }
}

export async function getSearchHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromAuth(req);

    const history = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}
