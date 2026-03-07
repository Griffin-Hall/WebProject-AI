import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export function SectionHeading({ badge, title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', 'mb-12')}>
      {badge && (
        <span className="inline-flex items-center rounded-full bg-aurora/10 border border-aurora/20 px-3 py-1 text-xs font-medium text-aurora-light mb-4">
          {badge}
        </span>
      )}
      <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-white">
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-3 max-w-lg text-base text-slate-400',
          align === 'center' && 'mx-auto',
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
