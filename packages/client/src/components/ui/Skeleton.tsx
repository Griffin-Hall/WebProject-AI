import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gray-200 relative overflow-hidden',
        className,
      )}
    >
      <div className="absolute inset-0 shimmer-bg" />
    </div>
  );
}
