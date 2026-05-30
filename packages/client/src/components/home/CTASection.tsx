import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,rgba(244,232,193,0.06),transparent_34%,rgba(255,107,107,0.05)_72%,transparent)]" />

      <div className="container-narrow relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-aurora-light">
            <Sparkles className="h-5 w-5" />
          </div>

          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Build a smarter shortlist in one search
          </h2>
          <p className="mt-4 text-slate-500 max-w-lg mx-auto">
            Use the same AI-backed matching flow a real traveler would expect: intent extraction, ranked tradeoffs, and links for verification.
          </p>

          <Link to="/search" className="inline-block mt-8">
            <Button variant="ai" size="lg">
              Start Exploring
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
