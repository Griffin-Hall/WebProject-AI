import { motion } from 'framer-motion';
import { Brain, BarChart3, Cloud, Code2, Zap, Monitor } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { Card } from '@/components/ui';

const techCards = [
  {
    icon: Brain,
    title: 'Natural Language Processing',
    desc: 'LLM-powered intent extraction from plain English trip descriptions',
  },
  {
    icon: BarChart3,
    title: 'Multi-Dimensional Scoring',
    desc: '4-axis weighted scoring algorithm across weather, budget, safety, and vibe',
  },
  {
    icon: Cloud,
    title: 'Real Climate Data',
    desc: 'Monthly weather analysis with temperature, rainfall, and sunshine hours',
  },
  {
    icon: Code2,
    title: 'Full-Stack TypeScript',
    desc: 'React + Node.js monorepo with shared types and validation schemas',
  },
  {
    icon: Zap,
    title: 'Smart Caching',
    desc: 'TanStack Query with optimistic updates and intelligent cache invalidation',
  },
  {
    icon: Monitor,
    title: 'Responsive & Accessible',
    desc: 'Mobile-first design with semantic HTML and keyboard navigation',
  },
];

const stats = [
  { value: 150, suffix: '+', label: 'Destinations' },
  { value: 4, suffix: '', label: 'AI Dimensions' },
  { value: 12, suffix: '', label: 'Months Weather Data' },
  { value: 3, suffix: '', label: 'Budget Tiers' },
];

export function AboutSection() {
  return (
    <section className="py-20 bg-gray-50/50">
      <div className="container-narrow">
        <SectionHeading
          badge="Under the Hood"
          title="Built with Intelligence"
          subtitle="A full-stack portfolio project showcasing AI integration, modern web architecture, and data-driven UX"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="p-5 h-full group hover:shadow-md hover:border-aurora/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-voyage-50 text-voyage-600 group-hover:bg-gradient-to-br group-hover:from-voyage-50 group-hover:to-aurora/10 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-gray-900 tracking-tight">
                        {card.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <motion.div
          className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold gradient-ai-text">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
