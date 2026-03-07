import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

export async function handleClerkWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const event = req.body;
    const eventType = event?.type;

    logger.info({ eventType }, 'Received Clerk webhook');

    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
        const primaryEmail = email_addresses?.[0]?.email_address;

        if (!primaryEmail) {
          logger.warn({ id }, 'User webhook missing email');
          break;
        }

        await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            email: primaryEmail,
            firstName: first_name,
            lastName: last_name,
            avatarUrl: image_url,
          },
          create: {
            clerkId: id,
            email: primaryEmail,
            firstName: first_name,
            lastName: last_name,
            avatarUrl: image_url,
          },
        });
        break;
      }

      case 'user.deleted': {
        const { id } = event.data;
        await prisma.user.deleteMany({ where: { clerkId: id } });
        break;
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
