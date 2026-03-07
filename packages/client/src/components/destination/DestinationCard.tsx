import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ImageOff } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { Image } from '@/components/ui/Image';
import { CompareToggleButton } from '@/components/compare/CompareToggleButton';
import type { DestinationDetail, DestinationSummary } from '@voyage-matcher/shared';

interface DestinationCardProps {
  destination: DestinationDetail | DestinationSummary;
  index?: number;
}

/**
 * Fallback image component for when destination images fail to load
 */
function DestinationImageFallback({ city }: { city: string }) {
  return (
    <div className="h-full w-full bg-gradient-to-br from-voyage-500/20 to-aurora/20 flex flex-col items-center justify-center p-4">
      <ImageOff className="h-8 w-8 text-slate-500 mb-2" />
      <span className="text-xs text-slate-500 text-center">{city}</span>
    </div>
  );
}

/**
 * Destination Card Component
 * 
 * Optimized with memo to prevent unnecessary re-renders and image flickering.
 * Uses the Image component for optimized loading with proper fallbacks.
 * Includes defensive image handling with graceful error states.
 */
export const DestinationCard = memo(function DestinationCard({ 
  destination, 
  index = 0 
}: DestinationCardProps) {
  // Safely access nested data with fallbacks
  const safetyScore = destination.safety?.safetyScore;
  const dailyBudgetMid = destination.costs?.dailyBudgetMid;
  const tags = destination.tags?.slice(0, 3) ?? [];
  
  // Validate image URL
  const hasValidImage = destination.imageUrl && 
    typeof destination.imageUrl === 'string' && 
    destination.imageUrl.startsWith('http');

  const compareCandidate = {
    id: destination.id,
    city: destination.city,
    country: destination.country,
    continent: destination.continent,
    imageUrl: destination.imageUrl,
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      layout={false} // Prevent layout animations that can cause flicker
    >
      <CompareToggleButton destination={compareCandidate} className="absolute left-3 top-3 z-30" />
      <Link to={`/destinations/${destination.id}`}>
        <Card hover className="group h-full overflow-hidden">
          <div className="relative h-48 overflow-hidden bg-canvas">
            {/* Image with proper loading states and fallback */}
            {hasValidImage ? (
              <Image
                src={destination.imageUrl ?? undefined}
                alt={`${destination.city}, ${destination.country}`}
                className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                aspectRatio="auto"
                objectFit="cover"
                loadingIndicator={false} // Disable internal indicator, use skeleton below
                fallback={<DestinationImageFallback city={destination.city} />}
              />
            ) : (
              <DestinationImageFallback city={destination.city} />
            )}
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-canvas/20 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-display text-lg font-bold text-slate-50 tracking-tight truncate">
                {destination.city}
              </h3>
              <div className="flex items-center gap-1 text-slate-100/90 text-sm">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{destination.country}</span>
              </div>
            </div>
            
            {/* Safety badge */}
            {typeof safetyScore === 'number' && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant={safetyScore >= 70 ? 'success' : safetyScore >= 50 ? 'warning' : 'danger'}
                  className="text-[10px]"
                >
                  Safety: {safetyScore}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Card body */}
          <div className="p-4">
            <p className="text-sm text-slate-500 line-clamp-2">
              {destination.description || 'No description available.'}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span
                    key={t.tag}
                    className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-400"
                  >
                    {t.tag}
                  </span>
                ))}
              </div>
              {typeof dailyBudgetMid === 'number' && (
                <span className="text-xs text-slate-500 shrink-0 ml-2">
                  ${Math.round(dailyBudgetMid)}/day
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
});
