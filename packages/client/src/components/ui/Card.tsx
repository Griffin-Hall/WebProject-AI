import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden',
        hover && 'transition-all duration-300 hover:shadow-xl hover:shadow-voyage-500/10 hover:-translate-y-1.5 hover:border-white/[0.1]',
        glow && 'transition-all duration-300 hover:shadow-lg hover:shadow-aurora/15 hover:border-aurora/20',
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = 'Card';
