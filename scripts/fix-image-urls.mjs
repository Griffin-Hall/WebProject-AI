#!/usr/bin/env node
/**
 * fix-image-urls.mjs
 *
 * Fetches working city image URLs from Wikipedia's pageimages API.
 * Uses Wikimedia Commons thumbnails — the most stable image URLs on the internet.
 * No API key required. Batches 20 cities per request for efficiency.
 *
 * Usage:
 *   node scripts/fix-image-urls.mjs              # Fix URLs & write to file
 *   node scripts/fix-image-urls.mjs --check-only # Report only, don't write
 *   node scripts/fix-image-urls.mjs --json       # Output JSON mapping only
 */

import fs from 'fs';

const SEED_FILE = './packages/server/prisma/seed-data/destinations.json';
const MAPPING_FILE = './scripts/city-image-mapping.json';
const BATCH_SIZE = 20;
const DELAY_MS = 1500;
const TIMEOUT_MS = 15000;
const UA = 'VoyageMatcher/1.0 (city-image-fixer; educational-project)';

// ─── City name → Wikipedia article title mapping ─────────────────────────────
const WIKI_TITLES = {
  "Hong Kong":        "Hong_Kong_Island",
  "Menorca":          "Ciutadella_de_Menorca",
  "Jeju Island":      "Jeju_Island",
  "Muscat":           "Muscat",
  "Nadi":             "Nadi,_Fiji",
  "Cartagena":        "Cartagena,_Colombia",
  "Bogota":           "Bogotá",
  "Queenstown":       "Queenstown,_New_Zealand",
  "Livingstone":      "Livingstone,_Zambia",
  "Zanzibar":         "Zanzibar_City",
  "Petra":            "Petra",
  "Siem Reap":        "Siem_Reap",
  "Luang Prabang":    "Luang_Prabang",
  "Kota Kinabalu":    "Kota_Kinabalu",
  "Phnom Penh":       "Phnom_Penh",
  "El Nido":          "El_Nido,_Palawan",
  "Nha Trang":        "Nha_Trang",
  "Victoria Falls":   "Victoria_Falls",
  "Quebec City":      "Quebec_City",
  "San Juan":         "San_Juan,_Puerto_Rico",
  "Niagara Falls":    "Niagara_Falls",
  "Puerto Iguazu":    "Iguazu_Falls",
  "Punta del Este":   "Punta_del_Este",
  "The Hague":        "The_Hague",
  "Cinque Terre":     "Cinque_Terre",
  "Kingston":         "Kingston,_Jamaica",
  "Hamilton":         "Hamilton,_Bermuda",
  "Antigua":          "Antigua_Guatemala",
  "Portland":         "Portland,_Oregon",
  "Nashville":        "Nashville,_Tennessee",
  "Charleston":       "Charleston,_South_Carolina",
  "Savannah":         "Savannah,_Georgia",
  "Aspen":            "Aspen,_Colorado",
  "Penang":           "George_Town,_Penang",
  "Fes":              "Fez,_Morocco",
  "Valparaiso":       "Valparaíso",
  "Florianopolis":    "Florianópolis",
  "Salvador":         "Salvador,_Bahia",
  "Krakow":           "Kraków",
  "Malmo":            "Malmö",
  "Zurich":           "Zurich",
  "Musandam":         "Musandam",
  "Guanajuato":       "Guanajuato_(city)",
  "Faro":             "Faro,_Portugal",
  "Valencia":         "Valencia,_Spain",
  "Birmingham":       "Birmingham",
  "Colombo":          "Colombo",
  "Thimphu":          "Thimphu",
  "Lhasa":            "Lhasa",
  "Ulaanbaatar":      "Ulaanbaatar",
  "Baku":             "Baku",
  "Yangon":           "Yangon",
  "Varanasi":         "Varanasi",
  "Bishkek":          "Bishkek",
  "Rishikesh":        "Rishikesh",
  "Sapporo":          "Sapporo",
  "Vientiane":        "Vientiane",
  "Amman":            "Amman",
  "Ladakh":           "Ladakh",
  "Essaouira":        "Essaouira",
  "Dakar":            "Dakar",
  "Antananarivo":     "Antananarivo",
  "Windhoek":         "Windhoek",
  "Maputo":           "Maputo",
  "Tunis":            "Tunis",
  "Luxor":            "Luxor",
  "Chefchaouen":      "Chefchaouen",
  "Harare":           "Harare",
  "Ouagadougou":      "Ouagadougou",
  "Toubkal":          "Toubkal",
  "Boston":           "Boston",
  "Seattle":          "Seattle",
  "Denver":           "Denver",
  "Santiago":         "Santiago",
  "Montevideo":       "Montevideo",
  "Quito":            "Quito",
  "Lima":             "Lima",
  "Arequipa":         "Arequipa",
  "Sucre":            "Sucre",
  "Paraty":           "Paraty",
  "Puno":             "Puno",
  "Cali":             "Cali",
  "Hobart":           "Hobart",
  "Shanghai":         "Shanghai",
  "Munich":           "Munich",
  "Stockholm":        "Stockholm",
  "Dublin":           "Dublin",
  "Florence":         "Florence",
  "Brussels":         "Brussels",
  "Madrid":           "Madrid",
  "Berlin":           "Berlin",
  "Helsinki":         "Helsinki",
  "Oslo":             "Oslo",
  "Salzburg":         "Salzburg",
  "Budapest":         "Budapest",
  "Geneva":           "Geneva",
  "Nice":             "Nice",
  "Marseille":        "Marseille",
  "Lyon":             "Lyon",
  "Bordeaux":         "Bordeaux",
  "Strasbourg":       "Strasbourg",
  "Liverpool":        "Liverpool",
  "Glasgow":          "Glasgow",
  "Bristol":          "Bristol",
  "Ghent":            "Ghent",
  "Bruges":           "Bruges",
  "Antwerp":          "Antwerp",
  "Rotterdam":        "Rotterdam",
  "Gothenburg":       "Gothenburg",
  "Bergen":           "Bergen",
  "Trondheim":        "Trondheim",
  "Aarhus":           "Aarhus",
  "Seville":          "Seville",
  "Ibiza":            "Ibiza",
  "Mallorca":         "Mallorca",
  "Milan":            "Milan",
  "Naples":           "Naples",
  "Pisa":             "Pisa",
  "Siena":            "Siena",
  "Bologna":          "Bologna",
  "Verona":           "Verona",
  "Turin":            "Turin",
  "Genoa":            "Genoa",
  "Palermo":          "Palermo",
  "Catania":          "Catania",
  "Cagliari":         "Cagliari",
};

