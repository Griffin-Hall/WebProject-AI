import { prisma } from '../config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

interface RawDestination {
  city: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  tags: string[];
  weather: number[][]; // [avgTempC, avgRainfallMm, sunshineHours] x 12 months
  costs: number[]; // [low, mid, high]
  safety: [number, string]; // [score, advisoryLevel]
}

/**
 * Seed the database from the bundled destinations.json file.
 * Uses upsert so it's safe to call repeatedly.
 * Returns the number of destinations seeded.
 */
export async function seedDatabase(): Promise<{ seeded: number; total: number }> {
  // Resolve path relative to compiled output (dist/) or source
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // Walk up from src/services or dist/services → package root → prisma/seed-data
  const seedPath = join(__dirname, '..', '..', 'prisma', 'seed-data', 'destinations.json');

  const rawData = readFileSync(seedPath, 'utf-8');
  const destinations: RawDestination[] = JSON.parse(rawData);

  logger.info(`Starting database seed with ${destinations.length} destinations`);

  let seeded = 0;

  for (const dest of destinations) {
    try {
      const destination = await prisma.destination.upsert({
        where: {
          city_country: { city: dest.city, country: dest.country },
        },
        update: {
          continent: dest.continent,
          lat: dest.lat,
          lng: dest.lng,
          description: dest.description,
          imageUrl: dest.imageUrl,
        },
        create: {
          city: dest.city,
          country: dest.country,
          continent: dest.continent,
          lat: dest.lat,
          lng: dest.lng,
          description: dest.description,
          imageUrl: dest.imageUrl,
        },
      });

      // Weather data (12 months)
      for (let month = 0; month < 12; month++) {
        const [avgTempC, avgRainfallMm, sunshineHours] = dest.weather[month];
        await prisma.destinationWeather.upsert({
          where: {
            destinationId_month: {
              destinationId: destination.id,
              month: month + 1,
            },
          },
          update: { avgTempC, avgRainfallMm, sunshineHours },
          create: {
            destinationId: destination.id,
            month: month + 1,
            avgTempC,
            avgRainfallMm,
            sunshineHours,
          },
        });
      }

      // Costs
      const [low, mid, high] = dest.costs;
      await prisma.destinationCosts.upsert({
        where: { destinationId: destination.id },
        update: {
          dailyBudgetLow: low,
          dailyBudgetMid: mid,
          dailyBudgetHigh: high,
          lastUpdated: new Date(),
        },
        create: {
          destinationId: destination.id,
          dailyBudgetLow: low,
          dailyBudgetMid: mid,
          dailyBudgetHigh: high,
          lastUpdated: new Date(),
        },
      });

      // Safety
      const [safetyScore, advisoryLevel] = dest.safety;
      await prisma.destinationSafety.upsert({
        where: { destinationId: destination.id },
        update: {
          safetyScore,
          advisoryLevel: advisoryLevel as string,
          source: 'Global Peace Index',
          lastUpdated: new Date(),
        },
        create: {
          destinationId: destination.id,
          safetyScore,
          advisoryLevel: advisoryLevel as string,
          source: 'Global Peace Index',
          lastUpdated: new Date(),
        },
      });

      // Tags
      for (const tag of dest.tags) {
        await prisma.destinationTag.upsert({
          where: {
            destinationId_tag: {
              destinationId: destination.id,
              tag,
            },
          },
          update: {},
          create: {
            destinationId: destination.id,
            tag,
          },
        });
      }

      // Embedding placeholder
      await prisma.destinationEmbedding.upsert({
        where: { destinationId: destination.id },
        update: {},
        create: { destinationId: destination.id },
      });

      seeded++;
    } catch (err) {
      logger.error({ city: dest.city, err }, 'Failed to seed destination');
    }
  }

  const total = await prisma.destination.count();
  logger.info(`Seed complete: ${seeded} destinations processed, ${total} total in database`);

  return { seeded, total };
}
