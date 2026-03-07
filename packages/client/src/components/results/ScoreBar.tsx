import { useState, useEffect, useRef } from 'react';
import { cn, getScoreColor, formatScore } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  score: number;
  showLabel?: boolean;
  color?: string;
}

export function ScoreBar({ label, score, showLabel = true, color }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            setWidth(Math.round(score * 100));
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score]);

  const isHigh = score >= 0.7;

  const getBarColor = () => {
    if (color) return color;
    if (isHigh) return 'bg-gradient-to-r from-voyage-500 to-aurora';
    return getScoreColor(score);
  };

  return (
    <div className="flex items-center gap-3" ref={ref}>
      {showLabel && (
        <span className="text-xs text-slate-500 w-16 shrink-0">{label}</span>
      )}
      <div className="score-bar flex-1">
        <div
          className={cn(
            'score-bar-fill',
            getBarColor(),
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-400 w-10 text-right">
        {formatScore(score)}
      </span>
    </div>
  );
}