// Cities that are in the target list
const TARGET_CITIES = new Set(Object.keys(WIKI_TITLES));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/** Convert any Wikimedia image URL to a 960px thumbnail (valid Wikimedia step) */
function toThumb960(url) {
  if (!url) return null;
  // Already a thumbnail — swap pixel width
  if (url.includes('/thumb/')) {
    return url.replace(/\/\d+px-([^/]+)$/, '/960px-$1');
  }
  // Full URL → thumb URL
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|en))\/([\ da-f]\/[\ da-f]{2})\/(.+)$/i
  );
  if (m) {
    const [, base, hash, filename] = m;
    return `${base}/thumb/${hash}/${filename}/960px-${filename}`;
  }
  return url;
}

/** Check if image looks like a real photo (not flag/logo/map/SVG) */
function isGoodImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes('.svg')) return false;
  const reject = [
    'flag_of', 'flag-of', 'bandera', 'drapeau',
    'coat_of_arms', 'escudo', 'blason', 'wappen',
    'seal_of', 'emblem', 'logo', 'icon',
    'map_of', 'locator', 'location_map',
    'commons-logo', 'wiki-logo',
  ];
  return !reject.some((p) => lower.includes(p));
}

/**
 * Fetch page images for a batch of Wikipedia titles using the pageimages prop.
 * Returns Map<normalizedTitle, thumbUrl>
 */
