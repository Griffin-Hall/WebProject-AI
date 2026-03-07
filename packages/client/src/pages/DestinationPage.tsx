import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, ArrowLeft, ExternalLink, Globe, Heart, Share2, Info, Thermometer, DollarSign, Shield } from 'lucide-react';
import { useDestination } from '@/hooks/useDestinations';
import { WeatherChart } from '@/components/destination/WeatherChart';
import { CostBreakdown } from '@/components/destination/CostBreakdown';
import { SafetyBadge } from '@/components/destination/SafetyBadge';
import { TagList } from '@/components/destination/TagList';
import { CityAIAssistant } from '@/components/destination/CityAIAssistant';
import { Button, Skeleton, Image } from '@/components/ui';
import { cn } from '@/lib/utils';

export function DestinationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: destination, isLoading, isError } = useDestination(id!);
  const [isLiked, setIsLiked] = useState(false);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-[60vh] w-full rounded-none" />
        <div className="container-narrow py-8 space-y-6">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <MapPin className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Destination not found
          </h2>
          <p className="mt-2 text-slate-500">
            We couldn't find the destination you're looking for.
          </p>
          <Link to="/destinations">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse destinations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tags = destination.tags.map((t) => t.tag);

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute -inset-2"
          style={{ y: heroY, scale: heroScale, willChange: 'transform' }}
        >
          {destination.imageUrl ? (
            <Image
              src={destination.imageUrl}
              alt={`${destination.city}, ${destination.country}`}
              className="w-full h-full"
              aspectRatio="auto"
              objectFit="cover"
              loadingIndicator={false}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-voyage-900 via-canvas to-aurora/20" />
          )}
        </motion.div>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/40 via-transparent to-canvas/40" />
        
        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,14,26,0.4) 100%)'
          }}
        />

        {/* Top Navigation Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 z-20 p-6"
          style={{ opacity: heroOpacity }}
        >
          <div className="flex items-center justify-between">
            <Link to="/destinations">
              <motion.button 
                className="flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm text-slate-50 hover:bg-white/[0.08] transition-all group"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </motion.button>
            </Link>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                  isLiked 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'glass-dark text-slate-50 hover:bg-white/[0.08]'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
              </motion.button>
              <motion.button
                className="h-10 w-10 rounded-full glass-dark text-slate-50 flex items-center justify-center hover:bg-white/[0.08] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${destination.city}, ${destination.country}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-narrow pb-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Continent badge */}
              <motion.div 
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] px-3 py-1 text-xs text-slate-100/90 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Globe className="h-3 w-3" />
                {destination.continent}
              </motion.div>

              {/* City Name */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-50 tracking-tight leading-none">
                {destination.city}
              </h1>

              {/* Country & Location */}
              <motion.div 
                className="mt-4 flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 text-lg text-slate-100/90">
                  <MapPin className="h-5 w-5 text-aurora-light" />
                  <span>{destination.country}</span>
                </div>
                {destination.safety && (
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-slate-600">•</span>
                    <SafetyBadge safety={destination.safety} size="sm" />
                  </div>
                )}
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                className="mt-6 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {destination.costs && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] px-3 py-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-slate-100/90">
                      ${Math.round(destination.costs.dailyBudgetMid)}
                      <span className="text-slate-500">/day</span>
                    </span>
                  </div>
                )}
                {destination.weather.length > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] px-3 py-1.5">
                    <Thermometer className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-slate-100/90">
                      {Math.round(destination.weather.reduce((a, b) => a + b.avgTempC, 0) / destination.weather.length)}°C
                      <span className="text-slate-500"> avg</span>
                    </span>
                  </div>
                )}
                {destination.safety && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] px-3 py-1.5 sm:hidden">
                    <Shield className="h-4 w-4 text-voyage-400" />
                    <span className="text-sm text-slate-100/90">
                      {destination.safety.safetyScore}
                      <span className="text-slate-500">/100</span>
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-narrow py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="glass-card-premium p-6 lg:p-8">
                <h2 className="font-display text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-aurora-light" />
                  About {destination.city}
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {destination.description}
                </p>
                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <TagList tags={tags} />
                </div>
              </div>
            </motion.div>

            {/* Weather Chart */}
            {destination.weather.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <WeatherChart weather={destination.weather} />
              </motion.div>
            )}

            {/* Cost Breakdown */}
            {destination.costs && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CostBreakdown costs={destination.costs} />
              </motion.div>
            )}

            {/* AI Assistant Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CityAIAssistant 
                city={destination.city} 
                country={destination.country}
                continent={destination.continent}
                tags={tags}
                safetyScore={destination.safety?.safetyScore}
                dailyBudgetMid={destination.costs?.dailyBudgetMid}
                className="min-h-[500px]"
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Safety Card */}
            {destination.safety && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SafetyBadge safety={destination.safety} size="lg" />
              </motion.div>
            )}

            {/* Book Trip Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="glass-card-premium p-5">
                <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-aurora-light" />
                  Book your trip
                </h3>
                <div className="space-y-3">
                  <motion.a
                    href={`https://www.skyscanner.com/transport/flights/dest/${encodeURIComponent(destination.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-voyage-500/10 to-voyage-600/10 hover:from-voyage-500/20 hover:to-voyage-600/20 border border-voyage-500/20 hover:border-voyage-500/30 px-4 py-3.5 transition-all"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <span className="text-sm font-medium text-voyage-300 block">Search Flights</span>
                      <span className="text-xs text-slate-500">Find the best deals</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-voyage-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.a>

                  <motion.a
                    href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-coral/10 to-coral-dark/10 hover:from-coral/20 hover:to-coral-dark/20 border border-coral/20 hover:border-coral/30 px-4 py-3.5 transition-all"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <span className="text-sm font-medium text-coral-light block">Search Hotels</span>
                      <span className="text-xs text-slate-500">Book your stay</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-coral group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.a>

                  <motion.a
                    href={`https://www.google.com/maps/place/${encodeURIComponent(destination.city + ', ' + destination.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] px-4 py-3.5 transition-all"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-300 block">View on Map</span>
                      <span className="text-xs text-slate-500">Explore the area</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card-premium p-5"
            >
              <h3 className="font-display font-semibold text-white mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Continent</span>
                  <span className="text-slate-300">{destination.continent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Country</span>
                  <span className="text-slate-300">{destination.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="text-slate-300 font-mono text-xs">
                    {destination.lat.toFixed(2)}, {destination.lng.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationPage;
