import { Link } from 'react-router-dom';
import { Brain, CloudSun, Search, Shield } from 'lucide-react';
import { HeroSection } from '@/components/hero/HeroSection';
import { FeatureCard } from '@/components/home/FeatureCard';
import { DestinationShowcase } from '@/components/home/DestinationShowcase';
import { AboutSection } from '@/components/home/AboutSection';
import { CTASection } from '@/components/home/CTASection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useFeaturedDestinations } from '@/hooks/useDestinations';

const features = [
  {
    icon: Search,
    title: 'Start with a rough idea',
    description: 'Write the way travelers actually think: budget, mood, month, region, weather, and pace.',
  },
  {
    icon: Brain,
    title: 'Extract real intent',
    description: 'The server AI turns natural language into structured preferences the scoring engine can use.',
  },
  {
    icon: CloudSun,
    title: 'Score the tradeoffs',
    description: 'Each match is ranked across climate, daily costs, safety, and vibe instead of one generic score.',
  },
  {
    icon: Shield,
    title: 'Verify the shortlist',
    description: 'Results include match reasons and live links for weather, advisories, visa guidance, and maps.',
  },
];

export function HomePage() {
  const { data: featured } = useFeaturedDestinations();

  return (
    <div>
      <HeroSection />

      {/* How It Works */}
      <section className="relative py-20 sm:py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="container-narrow">
          <SectionHeading
            badge="Decision Engine"
            title="From vague trip idea to defensible shortlist"
            subtitle="GlobeSense makes the recommendation logic visible, so the portfolio shows product thinking as well as AI integration."
          />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featured && featured.length > 0 && (
        <section className="relative py-20 sm:py-24">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          <div className="container-narrow">
            <div className="flex items-end justify-between mb-12">
              <SectionHeading
                badge="Powered by AI Analysis"
                title="Destination data with a sense of place"
                subtitle="Real imagery, cost context, safety signals, and tags keep exploration grounded."
                align="left"
              />
              <Link
                to="/destinations"
                className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors shrink-0 mb-12"
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
