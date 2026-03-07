export const VIBE_TAGS = [
  'romantic',
  'adventure',
  'nightlife',
  'cultural',
  'beach',
  'mountain',
  'foodie',
  'historical',
  'nature',
  'urban',
  'relaxation',
  'family-friendly',
  'backpacker',
  'luxury',
  'off-the-beaten-path',
  'artsy',
  'spiritual',
  'party',
  'eco-friendly',
  'winter-sports',
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number];
