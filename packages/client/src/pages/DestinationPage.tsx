import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { useDestination } from '@/hooks/useDestinations';
import { CostBreakdown } from '@/components/destination/CostBreakdown';
import { SafetyBadge } from '@/components/destination/SafetyBadge';
import { TagList } from '@/components/destination/TagList';
import { Button, Skeleton } from '@/components/ui';

const WeatherChart = lazy(() =>
  import('@/components/destination/WeatherChart').then((m) => ({ default: m.WeatherChart })),
);

export function DestinationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: destination, isLoading, isError } = useDestination(id!);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-80 w-full rounded-none" />
        <div className="container-narrow py-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="container-narrow py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
          Destination not found
        </h2>
        <Link to="/destinations">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4" />
            Browse destinations
          </Button>
        </Link>
      </div>
    );
  }

  const tags = destination.tags.map((t) => t.tag);

  return (
    <div className="min-h-screen dark:bg-night">
      {/* Hero Image with Parallax */}
      <div className="relative h-72 sm:h-[420px] overflow-hidden">
        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={`${destination.city}, ${destination.country}`}
            className="h-[130%] w-full object-cover"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-voyage-500 to-aurora" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-aurora/5" />

        <div className="absolute top-6 left-6">
          <Link to="/destinations">
            <button className="flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-white hover:bg-white/15 transition-all group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {destination.city}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span className="text-lg">{destination.country} &middot; {destination.continent}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container-narrow py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                {destination.description}
              </p>
              <div className="mt-4">
                <TagList tags={tags} />
              </div>
            </motion.div>

            {destination.weather.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                  <WeatherChart weather={destination.weather} />
                </Suspense>
              </motion.div>
            )}

            {destination.costs && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CostBreakdown costs={destination.costs} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {destination.safety && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SafetyBadge safety={destination.safety} size="lg" />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Gradient border wrapper */}
              <div className="p-[1px] rounded-xl bg-gradient-to-br from-voyage-400 to-aurora">
                <div className="rounded-xl bg-white p-5 space-y-4">
                  <h3 className="font-display font-semibold text-gray-900">
                    Book your trip
                  </h3>
                  <div className="space-y-3">
                    <a
                      href={`https://www.skyscanner.com/transport/flights/dest/${encodeURIComponent(destination.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl bg-voyage-50 hover:bg-voyage-100 px-4 py-3 transition-all group"
                    >
                      <span className="text-sm font-medium text-voyage-700">Search Flights</span>
                      <ExternalLink className="h-4 w-4 text-voyage-500 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                    <a
                      href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl bg-coral/10 hover:bg-coral/20 px-4 py-3 transition-all group"
                    >
                      <span className="text-sm font-medium text-coral-dark">Search Hotels</span>
                      <ExternalLink className="h-4 w-4 text-coral group-hover:translate-x-0.5 transition-transform" />
                    </a>
                    <a
                      href={`https://www.google.com/maps/place/${encodeURIComponent(destination.city + ', ' + destination.country)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl bg-gray-50 hover:bg-gray-100 px-4 py-3 transition-all group"
                    >
                      <span className="text-sm font-medium text-gray-700">View on Map</span>
                      <Globe className="h-4 w-4 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
