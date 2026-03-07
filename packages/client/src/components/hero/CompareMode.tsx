import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight } from 'lucide-react';
import type { MatchResult, DestinationDetail } from '@voyage-matcher/shared';
import { CompareCard } from './CompareCard';
import { HeroSearchBar } from './HeroSearchBar';
import { resolveMood } from './heroConstants';

interface CompareModeProps {
  primary: MatchResult;
  primaryDetail: DestinationDetail | null;
  secondary: MatchResult | null;
  secondaryDetail: DestinationDetail | null;
  onSearch: (query: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export function CompareMode({
  primary,
  primaryDetail,
  secondary,
  secondaryDetail,
  onSearch,
  onClose,
  loading = false,
}: CompareModeProps) {
  const primaryMood = resolveMood(primary.city, primary.continent);
  const secondaryMood = secondary ? resolveMood(secondary.city, secondary.continent) : primaryMood;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <ArrowLeftRight className="h-4 w-4 text-aurora-light" />
          <span className="font-medium">Compare Destinations</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4 text-white/60" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
          {/* Primary card */}
          <CompareCard
            result={primary}
            detail={primaryDetail}
            accentColor={primaryMood.accentColor}
            delay={0.1}
          />

          {/* Divider / VS */}
          <div className="flex items-center justify-center lg:flex-col gap-2 py-2 lg:py-0 lg:px-2">
            <div className="h-px lg:h-auto lg:w-px flex-1 bg-white/10" />
            <span className="text-[10px] text-white/30 font-bold">VS</span>
            <div className="h-px lg:h-auto lg:w-px flex-1 bg-white/10" />
          </div>

          {/* Secondary card or search */}
          {secondary ? (
            <CompareCard
              result={secondary}
              detail={secondaryDetail}
              accentColor={secondaryMood.accentColor}
              delay={0.2}
            />
          ) : (
            <motion.div
              className="flex-1 rounded-xl border-2 border-dashed border-white/[0.12] flex flex-col items-center justify-center gap-4 p-6 min-h-[300px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-xs text-white/40">Search a destination to compare</p>
              <div className="w-full max-w-xs">
                <HeroSearchBar onSearch={onSearch} compact loading={loading} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
