import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-voyage-600 text-white hover:bg-voyage-700 shadow-lg shadow-voyage-500/25',
  secondary: 'bg-coral text-white hover:bg-coral-dark shadow-lg shadow-coral/25',
  outline: 'border-2 border-voyage-600 text-voyage-600 hover:bg-voyage-50',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ai: 'gradient-ai text-white shadow-lg shadow-aurora/25 hover:shadow-xl hover:shadow-aurora/30 relative overflow-hidden',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voyage-500 focus-visible:ring-offset-2',
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
