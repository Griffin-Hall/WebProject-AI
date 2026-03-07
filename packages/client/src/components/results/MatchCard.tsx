import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Shield, Thermometer, Sparkles, ArrowUpRight } from 'lucide-react';
import { Card, Badge, Image } from '@/components/ui';
import { ScoreBar } from './ScoreBar';
import { cn, formatBudget } from '@/lib/utils';
import { CompareToggleButton } from '@/components/compare/CompareToggleButton';
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
  const compareCandidate = {
    id: match.destinationId,
    city: match.city,
    country: match.country,
    continent: match.continent,
    imageUrl: match.imageUrl,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Card
        hover={!isTopMatch}
        glow={isTopMatch}
        className={cn('group relative overflow-hidden', isTopMatch && 'ring-1 ring-aurora/30')}
      >
        <CompareToggleButton destination={compareCandidate} className="absolute left-14 top-4 z-30" />
        <Link to={`/destinations/${match.destinationId}`} className="block">
          {/* Image Section */}
          <div className="relative h-52 overflow-hidden">
            {match.imageUrl ? (
              <Image
                src={match.imageUrl}
                alt={`${match.city}, ${match.country}`}
                className="h-full w-full"
                aspectRatio="auto"
                objectFit="cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-voyage-500/30 to-aurora/30" />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-canvas/40 via-transparent to-transparent" />

            {/* Rank badge */}
            <motion.div
              className="absolute left-4 top-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                delay: 0.3 + index * 0.05,
                stiffness: 500,
                damping: 25,
              }}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm font-mono text-xs font-bold',
                  isTopMatch
                    ? 'bg-gradient-to-br from-aurora to-voyage-500 text-slate-50 shadow-lg shadow-aurora/30'
                    : 'border border-white/10 bg-black/50 text-slate-50',
                )}
              >
                #{rank}
              </div>
            </motion.div>

            {/* Score badge */}
            <motion.div
              className="absolute right-4 top-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                delay: 0.4 + index * 0.05,
                stiffness: 500,
                damping: 25,
              }}
            >
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-slate-50 backdrop-blur-sm',
                  isHighMatch ? 'gradient-ai shadow-lg shadow-aurora/20' : 'border border-white/10 bg-black/50',
                )}
              >
                {isTopMatch && <Sparkles className="h-3 w-3 animate-pulse" />}
                {scorePercent}%
              </div>
            </motion.div>

            {/* Top Match Badge */}
            {isTopMatch && (
              <motion.div
                className="absolute left-1/2 top-4 -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-canvas shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Top Match
                </div>
              </motion.div>
            )}

            {/* City name overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <h3 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-slate-50">
                  {match.city}
                  <ArrowUpRight className="h-5 w-5 text-slate-50/60 opacity-0 transition-opacity group-hover:opacity-100" />
                </h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-slate-100/90">
                  <MapPin className="h-3.5 w-3.5" />
                  {match.country}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4 p-5">
            {/* Quick stats row */}
            <div className="flex items-start gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-slate-300">{formatBudget(match.dailyBudgetMid)}/day</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1">
                  <Shield className="h-3.5 w-3.5 text-voyage-400" />
                  <span className="text-slate-300">{match.safetyScore}/100</span>
                </div>
                {match.avgTempC !== null && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2 py-1">
                    <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-slate-300">
                      {Math.round(match.avgTempC)}&deg;C
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Score bars */}
            <div className="space-y-2">
              <ScoreBar label="Weather" score={match.scores.weather} color="bg-amber-500" />
              <ScoreBar label="Budget" score={match.scores.budget} color="bg-emerald-500" />
              <ScoreBar label="Safety" score={match.scores.safety} color="bg-voyage-500" />
              <ScoreBar label="Vibe" score={match.scores.vibe} color="bg-aurora" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {match.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="default" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {match.tags.length > 4 && (
                <span className="px-1 text-[10px] text-slate-500">+{match.tags.length - 4}</span>
              )}
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
