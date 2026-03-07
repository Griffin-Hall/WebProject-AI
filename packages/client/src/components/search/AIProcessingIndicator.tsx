import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BarChart3, Trophy } from 'lucide-react';

const STAGES = [
  { icon: Brain, text: 'Understanding your query', color: 'text-voyage-400' },
  { icon: BarChart3, text: 'Analyzing destinations', color: 'text-aurora-light' },
  { icon: Trophy, text: 'Ranking matches', color: 'text-aurora' },
];

export function AIProcessingIndicator() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const current = STAGES[stage];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated ring */}
      <div className="relative mb-8">
        <svg className="w-20 h-20" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="3"
          />
          <motion.circle
            cx="40" cy="40" r="36"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="226"
            animate={{ strokeDashoffset: [226, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3377ff" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className={`h-8 w-8 ${current.color}`} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Stage text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-lg font-medium text-white">
            {current.text}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-aurora"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= stage ? 'w-8 gradient-ai' : 'w-1.5 bg-white/[0.06]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
