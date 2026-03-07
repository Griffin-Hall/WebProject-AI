import { Check, GitCompareArrows, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  compareDestinationLimit,
  type CompareDestinationCandidate,
  useCompareDestinations,
} from '@/hooks/useCompareDestinations';

interface CompareToggleButtonProps {
  destination: CompareDestinationCandidate;
  className?: string;
}

export function CompareToggleButton({ destination, className }: CompareToggleButtonProps) {
  const { isSelected, canAddMore, toggleDestination } = useCompareDestinations();
  const selected = isSelected(destination.id);
  const disabled = !selected && !canAddMore;
  const label = selected ? 'Selected' : disabled ? `Limit ${compareDestinationLimit}` : 'Add to Compare';

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (disabled) return;
        toggleDestination(destination);
      }}
      disabled={disabled}
      title={disabled ? `You can compare up to ${compareDestinationLimit} destinations` : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md transition-all',
        selected
          ? 'border-voyage-400/45 bg-voyage-500/20 text-voyage-100 shadow-glow-sm'
          : 'border-white/[0.18] bg-canvas/65 text-slate-200 hover:border-voyage-300/40 hover:bg-voyage-500/10 hover:text-slate-100',
        disabled && 'cursor-not-allowed opacity-60 hover:bg-canvas/65',
        className,
      )}
    >
      {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      <GitCompareArrows className="h-3 w-3" />
      {label}
    </button>
  );
}
