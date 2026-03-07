import { motion, useReducedMotion } from 'framer-motion';

// Simplified dot-matrix world map coordinates (x: 0-800, y: 0-400)
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
  // Oceania / Australia
  [560,220],[570,218],[580,222],[590,225],[600,228],[610,225],[620,222],
  [565,232],[575,235],[585,238],[595,240],[605,238],[615,235],[625,232],
  [570,245],[580,248],[590,250],[600,252],[610,250],[620,245],
  [575,258],[585,260],[595,262],[605,260],[615,258],
  // Pacific Islands
  [640,200],[650,210],[660,220],[670,215],
];

// Featured destination coordinates
const FEATURED_CITIES: [number, number][] = [
  [150, 135],   // New York
  [385, 95],    // Paris
  [475, 108],   // Dubai
  [540, 130],   // Bangkok
  [590, 240],   // Sydney
  [195, 245],   // Rio
];

// Flight path arcs between city pairs
const FLIGHT_PATHS = [
  { from: [150, 135], to: [385, 95], control: [260, 30] },
  { from: [385, 95], to: [475, 108], control: [430, 50] },
  { from: [475, 108], to: [540, 130], control: [510, 70] },
  { from: [540, 130], to: [590, 240], control: [620, 160] },
] as const;

export function WorldMap() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 700 360"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Subtle radial glow behind map */}
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3377ff" stopOpacity={0.05} />
          <stop offset="100%" stopColor="#3377ff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3377ff" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#A855F7" stopOpacity={0.5} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="700" height="360" fill="url(#mapGlow)" />

      {/* Map dots — dimmer for dark theme */}
      {MAP_DOTS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={1}
          className="fill-white/[0.12]"
        />
      ))}

      {/* Featured city dots with pulse */}
      {FEATURED_CITIES.map(([x, y], i) => (
        <g key={`city-${i}`}>
          {/* Outer pulse ring */}
          <circle cx={x} cy={y} r={3} fill="none" stroke="#A855F7" strokeWidth={0.5} opacity={0.3}>
            {!shouldReduceMotion && (
              <>
                <animate
                  attributeName="r"
                  values="3;8;3"
                  dur={`${3 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0;0.3"
                  dur={`${3 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
          {/* Inner glow */}
          <circle cx={x} cy={y} r={3} className="fill-aurora/20" />
          {/* Core dot */}
          <circle cx={x} cy={y} r={1.8} className="fill-aurora-light" />
        </g>
      ))}

      {/* Flight path arcs — dashed for elegance */}
      {FLIGHT_PATHS.map((path, i) => {
        const d = `M ${path.from[0]} ${path.from[1]} Q ${path.control[0]} ${path.control[1]} ${path.to[0]} ${path.to[1]}`;
        return (
          <motion.path
            key={`path-${i}`}
            d={d}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{
              pathLength: {
                duration: shouldReduceMotion ? 0 : 2,
                delay: shouldReduceMotion ? 0 : 0.5 + i * 0.8,
                ease: 'easeInOut',
              },
              opacity: {
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : 0.5 + i * 0.8,
              },
            }}
          />
        );
      })}

      {/* Traveling dots along paths */}
      {!shouldReduceMotion && FLIGHT_PATHS.map((path, i) => {
        const d = `M ${path.from[0]} ${path.from[1]} Q ${path.control[0]} ${path.control[1]} ${path.to[0]} ${path.to[1]}`;
        return (
          <g key={`traveler-${i}`}>
            <motion.circle
              r={4}
              fill="#C084FC"
              opacity={0.15}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0.15, 0] }}
              transition={{
                duration: 3,
                delay: 2 + i * 0.8,
                repeat: Infinity,
                repeatDelay: 4,
              }}
            >
              <animateMotion
                dur="3s"
                begin={`${2 + i * 0.8}s`}
                repeatCount="indefinite"
                path={d}
              />
            </motion.circle>
            <motion.circle
              r={2}
              fill="#C084FC"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 3,
                delay: 2 + i * 0.8,
                repeat: Infinity,
                repeatDelay: 4,
              }}
            >
              <animateMotion
                dur="3s"
                begin={`${2 + i * 0.8}s`}
                repeatCount="indefinite"
                path={d}
              />
            </motion.circle>
          </g>
        );
      })}
    </svg>
  );
}
