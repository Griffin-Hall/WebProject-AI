import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { FloatingParticles } from '@/components/hero/FloatingParticles';

export function CTASection() {
  return (
    <section className="relative py-24 bg-night overflow-hidden">
      <FloatingParticles />

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-voyage-600/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-aurora/15 blur-[100px]" />
      </div>

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
          <p className="mt-4 text-white/50 max-w-lg mx-auto">
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
