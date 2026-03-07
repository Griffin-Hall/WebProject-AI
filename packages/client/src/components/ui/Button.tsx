import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-voyage-600 text-slate-50 hover:bg-voyage-700 shadow-lg shadow-voyage-500/25',
  secondary: 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]',
  outline: 'border border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white',
  ghost: 'text-slate-400 hover:bg-white/[0.04] hover:text-white',
  ai: 'gradient-ai text-slate-50 shadow-lg shadow-aurora/25 hover:shadow-xl hover:shadow-aurora/30 relative overflow-hidden',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voyage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
