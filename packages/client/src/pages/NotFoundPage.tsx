import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui';
import { FloatingParticles } from '@/components/hero/FloatingParticles';

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center text-center px-4 overflow-hidden">
      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <p className="font-display text-8xl font-extrabold gradient-ai-text mb-4">404</p>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="mx-auto mb-6"
        >
          <Compass className="h-12 w-12 text-aurora/40" />
        </motion.div>

        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Lost in transit
        </h1>
        <p className="mt-3 text-slate-500 max-w-md">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <Link to="/">
          <Button variant="ai" className="mt-6">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
