export interface Destination {
  id: string;
  city: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DestinationWeather {
  id: string;
  destinationId: string;
  month: number;
  avgTempC: number;
  avgRainfallMm: number;
  sunshineHours: number;
}

export interface DestinationCosts {
  id: string;
  destinationId: string;
  dailyBudgetLow: number;
  dailyBudgetMid: number;
  dailyBudgetHigh: number;
  currency: string;
  lastUpdated: string;
}

export interface DestinationSafety {
  id: string;
  destinationId: string;
  safetyScore: number;
  advisoryLevel: 'low' | 'medium' | 'high' | 'extreme';
  source: string;
  lastUpdated: string;
}

export interface DestinationTag {
  id: string;
  destinationId: string;
  tag: string;
}

export interface DestinationDetail extends Destination {
  weather: DestinationWeather[];
  costs: DestinationCosts | null;
  safety: DestinationSafety | null;
  tags: DestinationTag[];
}

/** Lightweight destination for list/card views (no weather, partial costs/safety) */
export interface DestinationSummary extends Destination {
  costs: Pick<DestinationCosts, 'dailyBudgetMid'> | null;
  safety: Pick<DestinationSafety, 'safetyScore'> | null;
  tags: Pick<DestinationTag, 'tag'>[];
}
