import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { DESTINATION_CHIPS } from './heroConstants';

interface DestinationChipsProps {
  onSelect: (city: string) => void;
}

export function DestinationChips({ onSelect }: DestinationChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <span className="text-xs text-white/30 self-center mr-1">Try:</span>
      {DESTINATION_CHIPS.map((city, i) => (
        <motion.button
          key={city}
          onClick={() => onSelect(city)}
          className="group flex items-center gap-1.5 rounded-full bg-white/[0.07] backdrop-blur-sm px-3.5 py-1.5 text-xs text-white/50 hover:bg-white/15 hover:text-white/80 transition-all border border-white/[0.08] hover:border-white/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MapPin className="h-3 w-3 text-aurora-light/60 group-hover:text-aurora-light transition-colors" />
          {city}
        </motion.button>
      ))}
    </div>
  );
}
