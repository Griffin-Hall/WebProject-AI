export interface UserPreferences {
  id: string;
  userId: string;
  budgetLevel: 'budget' | 'mid' | 'luxury' | null;
  tempPreference: 'cold' | 'mild' | 'warm' | 'hot' | null;
  safetyPriority: 'low' | 'medium' | 'high' | null;
  preferredVibes: string[];
}

export interface UpdatePreferencesRequest {
  budgetLevel?: 'budget' | 'mid' | 'luxury' | null;
  tempPreference?: 'cold' | 'mild' | 'warm' | 'hot' | null;
  safetyPriority?: 'low' | 'medium' | 'high' | null;
  preferredVibes?: string[];
}
