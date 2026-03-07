import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export function SectionHeading({ badge, title, subtitle, align = 'center', dark = false }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', 'mb-12')}>
      {badge && (
        <span className="inline-flex items-center rounded-full bg-aurora/10 px-3 py-1 text-xs font-medium text-aurora-dark mb-4">
          {badge}
        </span>
      )}
      <h2 className={cn(
        'font-display text-3xl lg:text-4xl font-bold tracking-tight',
        dark ? 'text-white' : 'text-gray-900 dark:text-white',
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-3 max-w-lg text-base',
          dark ? 'text-white/60' : 'text-gray-500 dark:text-gray-400',
          align === 'center' && 'mx-auto',
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
