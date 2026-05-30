import type { SearchResponse } from '@globesense/shared';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type EvalCase = {
  name: string;
  query: string;
  expectedTags: string[];
  expectedBudget?: 'budget' | 'mid' | 'luxury';
  expectedTemp?: 'cold' | 'mild' | 'warm' | 'hot';
};

const API_URL = (process.env.GLOBESENSE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

const CASES: EvalCase[] = [
  {
    name: 'budget warm beach',
    query: 'cheap warm beach vacation in July with good food',
    expectedTags: ['beach', 'foodie'],
    expectedBudget: 'budget',
    expectedTemp: 'warm',
  },
  {
    name: 'winter sports',
    query: 'skiing in a cold mountain town in February',
    expectedTags: ['winter-sports', 'mountain'],
    expectedTemp: 'cold',
  },
  {
    name: 'safe culture',
    query: 'safe cultural city trip in Europe with museums',
    expectedTags: ['cultural', 'historical', 'urban'],
  },
];

function includesAny(actual: string[], expected: string[]): boolean {
  const actualSet = new Set(actual.map((item) => item.toLowerCase()));
  return expected.some((item) => actualSet.has(item.toLowerCase()));
}

async function runCase(testCase: EvalCase): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: testCase.query }),
  });

  if (!response.ok) {
    console.error(`[fail] ${testCase.name}: HTTP ${response.status}`);
    return false;
  }

  const envelope = (await response.json()) as ApiResponse<SearchResponse>;
  if (!envelope.success || !envelope.data) {
    console.error(`[fail] ${testCase.name}: ${envelope.error || 'missing response data'}`);
    return false;
  }

  const { intent, results } = envelope.data;
  const topResult = results[0];
  const failures: string[] = [];

  if (testCase.expectedBudget && intent.budget !== testCase.expectedBudget) {
    failures.push(`budget=${intent.budget}`);
  }

  if (testCase.expectedTemp && intent.temp_pref !== testCase.expectedTemp) {
    failures.push(`temp=${intent.temp_pref}`);
  }

  if (!includesAny(intent.trip_styles, testCase.expectedTags)) {
    failures.push(`tags=${intent.trip_styles.join(',') || 'none'}`);
  }

  if (!topResult) {
    failures.push('no search results');
  } else {
    if (!topResult.matchReasons?.length) failures.push('top result missing match reasons');
    if (!topResult.sourceLinks?.length) failures.push('top result missing source links');
  }

  if (failures.length > 0) {
    console.error(`[fail] ${testCase.name}: ${failures.join('; ')}`);
    return false;
  }

  console.log(`[pass] ${testCase.name}: top=${topResult.city}, ${topResult.country}`);
  return true;
}

async function main() {
  console.log(`GlobeSense AI/search eval against ${API_URL}`);

  const results = await Promise.all(CASES.map((testCase) => runCase(testCase)));
  const passed = results.filter(Boolean).length;

  console.log(`${passed}/${CASES.length} eval cases passed`);

  if (passed !== CASES.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
