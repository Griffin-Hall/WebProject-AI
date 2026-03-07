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
        'rounded-2xl bg-white dark:bg-night-light border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden',
        hover && 'transition-all duration-300 hover:shadow-xl hover:shadow-voyage-200/30 hover:-translate-y-1.5',
        glow && 'transition-all duration-300 hover:shadow-lg hover:shadow-aurora/20 hover:border-aurora/20',
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = 'Card';
