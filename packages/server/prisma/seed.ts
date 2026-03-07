import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

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

async function main() {
  console.log('Seeding database...');

  // Read seed data
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const rawData = readFileSync(join(__dirname, 'seed-data', 'destinations.json'), 'utf-8');
  const destinations: RawDestination[] = JSON.parse(rawData);

  console.log(`Found ${destinations.length} destinations to seed`);

  for (const dest of destinations) {
    console.log(`  Seeding: ${dest.city}, ${dest.country}`);

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

    // Create embedding placeholder
    await prisma.destinationEmbedding.upsert({
      where: { destinationId: destination.id },
      update: {},
      create: { destinationId: destination.id },
    });
  }

  console.log(`Seeded ${destinations.length} destinations successfully!`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
