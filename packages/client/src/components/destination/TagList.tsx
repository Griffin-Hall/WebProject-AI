import { motion } from 'framer-motion';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TagListProps {
  tags: string[];
  interactive?: boolean;
  size?: 'sm' | 'md';
  variant?: 'default' | 'glass';
}

const tagColors: Record<string, string> = {
  // Nature
  'beach': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'mountain': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'nature': 'bg-green-500/10 text-green-400 border-green-500/20',
  'tropical': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'island': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'desert': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'forest': 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'lake': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  
  // Culture & History
  'culture': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'history': 'bg-amber-600/10 text-amber-500 border-amber-600/20',
  'heritage': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'art': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'museum': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'architecture': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  
  // Activities
  'adventure': 'bg-red-500/10 text-red-400 border-red-500/20',
  'hiking': 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20',
  'skiing': 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  'surfing': 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  'diving': 'bg-teal-400/10 text-teal-300 border-teal-400/20',
  'nightlife': 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  'shopping': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'food': 'bg-orange-400/10 text-orange-300 border-orange-400/20',
  'wine': 'bg-red-400/10 text-red-300 border-red-400/20',
  
  // Travel styles
  'luxury': 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  'budget': 'bg-green-600/10 text-green-500 border-green-600/20',
  'backpacking': 'bg-lime-600/10 text-lime-500 border-lime-600/20',
  'romantic': 'bg-pink-400/10 text-pink-300 border-pink-400/20',
  'family': 'bg-blue-600/10 text-blue-500 border-blue-600/20',
  'solo': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'wellness': 'bg-cyan-300/10 text-cyan-200 border-cyan-300/20',
  
  // Urban
  'city': 'bg-violet-400/10 text-violet-300 border-violet-400/20',
  'metropolis': 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  'modern': 'bg-slate-400/10 text-slate-300 border-slate-400/20',
};

function getTagColor(tag: string): string {
  const normalizedTag = tag.toLowerCase();
  return tagColors[normalizedTag] || 'bg-white/[0.05] text-slate-400 border-white/[0.08]';
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

export function TagList({ 
  tags, 
  interactive = true, 
  size = 'md',
  variant = 'default' 
}: TagListProps) {
  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {tags.map((tag, index) => (
        <motion.div
          key={tag}
          variants={tagVariants}
          whileHover={interactive ? { 
            scale: 1.05, 
            y: -2,
            transition: { duration: 0.2 }
          } : {}}
          whileTap={interactive ? { scale: 0.95 } : {}}
        >
          <span
            className={cn(
              'inline-flex items-center rounded-full border capitalize transition-all',
              size === 'sm' && 'px-2 py-0.5 text-[10px]',
              size === 'md' && 'px-2.5 py-1 text-xs',
              variant === 'default' && getTagColor(tag),
              variant === 'glass' && 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12]',
              interactive && 'cursor-pointer',
            )}
          >
            {tag}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