async function fetchPageImages(titles) {
  const joined = titles.join('|');
  const url =
    `https://en.wikipedia.org/w/api.php?action=query` +
    `&titles=${encodeURIComponent(joined)}` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=960` +
    `&format=json&origin=*`;

  const data = await fetchJSON(url);
  if (!data?.query?.pages) return new Map();

  const results = new Map();
  for (const page of Object.values(data.query.pages)) {
    if (!page.thumbnail?.source) continue;
    const thumbUrl = page.thumbnail.source;
    if (!isGoodImage(thumbUrl)) continue;
    const normalized = toThumb960(thumbUrl);
    results.set(page.title, normalized);
  }

  // Also handle redirects via the normalized titles
  if (data.query.normalized) {
    for (const norm of data.query.normalized) {
      // norm.from → norm.to
      if (results.has(norm.to)) {
        results.set(norm.from, results.get(norm.to));
      }
    }
  }

  return results;
}

/**
 * Search Wikimedia Commons for a city image.
 * Returns a thumburl at 800px, or null.
 */
async function searchCommonsImage(city, country) {
  const queries = [`${city} ${country || ''}`.trim(), city];

  for (const q of queries) {
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=8&format=json&origin=*`;

    const data = await fetchJSON(searchUrl);
    const items = data?.query?.search || [];

    for (const item of items) {
      const title = item.title;
      if (!title.match(/\.(jpe?g|png)$/i)) continue;
      if (!isGoodImage(title)) continue;

      const infoUrl =
        `https://commons.wikimedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(title)}` +
        `&prop=imageinfo&iiprop=url&iiurlwidth=960&format=json&origin=*`;

      const infoData = await fetchJSON(infoUrl);
      for (const page of Object.values(infoData?.query?.pages || {})) {
        const thumburl = page.imageinfo?.[0]?.thumburl;
        if (thumburl) return thumburl;
      }
    }
  }
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check-only');
  const jsonOnly = args.includes('--json');

  const destinations = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  const targets = destinations.filter((d) => TARGET_CITIES.has(d.city));

  if (!jsonOnly) {
    console.log(`\nProcessing ${targets.length} cities...\n`);
  }

  // Build wikiTitle → cityName reverse map
  const titleToCity = new Map();
  const cityToTitle = new Map();
  for (const dest of targets) {
    const wikiTitle = WIKI_TITLES[dest.city] || dest.city.replace(/ /g, '_');
    titleToCity.set(wikiTitle, dest.city);
    cityToTitle.set(dest.city, wikiTitle);
  }

  // ─── Phase 1: Batch fetch from Wikipedia pageimages API ──────────────────
  const allWikiTitles = [...new Set(cityToTitle.values())];
  const wikiResults = new Map(); // city → url

  for (let i = 0; i < allWikiTitles.length; i += BATCH_SIZE) {
    const batch = allWikiTitles.slice(i, i + BATCH_SIZE);
    const pageImages = await fetchPageImages(batch);

    // Map results back to city names
    for (const queryTitle of batch) {
      const city = titleToCity.get(queryTitle);
      if (!city || wikiResults.has(city)) continue;

      // Check by the query title directly
      if (pageImages.has(queryTitle)) {
        wikiResults.set(city, pageImages.get(queryTitle));
        continue;
      }

      // Check normalized version (underscores → spaces, etc.)
      const spaced = queryTitle.replace(/_/g, ' ');
      if (pageImages.has(spaced)) {
        wikiResults.set(city, pageImages.get(spaced));
        continue;
      }

      // Check all returned titles for a partial match
      for (const [returnedTitle, url] of pageImages) {
        const qBase = queryTitle.split(',')[0].split('(')[0].trim().replace(/_/g, ' ');
        const rBase = returnedTitle.split(',')[0].split('(')[0].trim();
        if (qBase === rBase || returnedTitle === spaced) {
          wikiResults.set(city, url);
          break;
        }
      }
    }

    if (!jsonOnly) {
      const done = Math.min(i + BATCH_SIZE, allWikiTitles.length);
      const batchResolved = batch.filter(t => {
        const city = titleToCity.get(t);
        return city && wikiResults.has(city);
      }).length;
      console.log(`  Wikipedia batch ${Math.ceil(done / BATCH_SIZE)}: ${batchResolved}/${batch.length} images`);
    }
    await sleep(DELAY_MS);
  }

  // ─── Phase 2: Commons search for remaining cities ────────────────────────
  const needsCommons = targets.filter((d) => !wikiResults.has(d.city));

  if (!jsonOnly && needsCommons.length > 0) {
    console.log(`\n  ${needsCommons.length} cities need Commons fallback...\n`);
  }

  const commonsResults = new Map();
  for (const dest of needsCommons) {
    if (checkOnly) continue;
    const img = await searchCommonsImage(dest.city, dest.country);
    if (img) {
      commonsResults.set(dest.city, img);
      if (!jsonOnly) console.log(`  OK  ${dest.city} [commons]`);
    } else {
      if (!jsonOnly) console.log(`  BAD ${dest.city}`);
    }
    await sleep(800);
  }

  // ─── Combine results ────────────────────────────────────────────────────
  const results = {};
  let wikiCount = 0, commonsCount = 0, brokenCount = 0;
  const brokenList = [];

  for (const dest of targets) {
    if (wikiResults.has(dest.city)) {
      results[dest.city] = wikiResults.get(dest.city);
      wikiCount++;
    } else if (commonsResults.has(dest.city)) {
      results[dest.city] = commonsResults.get(dest.city);
      commonsCount++;
    } else {
      results[dest.city] = dest.imageUrl;
      brokenCount++;
      brokenList.push(dest.city);
    }
  }

  // ─── Output ──────────────────────────────────────────────────────────────
  if (jsonOnly) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`  Fixed (Wikipedia):   ${wikiCount}`);
  console.log(`  Fixed (Commons):     ${commonsCount}`);
  console.log(`  Still broken:        ${brokenCount}`);
  console.log(`  Total:               ${targets.length}`);
  console.log('='.repeat(50));

  if (brokenList.length > 0) {
    console.log('\nStill missing:');
    brokenList.forEach((c) => console.log(`  - ${c}`));
  }

  // Write updated file
  if (!checkOnly) {
    let updated = 0;
    for (const dest of destinations) {
      if (results[dest.city] && results[dest.city] !== dest.imageUrl) {
        dest.imageUrl = results[dest.city];
        updated++;
      }
    }
    if (updated > 0) {
      fs.writeFileSync(SEED_FILE, JSON.stringify(destinations, null, 2), 'utf8');
      console.log(`\nUpdated ${updated} image URLs in destinations.json`);
    } else {
      console.log('\nNo URLs needed updating.');
    }
  }

  fs.writeFileSync(MAPPING_FILE, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Mapping saved to ${MAPPING_FILE}`);
}

main().catch(console.error);
