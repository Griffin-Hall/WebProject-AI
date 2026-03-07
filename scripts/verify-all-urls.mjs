#!/usr/bin/env node
/**
 * verify-all-urls.mjs
 * Tests every image URL in destinations.json with HEAD requests.
 * Uses proper rate limiting to avoid Wikimedia 429 errors.
 * Outputs results to verify-results.json
 */
import fs from 'fs';
import https from 'https';
import http from 'http';

const SEED_FILE = './packages/server/prisma/seed-data/destinations.json';
const RESULTS_FILE = './scripts/verify-results.json';
const DELAY_MS = 500; // 500ms between requests to avoid rate limiting
const TIMEOUT_MS = 15000;

function testUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ ok: false, status: 0, error: 'null url' });
    
    const mod = url.startsWith('https') ? https : http;
    try {
      const req = mod.request(url, { 
        method: 'HEAD', 
        timeout: TIMEOUT_MS, 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*',
        }
      }, (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          testUrl(res.headers.location).then(resolve);
          return;
        }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ ok: false, status: 0, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'timeout' }); });
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 0, error: e.message });
    }
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const destinations = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  const results = { ok: [], fail: [], total: destinations.length };
  
  console.log(`Testing ${destinations.length} URLs...\n`);
  
  for (let i = 0; i < destinations.length; i++) {
    const d = destinations[i];
    const r = await testUrl(d.imageUrl);
    
    const entry = { city: d.city, country: d.country, url: d.imageUrl, status: r.status };
    if (r.ok) {
      results.ok.push(entry);
      process.stdout.write(`  ${i+1}/${destinations.length} ${d.city}: OK\n`);
    } else {
      entry.error = r.error;
      results.fail.push(entry);
      process.stdout.write(`  ${i+1}/${destinations.length} ${d.city}: FAIL (${r.status} ${r.error || ''})\n`);
    }
    
    await sleep(DELAY_MS);
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  OK:     ${results.ok.length}`);
  console.log(`  FAIL:   ${results.fail.length}`);
  console.log(`  Total:  ${results.total}`);
  console.log(`${'='.repeat(50)}`);
  
  if (results.fail.length > 0) {
    console.log('\nFailed cities:');
    results.fail.forEach(f => console.log(`  - ${f.city} (${f.country}) [${f.status}]`));
  }
  
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results saved to ${RESULTS_FILE}`);
}

main().catch(console.error);
