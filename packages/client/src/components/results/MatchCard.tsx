import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Shield, Thermometer, Sparkles } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { ScoreBar } from './ScoreBar';
import { cn, formatBudget, getScoreColor } from '@/lib/utils';
import type { MatchResult } from '@voyage-matcher/shared';

interface MatchCardProps {
  match: MatchResult;
  rank: number;
  index?: number;
}

export function MatchCard({ match, rank, index = 0 }: MatchCardProps) {
  const scorePercent = Math.round(match.compositeScore * 100);
  const isTopMatch = rank === 1;
  const isHighMatch = match.compositeScore >= 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card hover={!isTopMatch} glow={isTopMatch} className={cn('group', isTopMatch && 'ring-1 ring-aurora/20')}>
        <Link to={`/destinations/${match.destinationId}`} className="block">
          <div className="relative h-48 overflow-hidden">
            <ResponsiveImage
              src={match.imageUrl ?? ''}
              alt={`${match.city}, ${match.country}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              fallbackGradient="from-voyage-400 to-voyage-600"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute top-3 left-3">
              <motion.span
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 + index * 0.05 }}
              >
                #{rank}
              </motion.span>
            </div>

            <div className="absolute top-3 right-3">
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white',
                  isHighMatch ? 'gradient-ai glow-ai-subtle' : getScoreColor(match.compositeScore),
                )}
              >
                {isTopMatch && <Sparkles className="h-3 w-3" />}
                {scorePercent}% match
              </div>
            </div>

            <div className="absolute bottom-3 left-3">
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                {match.city}
              </h3>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {match.country}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {formatBudget(match.dailyBudgetMid)}/day
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {match.safetyScore}/100
              </span>
              {match.avgTempC !== null && (
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5" />
                  {Math.round(match.avgTempC)}&deg;C
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <ScoreBar label="Weather" score={match.scores.weather} />
              <ScoreBar label="Budget" score={match.scores.budget} />
              <ScoreBar label="Safety" score={match.scores.safety} />
              <ScoreBar label="Vibe" score={match.scores.vibe} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {match.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="default" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
