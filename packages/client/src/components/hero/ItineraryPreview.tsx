import { motion } from 'framer-motion';
import { Calendar, DollarSign, ChevronRight } from 'lucide-react';
import type { ItinerarySuggestion } from './heroConstants';

interface ItineraryPreviewProps {
  itineraries: ItinerarySuggestion[];
  city: string;
  accentColor: string;
  delay?: number;
}

export function ItineraryPreview({ itineraries, city, accentColor, delay = 0 }: ItineraryPreviewProps) {
  return (
    <motion.div
      className="rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-3">
        Trip Ideas · {city}
      </h3>

      <div className="space-y-2">
        {itineraries.map((itin, i) => (
          <motion.div
            key={itin.days}
            className="group flex items-center gap-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] p-3 transition-all cursor-default"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.15 + i * 0.1, type: 'spring', stiffness: 200 }}
          >
            {/* Days badge */}
            <div
              className="flex flex-col items-center justify-center rounded-lg h-10 w-10 shrink-0"
              style={{ backgroundColor: accentColor + '20' }}
            >
              <span className="text-sm font-bold text-white/90">{itin.days}</span>
              <span className="text-[7px] text-white/50 -mt-0.5">days</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80">{itin.label}</div>
              <div className="text-[10px] text-white/40 truncate mt-0.5">
                {itin.highlights.join(' · ')}
              </div>
            </div>

            {/* Cost */}
            <div className="flex items-center gap-1 text-[10px] text-white/40 shrink-0">
              <DollarSign className="h-3 w-3" />
              <span>~${itin.estimatedCost}</span>
            </div>

            <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
