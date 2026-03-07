import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import type { Prisma } from '@prisma/client';

const DESTINATION_INCLUDE = {
  weather: true,
  costs: true,
  safety: true,
  tags: true,
} as const;

/** Lightweight include for list/card views — skips weather (12 rows per destination) */
const DESTINATION_LIST_INCLUDE = {
  costs: { select: { dailyBudgetMid: true } },
  safety: { select: { safetyScore: true } },
  tags: { select: { tag: true } },
} as const;

export async function getDestinations(options: {
  page: number;
  limit: number;
  continent?: string;
  budget?: 'budget' | 'mid' | 'luxury';
  search?: string;
}) {
  const { page, limit, continent, budget, search } = options;
  const skip = (page - 1) * limit;

  const where: Prisma.DestinationWhereInput = {};

  if (continent) {
    where.continent = { equals: continent, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { city: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (budget) {
    const thresholds = { budget: 50, mid: 150, luxury: 99999 };
    where.costs = { dailyBudgetMid: { lte: thresholds[budget] } };
  }

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      include: DESTINATION_LIST_INCLUDE,
      skip,
      take: limit,
      orderBy: { city: 'asc' },
    }),
    prisma.destination.count({ where }),
  ]);

  return {
    data: destinations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDestinationById(id: string) {
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: DESTINATION_INCLUDE,
  });

  if (!destination) {
    throw new NotFoundError('Destination');
  }

  return destination;
}

export async function getFeaturedDestinations(limit = 6) {
  return prisma.destination.findMany({
    include: DESTINATION_LIST_INCLUDE,
    take: limit,
    orderBy: { safety: { safetyScore: 'desc' } },
  });
}
