import { Link } from 'react-router-dom';
import { Sparkles, Sun, DollarSign, Shield } from 'lucide-react';
import { HeroSection } from '@/components/hero/HeroSection';
import { FeatureCard } from '@/components/home/FeatureCard';
import { DestinationShowcase } from '@/components/home/DestinationShowcase';
import { AboutSection } from '@/components/home/AboutSection';
import { CTASection } from '@/components/home/CTASection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useFeaturedDestinations } from '@/hooks/useDestinations';

const features = [
  {
    icon: Sparkles,
    title: 'Describe Your Trip',
    description: 'Tell us your dream vacation in plain English. Our AI understands context, preferences, and vibes.',
  },
  {
    icon: Sun,
    title: 'Weather Analysis',
    description: 'Real climate data for every destination, every month. Find the perfect weather window.',
  },
  {
    icon: DollarSign,
    title: 'Budget Matching',
    description: 'Accurate daily cost estimates across budget, mid-range, and luxury tiers.',
  },
  {
    icon: Shield,
    title: 'Get Matched',
    description: 'Our scoring engine ranks destinations across four dimensions to find your ideal fit.',
  },
];

export function HomePage() {
  const { data: featured } = useFeaturedDestinations();

  return (
    <div>
      <HeroSection />

      {/* How It Works */}
      <section className="py-24 bg-gray-50/50 dark:bg-night-light/30">
        <div className="container-narrow">
          <SectionHeading
            badge="How It Works"
            title="AI-Powered Matching"
            subtitle="Our matching engine scores every destination across four dimensions to find your ideal fit."
          />

          <div className="relative rounded-3xl bg-white dark:bg-night-light border border-gray-100 dark:border-white/5 shadow-sm p-8 sm:p-10 lg:p-12">
            {/* Subtle gradient accent at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-aurora/40 to-transparent" />

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  step={i + 1}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featured && featured.length > 0 && (
        <section className="py-20 bg-gray-50/30">
          <div className="container-narrow">
            <div className="flex items-end justify-between mb-12">
              <SectionHeading
                badge="Powered by AI Analysis"
                title="Popular Destinations"
                subtitle="Explore top-rated destinations around the world."
                align="left"
              />
              <Link
                to="/destinations"
                className="hidden sm:inline-flex text-sm font-medium text-voyage-600 hover:text-voyage-700 transition-colors shrink-0 mb-12"
              >
                View all &rarr;
              </Link>
            </div>

            <DestinationShowcase destinations={featured} />
          </div>
        </section>
      )}

      <AboutSection />

      <CTASection />
    </div>
  );
}
