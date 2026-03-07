import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroAmbientOverlayProps {
  reducedMotion: boolean;
  pointerX: number;
  pointerY: number;
  searchActive: boolean;
}

interface MapNode {
  id: string;
  x: number;
  y: number;
}

const MAP_NODES: MapNode[] = [
  { id: 'nyc', x: 22, y: 38 },
  { id: 'rio', x: 30, y: 69 },
  { id: 'lisbon', x: 45, y: 35 },
  { id: 'cairo', x: 54, y: 42 },
  { id: 'dubai', x: 62, y: 45 },
  { id: 'bangkok', x: 76, y: 52 },
  { id: 'tokyo', x: 84, y: 37 },
  { id: 'sydney', x: 87, y: 76 },
];

const ROUTES: Array<[string, string]> = [
  ['nyc', 'lisbon'],
  ['lisbon', 'dubai'],
  ['dubai', 'bangkok'],
  ['bangkok', 'tokyo'],
  ['tokyo', 'sydney'],
  ['rio', 'lisbon'],
];

function buildCurvePath(from: MapNode, to: MapNode) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - Math.max(5, Math.abs(from.x - to.x) * 0.14);
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}

export function HeroAmbientOverlay({
  reducedMotion,
  pointerX,
  pointerY,
  searchActive,
}: HeroAmbientOverlayProps) {
  const routePaths = useMemo(() => {
    return ROUTES.map(([fromId, toId]) => {
      const from = MAP_NODES.find((node) => node.id === fromId)!;
      const to = MAP_NODES.find((node) => node.id === toId)!;
      return {
        id: `${fromId}-${toId}`,
        from,
        to,
        path: buildCurvePath(from, to),
      };
    });
  }, []);

  const translateTravelLayer = reducedMotion
    ? { x: 0, y: 0 }
    : { x: pointerX * -10, y: pointerY * -8 };
  const translateAiLayer = reducedMotion ? { x: 0, y: 0 } : { x: pointerX * 14, y: pointerY * 12 };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        animate={translateTravelLayer}
        transition={{ type: 'spring', stiffness: 35, damping: 16, mass: 0.5 }}
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148, 163, 184, 0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.24) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={translateTravelLayer}
        transition={{ type: 'spring', stiffness: 25, damping: 14, mass: 0.6 }}
      >
        <svg
          className="h-full w-full opacity-65"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="heroRouteStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(72, 175, 255, 0.0)" />
              <stop offset="45%" stopColor="rgba(72, 175, 255, 0.38)" />
              <stop offset="100%" stopColor="rgba(20, 116, 255, 0.0)" />
            </linearGradient>
            <linearGradient id="heroNetworkStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.08)" />
            </linearGradient>
          </defs>

          {routePaths.map((route, index) => (
            <g key={route.id}>
              <motion.path
                d={route.path}
                fill="none"
                stroke="url(#heroRouteStroke)"
                strokeWidth={0.22}
                strokeLinecap="round"
                strokeDasharray={reducedMotion ? undefined : '0.9 0.7'}
                animate={
                  reducedMotion
                    ? { opacity: 0.35 }
                    : {
                        strokeDashoffset: [0, -3.2],
                        opacity: [0.2, 0.42, 0.2],
                      }
                }
                transition={{
                  duration: 8 + index * 0.6,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {!reducedMotion && (
                <motion.path
                  d={route.path}
                  fill="none"
                  stroke="url(#heroNetworkStroke)"
                  strokeWidth={0.12}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.34, 0] }}
                  transition={{
                    duration: 5.6,
                    repeat: Infinity,
                    delay: index * 1.2,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </g>
          ))}
        </svg>

        {!reducedMotion &&
          routePaths.slice(0, 4).map((route, index) => {
            const midX = (route.from.x + route.to.x) / 2;
            const midY = (route.from.y + route.to.y) / 2 - 5;
            return (
              <motion.div
                key={`plane-${route.id}`}
                className="absolute text-voyage-300/65"
                style={{ left: `${midX}%`, top: `${midY}%`, transform: 'translate(-50%, -50%)' }}
                animate={{
                  x: [0, 3, 0],
                  y: [0, -4, 0],
                  rotate: [-8, 6, -8],
                  opacity: [0.25, 0.75, 0.25],
                }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  delay: index * 0.7,
                  ease: 'easeInOut',
                }}
              >
                <Plane className="h-3.5 w-3.5" />
              </motion.div>
            );
          })}
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={translateAiLayer}
        transition={{ type: 'spring', stiffness: 24, damping: 13, mass: 0.55 }}
      >
        {MAP_NODES.map((node, index) => (
          <div
            key={node.id}
            className="absolute"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className={cn(
                'relative flex h-6 w-6 items-center justify-center rounded-full',
                searchActive ? 'bg-voyage-400/22' : 'bg-voyage-500/14',
              )}
              animate={
                reducedMotion
                  ? { scale: 1 }
                  : searchActive
                    ? { scale: [1, 1.28, 1] }
                    : { scale: [1, 1.12, 1] }
              }
              transition={{
                duration: searchActive ? 1.4 : 2.6,
                repeat: Infinity,
                delay: index * 0.15,
              }}
            >
              <MapPin className="h-3.5 w-3.5 text-voyage-200/80" />
            </motion.div>
            {!reducedMotion && (
              <motion.span
                className="absolute inset-0 rounded-full border border-voyage-300/35"
                animate={{ scale: [1, 1.8], opacity: [0.45, 0] }}
                transition={{
                  duration: searchActive ? 1.5 : 2.8,
                  repeat: Infinity,
                  delay: 0.25 + index * 0.2,
                }}
              />
            )}
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-voyage-300/10 to-transparent"
        animate={
          reducedMotion
            ? { opacity: 0.1 }
            : {
                x: ['0%', '260%'],
                opacity: searchActive ? [0, 0.28, 0] : [0, 0.16, 0],
              }
        }
        transition={{
          duration: searchActive ? 3.2 : 6.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
