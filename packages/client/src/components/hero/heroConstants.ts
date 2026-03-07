import type { DestinationMood } from './heroTypes';

// ─── Destination Mood Map ───────────────────────────────────────────────────

// All gradients stay in the dark range (never brighter than ~35% luminance)
// The accent color pops on UI elements; the gradient itself is just a subtle tint

const DEFAULT_MOOD: DestinationMood = {
  name: 'Explorer',
  gradient: 'linear-gradient(135deg, #0a0f1a 0%, #0f1b3d 40%, #162a5c 70%, #1a3370 100%)',
  accentColor: '#60a5fa',
  particleColor: '#93c5fd',
};

const DESTINATION_MOODS: Record<string, DestinationMood> = {
  // Neon / Tech cities — deep indigo with purple tint
  tokyo:      { name: 'Neon Nights',     gradient: 'linear-gradient(135deg, #0c0618 0%, #1a0d38 40%, #261452 65%, #2d1960 100%)', accentColor: '#a78bfa', particleColor: '#c4b5fd' },
  seoul:      { name: 'Neon Nights',     gradient: 'linear-gradient(135deg, #0c0618 0%, #1a0d38 40%, #261452 65%, #2d1960 100%)', accentColor: '#a78bfa', particleColor: '#c4b5fd' },
  shanghai:   { name: 'Neon Nights',     gradient: 'linear-gradient(135deg, #0c0618 0%, #1a0d38 40%, #261452 65%, #2d1960 100%)', accentColor: '#a78bfa', particleColor: '#c4b5fd' },
  kyoto:      { name: 'Zen Garden',      gradient: 'linear-gradient(135deg, #080f08 0%, #0f1f0e 40%, #162e14 65%, #1c3a1a 100%)', accentColor: '#4ade80', particleColor: '#86efac' },
  bangkok:    { name: 'Golden Temple',   gradient: 'linear-gradient(135deg, #120c02 0%, #1f1505 40%, #2d1e08 65%, #3a270a 100%)', accentColor: '#eab308', particleColor: '#fcd34d' },
  singapore:  { name: 'Garden City',     gradient: 'linear-gradient(135deg, #0a0f1a 0%, #0f1b3d 40%, #162a5c 65%, #1a3370 100%)', accentColor: '#60a5fa', particleColor: '#93c5fd' },

  // Mediterranean / Warm — deep amber-browns
  santorini:  { name: 'Aegean Sunset',   gradient: 'linear-gradient(135deg, #1a0c06 0%, #2d1509 40%, #3d1e0c 65%, #4a250f 100%)', accentColor: '#fb923c', particleColor: '#fdba74' },
  barcelona:  { name: 'Mediterranean',   gradient: 'linear-gradient(135deg, #1a0c06 0%, #2d1509 40%, #3d1e0c 65%, #4a250f 100%)', accentColor: '#fb923c', particleColor: '#fdba74' },
  rome:       { name: 'Terracotta',      gradient: 'linear-gradient(135deg, #140e04 0%, #231806 40%, #322208 65%, #3d2a0a 100%)', accentColor: '#d97706', particleColor: '#fbbf24' },
  istanbul:   { name: 'Bazaar Gold',     gradient: 'linear-gradient(135deg, #140e04 0%, #231806 40%, #322208 65%, #3d2a0a 100%)', accentColor: '#d97706', particleColor: '#fbbf24' },
  lisbon:     { name: 'Atlantic Gold',   gradient: 'linear-gradient(135deg, #140e04 0%, #261a07 40%, #352409 65%, #402c0c 100%)', accentColor: '#f59e0b', particleColor: '#fcd34d' },
  marrakech:  { name: 'Desert Spice',    gradient: 'linear-gradient(135deg, #1a0c06 0%, #2d1208 40%, #3d190b 65%, #4a1f0e 100%)', accentColor: '#ea580c', particleColor: '#fb923c' },

  // Alpine / Cold — deep teal-greens
  banff:      { name: 'Alpine Frost',    gradient: 'linear-gradient(135deg, #040f0e 0%, #081c1a 40%, #0d2a28 65%, #113633 100%)', accentColor: '#2dd4bf', particleColor: '#5eead4' },
  reykjavik:  { name: 'Nordic Aurora',   gradient: 'linear-gradient(135deg, #040e08 0%, #081a10 40%, #0c2618 65%, #103020 100%)', accentColor: '#34d399', particleColor: '#6ee7b7' },
  zurich:     { name: 'Alpine Frost',    gradient: 'linear-gradient(135deg, #040f0e 0%, #081c1a 40%, #0d2a28 65%, #113633 100%)', accentColor: '#2dd4bf', particleColor: '#5eead4' },

  // Tropical — deep jungle greens
  bali:       { name: 'Tropical Lush',   gradient: 'linear-gradient(135deg, #040e06 0%, #081c0e 40%, #0e2a16 65%, #13351c 100%)', accentColor: '#22c55e', particleColor: '#86efac' },
  cancun:     { name: 'Caribbean Blue',  gradient: 'linear-gradient(135deg, #06101a 0%, #0b1c30 40%, #102845 65%, #143258 100%)', accentColor: '#38bdf8', particleColor: '#7dd3fc' },
  maldives:   { name: 'Ocean Dream',     gradient: 'linear-gradient(135deg, #06101a 0%, #0b1c30 40%, #102845 65%, #143258 100%)', accentColor: '#38bdf8', particleColor: '#7dd3fc' },
  phuket:     { name: 'Tropical Lush',   gradient: 'linear-gradient(135deg, #040e06 0%, #081c0e 40%, #0e2a16 65%, #13351c 100%)', accentColor: '#22c55e', particleColor: '#86efac' },

  // Urban / Cosmopolitan — deep slate blues
  paris:      { name: 'City of Light',   gradient: 'linear-gradient(135deg, #0a0a1a 0%, #141435 40%, #1c1c4a 65%, #222258 100%)', accentColor: '#818cf8', particleColor: '#a5b4fc' },
  london:     { name: 'Thames Mist',     gradient: 'linear-gradient(135deg, #0e1014 0%, #1a1e24 40%, #262c34 65%, #313840 100%)', accentColor: '#94a3b8', particleColor: '#cbd5e1' },
  'new york': { name: 'Manhattan',       gradient: 'linear-gradient(135deg, #0a0a0c 0%, #161618 40%, #222224 65%, #2c2c30 100%)', accentColor: '#a1a1aa', particleColor: '#d4d4d8' },
  dubai:      { name: 'Golden Mirage',   gradient: 'linear-gradient(135deg, #120c02 0%, #1f1505 40%, #2d1e08 65%, #3a270a 100%)', accentColor: '#eab308', particleColor: '#fcd34d' },

  // Coastal / Beach — deep ocean blues
  sydney:     { name: 'Harbour Blue',    gradient: 'linear-gradient(135deg, #080e1a 0%, #0e1a30 40%, #142645 65%, #1a3058 100%)', accentColor: '#60a5fa', particleColor: '#93c5fd' },
  rio:        { name: 'Carnival',        gradient: 'linear-gradient(135deg, #0a100a 0%, #121e0c 40%, #1a2c10 65%, #213514 100%)', accentColor: '#eab308', particleColor: '#fcd34d' },
  'cape town':{ name: 'Table Mountain',  gradient: 'linear-gradient(135deg, #080e1a 0%, #0e1a30 40%, #142645 65%, #1a3058 100%)', accentColor: '#0ea5e9', particleColor: '#38bdf8' },

  // Southeast Asia
  'ho chi minh city': { name: 'Saigon Heat', gradient: 'linear-gradient(135deg, #120c02 0%, #1f1505 40%, #2d1e08 65%, #3a270a 100%)', accentColor: '#d97706', particleColor: '#fbbf24' },

  // Additional European
  amsterdam:  { name: 'Canal Lights',    gradient: 'linear-gradient(135deg, #080e1a 0%, #0e1a30 40%, #142645 65%, #1a3058 100%)', accentColor: '#3b82f6', particleColor: '#60a5fa' },
  prague:     { name: 'Bohemian',        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #141435 40%, #1c1c4a 65%, #222258 100%)', accentColor: '#6366f1', particleColor: '#818cf8' },
  dubrovnik:  { name: 'Adriatic',        gradient: 'linear-gradient(135deg, #06101a 0%, #0b1c30 40%, #102845 65%, #143258 100%)', accentColor: '#38bdf8', particleColor: '#7dd3fc' },
  edinburgh:  { name: 'Highland Mist',   gradient: 'linear-gradient(135deg, #0e1014 0%, #1a1e24 40%, #262c34 65%, #313840 100%)', accentColor: '#9ca3af', particleColor: '#d1d5db' },
  vienna:     { name: 'Imperial Gold',   gradient: 'linear-gradient(135deg, #120c02 0%, #1f1505 40%, #2d1e08 65%, #3a270a 100%)', accentColor: '#d97706', particleColor: '#fbbf24' },
  copenhagen: { name: 'Nordic Clean',    gradient: 'linear-gradient(135deg, #080e1a 0%, #0e1a30 40%, #142645 65%, #1a3058 100%)', accentColor: '#60a5fa', particleColor: '#93c5fd' },
};

const CONTINENT_MOOD_FALLBACK: Record<string, DestinationMood> = {
  'Asia':           { name: 'Eastern Glow',  gradient: 'linear-gradient(135deg, #0c0618 0%, #1a0d38 40%, #261452 65%, #2d1960 100%)', accentColor: '#a78bfa', particleColor: '#c4b5fd' },
  'Europe':         { name: 'Continental',   gradient: 'linear-gradient(135deg, #0a0a1a 0%, #141435 40%, #1c1c4a 65%, #222258 100%)', accentColor: '#818cf8', particleColor: '#a5b4fc' },
  'North America':  { name: 'New World',     gradient: 'linear-gradient(135deg, #080e1a 0%, #0e1a30 40%, #142645 65%, #1a3058 100%)', accentColor: '#60a5fa', particleColor: '#93c5fd' },
  'South America':  { name: 'Carnival',      gradient: 'linear-gradient(135deg, #0a100a 0%, #121e0c 40%, #1a2c10 65%, #213514 100%)', accentColor: '#eab308', particleColor: '#fcd34d' },
  'Africa':         { name: 'Savanna',       gradient: 'linear-gradient(135deg, #140e04 0%, #231806 40%, #322208 65%, #3d2a0a 100%)', accentColor: '#d97706', particleColor: '#fbbf24' },
  'Oceania':        { name: 'Pacific',       gradient: 'linear-gradient(135deg, #06101a 0%, #0b1c30 40%, #102845 65%, #143258 100%)', accentColor: '#38bdf8', particleColor: '#7dd3fc' },
};

export function resolveMood(city: string, continent?: string): DestinationMood {
  const key = city.toLowerCase().trim();
  if (DESTINATION_MOODS[key]) return DESTINATION_MOODS[key];
  if (continent && CONTINENT_MOOD_FALLBACK[continent]) return CONTINENT_MOOD_FALLBACK[continent];
  return DEFAULT_MOOD;
}

export { DEFAULT_MOOD };

// ─── Vibe Dimensions ────────────────────────────────────────────────────────

export const VIBE_DIMENSIONS = [
  { id: 'relaxed',     label: 'Relaxed',      icon: 'Coffee'    as const, tags: ['relaxation', 'beach', 'spiritual'] },
  { id: 'adventurous', label: 'Adventurous',  icon: 'Mountain'  as const, tags: ['adventure', 'mountain', 'winter-sports', 'nature'] },
  { id: 'romantic',    label: 'Romantic',      icon: 'Heart'     as const, tags: ['romantic'] },
  { id: 'culture',     label: 'Culture',       icon: 'Landmark'  as const, tags: ['cultural', 'historical', 'artsy'] },
  { id: 'nightlife',   label: 'Nightlife',     icon: 'Music'     as const, tags: ['nightlife', 'party'] },
  { id: 'nature',      label: 'Nature',        icon: 'TreePine'  as const, tags: ['nature', 'eco-friendly', 'off-the-beaten-path'] },
  { id: 'luxury',      label: 'Luxury',        icon: 'Crown'     as const, tags: ['luxury'] },
  { id: 'budget',      label: 'Budget',        icon: 'Wallet'    as const, tags: ['backpacker'] },
] as const;

export function computeVibeScores(tags: string[], dailyBudgetMid?: number): { id: string; label: string; score: number }[] {
  const tagSet = new Set(tags.map(t => t.toLowerCase()));
  const results = VIBE_DIMENSIONS.map(dim => {
    let score = 0;
    if (dim.tags.length > 0) {
      const matched = dim.tags.filter(t => tagSet.has(t)).length;
      score = matched / dim.tags.length;
    }
    // Budget dimension: factor in actual cost
    if (dim.id === 'budget' && dailyBudgetMid != null) {
      if (dailyBudgetMid < 60) score = Math.max(score, 1.0);
      else if (dailyBudgetMid < 100) score = Math.max(score, 0.7);
      else if (dailyBudgetMid < 150) score = Math.max(score, 0.4);
      else score = Math.max(score, 0.1);
    }
    return { id: dim.id, label: dim.label, score };
  });
  // Return only dimensions with score > 0, sorted by score desc, max 6
  return results.filter(d => d.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
}

// ─── Best Months ─────────────────────────────────────────────────────────────

export interface MonthScore {
  month: number;
  score: number;
  temp: number;
  rainfall: number;
  sunshine: number;
}

export function computeMonthScores(weather: { month: number; avgTempC: number; avgRainfallMm: number; sunshineHours: number }[]): MonthScore[] {
  return weather
    .slice()
    .sort((a, b) => a.month - b.month)
    .map(w => {
      const tempScore = 1 - Math.min(Math.abs(w.avgTempC - 22) / 20, 1);
      const sunScore = Math.min(w.sunshineHours / 12, 1);
      const rainPenalty = Math.min(w.avgRainfallMm / 250, 1);
      const composite = tempScore * 0.4 + sunScore * 0.35 + (1 - rainPenalty) * 0.25;
      return {
        month: w.month,
        score: Math.round(composite * 100) / 100,
        temp: w.avgTempC,
        rainfall: w.avgRainfallMm,
        sunshine: w.sunshineHours,
      };
    });
}

// ─── Itinerary Highlights ────────────────────────────────────────────────────

const TAG_HIGHLIGHTS: Record<string, string[]> = {
  beach:       ['Beach day & sunset', 'Island hopping'],
  cultural:    ['Museum & gallery tour', 'Walking heritage trail'],
  adventure:   ['Guided hiking trek', 'Zip-line or rafting'],
  foodie:      ['Street food crawl', 'Cooking class'],
  nightlife:   ['Bar & club district', 'Rooftop drinks'],
  historical:  ['Ancient site visit', 'Guided history walk'],
  nature:      ['National park visit', 'Sunrise wildlife tour'],
  romantic:    ['Couples spa day', 'Sunset dinner cruise'],
  mountain:    ['Mountain viewpoint hike', 'Cable car ride'],
  urban:       ['Skyline observation deck', 'Neighborhood walking tour'],
  relaxation:  ['Spa & wellness day', 'Lazy beach afternoon'],
  luxury:      ['Fine dining experience', 'Private tour'],
  backpacker:  ['Hostel pub crawl', 'Free walking tour'],
  artsy:       ['Art gallery hop', 'Street art walking tour'],
  'eco-friendly': ['Eco tour', 'Sustainable farm visit'],
  spiritual:   ['Temple visit', 'Meditation retreat'],
  'winter-sports': ['Skiing day trip', 'Snowshoeing'],
  'family-friendly': ['Family theme park', 'Kid-friendly museum'],
  party:       ['Club night out', 'Beach party'],
  'off-the-beaten-path': ['Hidden gem exploration', 'Local market visit'],
};

export interface ItinerarySuggestion {
  days: number;
  label: string;
  estimatedCost: number;
  highlights: string[];
}

export function generateItineraries(tags: string[], dailyBudgetMid: number): ItinerarySuggestion[] {
  const highlights: string[] = [];
  for (const tag of tags) {
    const items = TAG_HIGHLIGHTS[tag.toLowerCase()];
    if (items) {
      for (const item of items) {
        if (!highlights.includes(item)) highlights.push(item);
      }
    }
  }
  // Fallback if no highlights
  if (highlights.length === 0) {
    highlights.push('City exploration', 'Local dining', 'Sightseeing tour');
  }

  return [
    { days: 3, label: 'Weekend Escape',  estimatedCost: Math.round(dailyBudgetMid * 3), highlights: highlights.slice(0, 2) },
    { days: 7, label: 'Classic Week',     estimatedCost: Math.round(dailyBudgetMid * 7), highlights: highlights.slice(0, 3) },
    { days: 10, label: 'Deep Dive',       estimatedCost: Math.round(dailyBudgetMid * 10), highlights: highlights.slice(0, 4) },
  ];
}

// ─── Search Placeholder Prompts ──────────────────────────────────────────────

export const HERO_PLACEHOLDERS = [
  'Search anywhere...',
  'Try "Tokyo"',
  'Try "Lisbon"',
  'Try "Banff"',
  'Try "Santorini"',
  'Try "Barcelona"',
];

export const DESTINATION_CHIPS = [
  'Tokyo', 'Lisbon', 'Banff', 'Santorini', 'Paris', 'Bali',
];
