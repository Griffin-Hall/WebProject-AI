import { motion } from 'framer-motion';
import { Brain, BarChart3, Cloud, Code2, Zap, Monitor } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

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
    <section className="py-20 relative">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

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
                <div className="glass-card p-5 h-full group">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-voyage-400 group-hover:text-aurora-light group-hover:border-aurora/20 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-white tracking-tight">
                        {card.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
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
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
