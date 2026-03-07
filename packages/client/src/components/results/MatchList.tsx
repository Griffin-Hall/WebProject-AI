import { MatchCard } from './MatchCard';
import { AIProcessingIndicator } from '@/components/search/AIProcessingIndicator';
import type { MatchResult } from '@voyage-matcher/shared';

interface MatchListProps {
  results: MatchResult[];
  isLoading?: boolean;
}

export function MatchList({ results, isLoading }: MatchListProps) {
  if (isLoading) {
    return <AIProcessingIndicator />;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-gray-900">No matches found</p>
        <p className="mt-2 text-gray-500">
          Try adjusting your search or describing your ideal trip differently.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((match, index) => (
        <MatchCard key={match.destinationId} match={match} rank={index + 1} index={index} />
      ))}
    </div>
  );
}
