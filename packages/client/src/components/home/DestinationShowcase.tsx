import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Thermometer, DollarSign } from 'lucide-react';
import { Image } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CompareToggleButton } from '@/components/compare/CompareToggleButton';
import type { DestinationSummary } from '@voyage-matcher/shared';

interface DestinationShowcaseProps {
  destinations: DestinationSummary[];
}

export function DestinationShowcase({ destinations }: DestinationShowcaseProps) {
  if (!destinations.length) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.slice(0, 6).map((dest, i) => {
        const isHero = i === 0;
        const compareCandidate = {
          id: dest.id,
          city: dest.city,
          country: dest.country,
          continent: dest.continent,
          imageUrl: dest.imageUrl,
        };
        return (
          <motion.div
            key={dest.id}
            className={cn(
              'group relative',
              isHero && 'sm:col-span-2 sm:row-span-2'
            )}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ 
              duration: 0.6, 
              delay: i * 0.08,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <CompareToggleButton destination={compareCandidate} className="absolute left-4 top-4 z-20" />
            <Link to={`/destinations/${dest.id}`} className="block h-full">
              <div className="glass-card-premium h-full overflow-hidden">
                <div className={cn(
                  'relative overflow-hidden',
                  isHero ? 'h-72 sm:h-full sm:min-h-[420px]' : 'h-56'
                )}>
                  {/* Image */}
                  {dest.imageUrl ? (
                    <Image
                      src={dest.imageUrl}
                      alt={dest.city}
                      className="h-full w-full"
                      aspectRatio="auto"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-voyage-500/30 to-aurora/30" />
                  )}

                  {/* Enhanced gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-canvas/60 via-transparent to-transparent" />
                  
                  {/* Hover vignette */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,14,26,0.4)_100%)]" />

                  {/* Top right arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-slate-50" />
                    </div>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <motion.div
                      initial={false}
                      className="transform transition-transform duration-300 group-hover:translate-y-0"
                    >
                      {/* Tags for hero */}
                      {isHero && dest.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {dest.tags.slice(0, 3).map((t) => (
                            <span
                              key={t.tag}
                              className="rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/[0.15] px-2.5 py-0.5 text-[10px] font-medium text-slate-100/90"
                            >
                              {t.tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* City name */}
                      <h3 className={cn(
                        'font-display font-bold text-slate-50 tracking-tight',
                        isHero ? 'text-2xl sm:text-4xl' : 'text-xl'
                      )}>
                        {dest.city}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm mt-2">
                        <MapPin className="h-3.5 w-3.5 text-aurora-light" />
                        {dest.country}
                      </div>

                      {/* Description for hero */}
                      {isHero && dest.description && (
                        <p className="mt-3 text-sm text-slate-400 line-clamp-2 hidden sm:block max-w-lg">
                          {dest.description}
                        </p>
                      )}

                      {/* Quick stats */}
                      <div className="flex items-center gap-3 mt-4">
                        {dest.costs && (
                          <div className="flex items-center gap-1 text-xs text-slate-300 bg-white/[0.08] backdrop-blur-sm rounded-full px-2.5 py-1">
                            <DollarSign className="h-3 w-3 text-emerald-400" />
                            ${Math.round(dest.costs.dailyBudgetMid)}/day
                          </div>
                        )}
                        {dest.safety && (
                          <div className="flex items-center gap-1 text-xs text-slate-300 bg-white/[0.08] backdrop-blur-sm rounded-full px-2.5 py-1">
                            <Thermometer className="h-3 w-3 text-amber-400" />
                            Safety: {dest.safety.safetyScore}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Card footer for non-hero */}
                {!isHero && (
                  <div className="p-4">
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {dest.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dest.tags.slice(0, 3).map((t) => (
                        <span
                          key={t.tag}
                          className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-400 hover:bg-white/[0.08] hover:text-slate-300 transition-colors"
                        >
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
