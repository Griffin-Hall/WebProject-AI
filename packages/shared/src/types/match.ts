export interface SavedMatch {
  id: string;
  userId: string;
  destinationId: string;
  searchQuery: string;
  matchScore: number;
  savedAt: string;
}

export interface SaveMatchRequest {
  destinationId: string;
  searchQuery: string;
  matchScore: number;
}
