import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { DestinationMood } from './heroTypes';

// Simplified dot-matrix world map
const MAP_DOTS: [number, number][] = [
  // North America
  [120,80],[130,75],[140,72],[150,70],[160,72],[170,78],[180,82],[140,85],[150,88],
  [125,90],[135,92],[145,95],[155,92],[165,90],[175,88],[130,100],[140,102],[150,105],
  [160,100],[170,98],[180,95],[120,110],[130,112],[140,115],[150,118],[160,115],
  [115,120],[125,122],[135,125],[145,128],[155,130],[110,130],[120,132],[130,135],
  [140,138],[150,140],[160,135],[170,130],[105,140],[115,142],[125,145],[135,148],
  [145,150],[155,148],[165,145],[175,140],[120,155],[130,158],[140,160],[150,162],
  [160,158],[170,155],[135,170],[145,172],[155,170],[165,168],
  // South America
  [180,210],[190,215],[200,220],[175,220],[185,225],[195,230],[205,228],
  [180,235],[190,238],[200,240],[185,248],[195,252],[205,250],
  [182,260],[192,265],[202,262],[188,275],[198,278],[185,288],[195,290],
  [190,300],[200,298],[192,310],[188,320],[195,328],[190,338],
  // Europe
  [360,72],[370,68],[380,65],[390,68],[400,72],[410,70],[420,68],[365,78],
  [375,80],[385,82],[395,85],[405,82],[415,80],[425,78],[370,90],[380,92],
  [390,95],[400,92],[410,90],[375,100],[385,102],[395,105],[405,100],[415,98],
  [380,110],[390,112],[400,115],[410,110],[385,120],[395,122],[405,118],
  // Africa
  [370,140],[380,142],[390,145],[400,148],[410,145],[365,155],[375,158],
  [385,160],[395,162],[405,158],[415,155],[370,170],[380,172],[390,175],
  [400,178],[410,175],[375,185],[385,188],[395,190],[405,192],
  [380,200],[390,202],[400,205],[385,215],[395,218],[405,215],
  [388,228],[398,230],[392,240],[398,248],[395,258],[400,265],
  [396,275],[400,280],[397,288],
  // Asia
  [430,60],[440,58],[450,55],[460,52],[470,55],[480,58],[490,60],[500,62],
  [510,58],[520,55],[530,58],[540,60],[550,62],[560,58],[570,60],
  [435,70],[445,72],[455,75],[465,78],[475,80],[485,78],[495,75],
  [505,72],[515,70],[525,72],[535,75],[545,78],[555,80],[565,75],
  [575,72],[585,70],[440,85],[450,88],[460,90],[470,92],[480,95],
  [490,92],[500,90],[510,88],[520,90],[530,92],[540,95],[550,98],
  [560,95],[570,92],[580,88],[445,100],[455,102],[465,105],[475,108],
  [485,110],[495,108],[505,105],[515,102],[525,105],[535,108],
  [545,110],[555,112],[450,115],[460,118],[470,120],[480,122],
  [490,125],[500,128],[510,130],[520,132],[530,135],[540,138],
  [550,135],[560,130],[465,130],[475,132],[485,135],[495,138],
  [505,140],[515,142],[525,145],[535,148],[545,145],[555,140],
  [480,148],[490,150],[500,152],[510,155],[520,158],[530,160],
  // Oceania
  [560,220],[570,218],[580,222],[590,225],[600,228],[610,225],[620,222],
  [565,232],[575,235],[585,238],[595,240],[605,238],[615,235],[625,232],
  [570,245],[580,248],[590,250],[600,252],[610,250],[620,245],
  [575,258],[585,260],[595,262],[605,260],[615,258],
  [640,200],[650,210],[660,220],[670,215],
];

// Convert lat/lng to SVG coordinates (viewBox: 0 0 700 360)
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 700;
  const y = ((90 - lat) / 150) * 360;
  return { x: Math.max(0, Math.min(700, x)), y: Math.max(0, Math.min(360, y)) };
}

interface WorldMapInteractiveProps {
  targetCoords?: { lat: number; lng: number } | null;
  mood?: DestinationMood;
  className?: string;
}

export function WorldMapInteractive({ targetCoords, mood, className }: WorldMapInteractiveProps) {
  const shouldReduceMotion = useReducedMotion();

  const targetSvg = useMemo(() => {
    if (!targetCoords) return null;
    return geoToSvg(targetCoords.lat, targetCoords.lng);
  }, [targetCoords]);

  // Compute viewBox based on whether we're zoomed
  const viewBox = useMemo(() => {
    if (!targetSvg) return '0 0 700 360';
    // Zoom to a 220x120 region centered on target
    const w = 220, h = 120;
    const x = Math.max(0, Math.min(700 - w, targetSvg.x - w / 2));
    const y = Math.max(0, Math.min(360 - h, targetSvg.y - h / 2));
    return `${x} ${y} ${w} ${h}`;
  }, [targetSvg]);

  const accentColor = mood?.accentColor || '#A855F7';

  return (
    <motion.svg
      viewBox={viewBox}
      className={className || 'w-full h-full'}
      aria-hidden="true"
      animate={{ viewBox }}
      transition={{
        duration: shouldReduceMotion ? 0 : 1.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <defs>
        <linearGradient id="mapPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3377ff" stopOpacity={0.6} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={0.6} />
        </linearGradient>
        <radialGradient id="pinGlow">
          <stop offset="0%" stopColor={accentColor} stopOpacity={0.6} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Map dots */}
      {MAP_DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} className="fill-white/[0.15]" />
      ))}

      {/* Flight path arcs (only in full view) */}
      {!targetSvg && (
        <>
          {[
            { from: [150, 135], to: [385, 95], control: [260, 30] },
            { from: [385, 95], to: [475, 108], control: [430, 50] },
            { from: [475, 108], to: [540, 130], control: [510, 70] },
            { from: [540, 130], to: [590, 240], control: [620, 160] },
          ].map((path, i) => {
            const d = `M ${path.from[0]} ${path.from[1]} Q ${path.control[0]} ${path.control[1]} ${path.to[0]} ${path.to[1]}`;
            return (
              <motion.path
                key={`path-${i}`}
                d={d}
                fill="none"
                stroke="url(#mapPathGradient)"
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{
                  pathLength: { duration: shouldReduceMotion ? 0 : 2, delay: shouldReduceMotion ? 0 : 0.5 + i * 0.8 },
                  opacity: { duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.5 + i * 0.8 },
                }}
              />
            );
          })}
        </>
      )}

      {/* Target pin */}
      {targetSvg && (
        <g>
          {/* Outer glow */}
          <motion.circle
            cx={targetSvg.x}
            cy={targetSvg.y}
            fill="url(#pinGlow)"
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 20, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          {/* Pulse ring */}
          <motion.circle
            cx={targetSvg.x}
            cy={targetSvg.y}
            fill="none"
            stroke={accentColor}
            strokeWidth={0.8}
            initial={{ r: 3, opacity: 0.8 }}
            animate={{ r: [3, 12, 3], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
          {/* Pin dot */}
          <motion.circle
            cx={targetSvg.x}
            cy={targetSvg.y}
            fill={accentColor}
            initial={{ r: 0 }}
            animate={{ r: 3 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 300 }}
          />
          {/* Inner bright dot */}
          <motion.circle
            cx={targetSvg.x}
            cy={targetSvg.y}
            fill="white"
            initial={{ r: 0 }}
            animate={{ r: 1.2 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
        </g>
      )}
    </motion.svg>
  );
}
