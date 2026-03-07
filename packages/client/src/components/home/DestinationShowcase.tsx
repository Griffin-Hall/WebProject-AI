import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import type { DestinationDetail } from '@voyage-matcher/shared';

interface DestinationShowcaseProps {
  destinations: DestinationDetail[];
}

export function DestinationShowcase({ destinations }: DestinationShowcaseProps) {
  if (!destinations.length) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.slice(0, 6).map((dest, i) => {
        const isHero = i === 0;
        return (
          <motion.div
            key={dest.id}
            className={isHero ? 'sm:col-span-2 sm:row-span-2' : ''}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link to={`/destinations/${dest.id}`} className="block h-full">
              <Card hover className="group h-full">
                <div className={`relative overflow-hidden ${isHero ? 'h-72 sm:h-full sm:min-h-[400px]' : 'h-52'}`}>
                  <ResponsiveImage
                    src={dest.imageUrl ?? ''}
                    alt={dest.city}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={isHero ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className={`font-display font-bold text-white tracking-tight ${isHero ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
                      {dest.city}
                    </h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      {dest.country}
                    </div>
                    {isHero && dest.description && (
                      <p className="mt-2 text-sm text-white/70 line-clamp-2 hidden sm:block">
                        {dest.description}
                      </p>
                    )}
                  </div>
                </div>

                {!isHero && (
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {dest.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {dest.tags.slice(0, 3).map((t) => (
                        <span
                          key={t.tag}
                          className="rounded-full bg-voyage-50 px-2 py-0.5 text-[10px] font-medium text-voyage-700"
                        >
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
