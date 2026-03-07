/**
 * Test script to verify Ollama integration
 * 
 * Usage:
 *   npx tsx scripts/test-ollama.ts "cheap warm beach vacation in july"
 */

import { extractIntent } from '../src/services/intent.service.js';
import { ollamaClient } from '../src/services/ollama.client.js';

async function main() {
  const query = process.argv[2] || 'cheap warm beach vacation in july';
  
  console.log('='.repeat(60));
  console.log('Ollama Integration Test');
  console.log('='.repeat(60));
  console.log(`Query: "${query}"`);
  console.log();

  // Check Ollama health
  console.log('1. Checking Ollama health...');
  const isAvailable = await ollamaClient.isAvailable();
  console.log(`   Status: ${isAvailable ? '✓ Available' : '✗ Unavailable'}`);
  console.log();

  // Test intent extraction
  console.log('2. Testing intent extraction...');
  console.log('   Extracting...');
  const startTime = Date.now();
  
  try {
    const intent = await extractIntent(query);
    const duration = Date.now() - startTime;
    
    console.log(`   ✓ Success (${duration}ms)`);
    console.log();
    console.log('3. Extracted Intent:');
    console.log(JSON.stringify(intent, null, 2));
    
    console.log();
    if (isAvailable) {
      console.log('   (Extracted via Ollama LLM)');
    } else {
      console.log('   (Extracted via keyword fallback)');
    }
    
  } catch (error) {
    console.log('   ✗ Failed');
    console.error('   Error:', error);
    process.exit(1);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Test complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
