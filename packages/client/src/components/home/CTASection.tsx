import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="ambient-blob ambient-blob-voyage w-64 h-64 top-0 left-1/4 animate-drift opacity-40" />
        <div className="ambient-blob ambient-blob-aurora w-64 h-64 bottom-0 right-1/4 animate-drift-reverse opacity-30" />
      </div>

      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="container-narrow relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="h-8 w-8 text-aurora mx-auto mb-6 animate-sparkle" />

          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Ready to find your next adventure?
          </h2>
          <p className="mt-4 text-slate-500 max-w-lg mx-auto">
            Tell us what you're looking for in plain English. Our AI will analyze destinations across four dimensions to find your perfect match.
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
