import { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GlobeRef {
  /** Rotate globe to look at specific lat/lng coordinates */
  rotateTo: (lat: number, lng: number, duration?: number) => void;
  /** Add a pulsing marker at a specific location */
  addMarker: (lat: number, lng: number, id?: string) => string;
  /** Remove a marker by ID */
  removeMarker: (id: string) => void;
  /** Clear all markers */
  clearMarkers: () => void;
}

interface GlobeProps {
  /** Auto-rotation speed (0 to disable) */
  autoRotateSpeed?: number;
  /** Whether user can interact with globe */
  interactive?: boolean;
  /** Globe size in pixels */
  size?: number;
  /** Called when globe is clicked */
  onGlobeClick?: () => void;
}

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Convert lat/lng to 3D position on sphere surface */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/** Generate a unique ID */
function generateId(): string {
  return `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// SIMPLIFIED CONTINENT OUTLINES (equirectangular [lng, lat] polygons)
// These are stylized but recognizable — not GIS-accurate, but clearly
// identifiable as real continents. Coordinates in degrees.
// ============================================================================

const CONTINENT_POLYGONS: number[][][] = [
  // North America
  [
    [-130, 50], [-125, 55], [-120, 60], [-115, 65], [-105, 68], [-95, 70],
    [-85, 72], [-75, 70], [-65, 65], [-60, 55], [-65, 50], [-70, 45],
    [-75, 40], [-80, 32], [-85, 30], [-90, 28], [-97, 25], [-105, 20],
    [-100, 17], [-95, 18], [-90, 22], [-88, 18], [-87, 15], [-85, 12],
    [-83, 10], [-80, 8], [-77, 9],
    [-82, 15], [-85, 20], [-90, 25], [-95, 25],
    [-100, 28], [-105, 30], [-110, 32], [-115, 33], [-120, 35],
    [-125, 40], [-128, 45], [-130, 50],
  ],
  // Greenland
  [
    [-55, 60], [-50, 62], [-45, 65], [-40, 68], [-30, 72], [-25, 76],
    [-20, 80], [-25, 82], [-35, 83], [-45, 82], [-50, 80], [-55, 76],
    [-58, 72], [-60, 68], [-58, 65], [-55, 60],
  ],
  // South America
  [
    [-77, 10], [-75, 12], [-72, 12], [-68, 11], [-62, 10], [-60, 8],
    [-55, 5], [-52, 3], [-50, 0], [-48, -3], [-45, -7], [-40, -12],
    [-38, -15], [-36, -18], [-38, -22], [-42, -23], [-44, -23],
    [-48, -28], [-50, -30], [-53, -33], [-56, -36], [-60, -40],
    [-65, -45], [-68, -50], [-72, -52], [-75, -50], [-72, -45],
    [-70, -40], [-70, -35], [-70, -30], [-68, -25], [-70, -18],
    [-75, -12], [-78, -5], [-80, 0], [-79, 5], [-77, 10],
  ],
  // Europe
  [
    [-10, 36], [-8, 38], [-10, 40], [-8, 44], [-5, 45], [0, 44],
    [3, 44], [5, 46], [8, 48], [12, 47], [15, 46], [18, 45],
    [22, 45], [25, 42], [28, 42], [30, 45], [28, 48], [24, 50],
    [22, 52], [18, 54], [15, 55], [12, 56], [10, 58], [8, 58],
    [5, 60], [8, 62], [12, 64], [15, 66], [18, 68], [20, 70],
    [25, 72], [30, 70], [28, 68], [32, 66], [30, 62], [28, 58],
    [30, 56], [35, 55], [40, 56], [45, 58], [50, 60], [55, 62],
    [60, 65], [55, 68], [50, 68], [45, 68], [40, 68], [32, 70],
    [25, 72], [20, 72], [15, 70], [10, 68], [5, 68], [0, 68],
    [-5, 62], [-8, 58], [-10, 55], [-12, 50], [-10, 48],
    [-8, 46], [-5, 44], [-2, 42], [0, 40], [-2, 38], [-5, 36],
    [-10, 36],
  ],
  // Africa
  [
    [-15, 30], [-17, 25], [-17, 18], [-15, 12], [-12, 8], [-8, 5],
    [-5, 5], [0, 5], [5, 4], [8, 5], [10, 2], [10, 0],
    [12, -3], [15, -5], [18, -8], [22, -10], [27, -15], [30, -18],
    [33, -22], [35, -28], [33, -32], [30, -34], [27, -33], [25, -30],
    [22, -28], [18, -25], [15, -22], [12, -18], [12, -12],
    [15, -5], [18, -2], [25, 0], [30, 2], [33, 5], [38, 8],
    [40, 10], [42, 12], [45, 12], [50, 12], [48, 15],
    [45, 18], [42, 20], [38, 22], [35, 28], [33, 30], [35, 32],
    [32, 35], [28, 36], [22, 35], [15, 35], [10, 36], [5, 36],
    [0, 35], [-5, 35], [-10, 33], [-15, 30],
  ],
  // Asia (mainland)
  [
    [30, 42], [35, 40], [38, 38], [40, 35], [42, 32], [45, 30],
    [48, 28], [52, 25], [55, 22], [58, 24], [62, 24], [65, 26],
    [68, 28], [72, 30], [75, 28], [78, 25], [80, 22], [82, 18],
    [85, 15], [88, 15], [90, 18], [92, 20], [95, 18], [98, 15],
    [100, 12], [102, 10], [105, 12], [108, 15], [110, 18],
    [112, 22], [115, 25], [118, 28], [120, 30], [122, 32],
    [125, 35], [128, 38], [130, 40], [132, 42], [135, 45],
    [140, 42], [142, 45], [145, 48], [142, 50], [138, 48],
    [135, 50], [130, 48], [125, 48], [120, 50], [115, 50],
    [110, 52], [105, 55], [100, 58], [95, 60], [90, 62],
    [85, 65], [80, 68], [75, 72], [70, 72], [65, 70],
    [60, 68], [55, 65], [50, 65], [45, 62], [40, 60],
    [35, 55], [30, 50], [28, 48], [30, 45], [30, 42],
  ],
  // India subcontinent
  [
    [68, 28], [70, 25], [72, 22], [74, 18], [76, 14], [78, 10],
    [80, 8], [82, 10], [83, 14], [85, 15], [88, 18], [90, 22],
    [88, 22], [85, 22], [82, 24], [80, 26], [75, 28], [72, 30],
    [68, 28],
  ],
  // Southeast Asia / Indonesia (simplified)
  [
    [100, 5], [102, 2], [105, 0], [108, -2], [110, -5],
    [115, -7], [118, -8], [120, -8], [118, -5], [115, -2],
    [112, 0], [108, 2], [105, 5], [100, 5],
  ],
  // Australia
  [
    [115, -15], [118, -12], [122, -12], [128, -14], [132, -12],
    [135, -14], [138, -16], [140, -18], [142, -20], [145, -22],
    [148, -25], [150, -28], [152, -30], [152, -33], [150, -36],
    [148, -38], [145, -38], [140, -38], [135, -35], [130, -33],
    [128, -32], [125, -34], [120, -34], [118, -32], [115, -30],
    [113, -28], [114, -24], [114, -20], [115, -15],
  ],
  // Japan (simplified)
  [
    [130, 30], [132, 32], [134, 34], [136, 36], [138, 38],
    [140, 40], [142, 42], [144, 44], [145, 45], [143, 44],
    [140, 42], [138, 40], [136, 38], [134, 36], [132, 34],
    [130, 32], [130, 30],
  ],
  // UK / Ireland (simplified)
  [
    [-8, 52], [-6, 54], [-4, 56], [-2, 58], [0, 58], [2, 56],
    [2, 52], [0, 50], [-2, 50], [-5, 50], [-8, 52],
  ],
  // New Zealand (simplified)
  [
    [170, -36], [172, -38], [174, -40], [176, -42], [178, -44],
    [178, -46], [176, -46], [174, -44], [172, -42], [170, -40],
    [168, -38], [168, -36], [170, -36],
  ],
];

// ============================================================================
// CANVAS TEXTURE GENERATOR
// Paints a soft, stylized earth texture with recognizable continents
// ============================================================================

function generateEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Ocean gradient — soft blue with subtle depth
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#5A9BE6');
  oceanGrad.addColorStop(0.3, '#4A90E2');
  oceanGrad.addColorStop(0.7, '#3D7FCF');
  oceanGrad.addColorStop(1, '#4A8AD8');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean noise — very light wave-like texture
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 30 + 5;
    ctx.fillStyle = Math.random() > 0.5 ? '#6BB6FF' : '#3570B0';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Helper: convert [lng, lat] to canvas pixel coords (equirectangular)
  function toPixel(lng: number, lat: number): [number, number] {
    const px = ((lng + 180) / 360) * width;
    const py = ((90 - lat) / 180) * height;
    return [px, py];
  }

  // Draw continents
  const landColors = ['#8DC88A', '#A8D5A2', '#9ECF97', '#B5DCAA'];

  for (let ci = 0; ci < CONTINENT_POLYGONS.length; ci++) {
    const poly = CONTINENT_POLYGONS[ci];
    const color = landColors[ci % landColors.length];

    // Main fill
    ctx.beginPath();
    const [sx, sy] = toPixel(poly[0][0], poly[0][1]);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = toPixel(poly[i][0], poly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Soft inner highlight for depth (lighter at top-left)
    ctx.save();
    ctx.clip();
    const grd = ctx.createLinearGradient(sx - 50, sy - 50, sx + 200, sy + 200);
    grd.addColorStop(0, 'rgba(255,255,255,0.15)');
    grd.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();

    // Subtle border to define edges
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    for (let i = 1; i < poly.length; i++) {
      const [px, py] = toPixel(poly[i][0], poly[i][1]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(60, 120, 60, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Polar ice caps — very subtle white at top and bottom
  ctx.globalAlpha = 0.25;
  const iceGrad = ctx.createLinearGradient(0, 0, 0, 40);
  iceGrad.addColorStop(0, '#E8F0F8');
  iceGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, width, 40);

  const iceGrad2 = ctx.createLinearGradient(0, height - 30, 0, height);
  iceGrad2.addColorStop(0, 'transparent');
  iceGrad2.addColorStop(1, '#E8F0F8');
  ctx.fillStyle = iceGrad2;
  ctx.fillRect(0, height - 30, width, 30);
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ============================================================================
// STYLIZED EARTH COMPONENT
// ============================================================================

function Earth({ markers, onMarkerPulse }: { markers: MarkerData[]; onMarkerPulse?: () => void }) {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Group>(null);

  const earthTexture = useMemo(() => generateEarthTexture(), []);

  // Cloud positions
  const clouds = useMemo(() => [
    { lat: 30, lng: -80, scale: 0.4 },
    { lat: 50, lng: 20, scale: 0.35 },
    { lat: -10, lng: 40, scale: 0.45 },
    { lat: 40, lng: 140, scale: 0.4 },
    { lat: -30, lng: 150, scale: 0.3 },
    { lat: 60, lng: -120, scale: 0.35 },
    { lat: 10, lng: -60, scale: 0.3 },
    { lat: -40, lng: -70, scale: 0.35 },
  ], []);

  // Animate clouds slowly
  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Ocean + continents sphere — single textured mesh */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.55}
          metalness={0.05}
          emissive="#1a3a5c"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#6BB6FF"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Clouds group */}
      <group ref={cloudsRef}>
        {clouds.map((cloud, i) => {
          const pos = latLngToVector3(cloud.lat, cloud.lng, 2.12);
          return (
            <Float
              key={i}
              speed={0.5}
              rotationIntensity={0.1}
              floatIntensity={0.2}
            >
              <mesh position={pos} scale={cloud.scale}>
                <sphereGeometry args={[0.25, 12, 12]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.7}
                  roughness={0.2}
                />
              </mesh>
              {/* Cloud puff */}
              <mesh
                position={[pos.x + 0.08, pos.y + 0.04, pos.z + 0.04]}
                scale={cloud.scale * 0.6}
              >
                <sphereGeometry args={[0.2, 10, 10]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  transparent
                  opacity={0.55}
                  roughness={0.2}
                />
              </mesh>
            </Float>
          );
        })}
      </group>

      {/* Markers */}
      {markers.map((marker) => {
        const pos = latLngToVector3(marker.lat, marker.lng, 2.12);
        return (
          <Marker
            key={marker.id}
            position={pos}
            onPulse={onMarkerPulse}
          />
        );
      })}
    </group>
  );
}

// ============================================================================
// PULSING MARKER COMPONENT
// ============================================================================

function Marker({ position, onPulse }: { position: THREE.Vector3; onPulse?: () => void }) {
  const markerRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null);

  useFrame((state) => {
    if (markerRef.current) {
      // Gentle bounce
      markerRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
    if (pulseRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      pulseRef.current.scale.setScalar(scale);
      pulseRef.current.material.opacity = 0.6 - (scale - 1) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Pin head */}
      <mesh ref={markerRef} position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#FF6B6B"
          emissive="#FF4444"
          emissiveIntensity={0.3}
          roughness={0.3}
        />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={pulseRef} position={[0, 0.15, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.1, 0.12, 16]} />
        <meshBasicMaterial
          color="#FF6B6B"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// SCENE COMPONENT
// ============================================================================

interface SceneProps {
  autoRotateSpeed: number;
  interactive: boolean;
  markers: MarkerData[];
  globeRotation: React.MutableRefObject<{ lat: number; lng: number; animating: boolean }>;
  onMarkerPulse?: () => void;
}

function Scene({ autoRotateSpeed, interactive, markers, globeRotation, onMarkerPulse }: SceneProps) {
  const controlsRef = useRef<any>(null);
  const earthGroupRef = useRef<THREE.Group>(null);

  // Auto-rotation and target rotation logic
  useFrame((state, delta) => {
    if (!earthGroupRef.current) return;

    if (globeRotation.current.animating && controlsRef.current) {
      // Smooth rotation to target
      const target = globeRotation.current;
      const phi = (90 - target.lat) * (Math.PI / 180);
      const theta = (target.lng + 180) * (Math.PI / 180);

      // Convert to quaternion target
      const targetQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(phi - Math.PI / 2, theta, 0, 'YXZ')
      );

      earthGroupRef.current.quaternion.slerp(targetQuaternion, delta * 2);

      // Check if we're close enough to stop animating
      const angle = earthGroupRef.current.quaternion.angleTo(targetQuaternion);
      if (angle < 0.01) {
        target.animating = false;
      }
    } else if (autoRotateSpeed > 0 && !interactive) {
      // Gentle auto-rotation when not interacting
      earthGroupRef.current.rotation.y += delta * autoRotateSpeed * 0.1;
    }
  });

  return (
    <>
      {/* Soft ambient lighting */}
      <ambientLight intensity={0.6} color="#E8F4FF" />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.0}
        color="#FFF8E7"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim light for soft edge definition */}
      <pointLight
        position={[-5, 2, -5]}
        intensity={0.4}
        color="#A8D5FF"
      />

      {/* Fill light */}
      <pointLight
        position={[0, -3, 3]}
        intensity={0.25}
        color="#FFE4B5"
      />

      {/* Stars background */}
      <Stars
        radius={50}
        depth={20}
        count={100}
        factor={2}
        saturation={0.5}
        fade
        speed={0.2}
      />

      {/* Earth container group for rotation */}
      <group ref={earthGroupRef}>
        <Earth markers={markers} onMarkerPulse={onMarkerPulse} />
      </group>

      {/* Controls */}
      {interactive && (
        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={autoRotateSpeed > 0}
          autoRotateSpeed={autoRotateSpeed}
          dampingFactor={0.05}
          enableDamping
        />
      )}
    </>
  );
}

// ============================================================================
// WEBGL DETECTION
// ============================================================================

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// ============================================================================
// MAIN GLOBE COMPONENT
// ============================================================================

export const Globe = forwardRef<GlobeRef, GlobeProps>(
  ({ autoRotateSpeed = 0.5, interactive = true, size = 400, onGlobeClick }, ref) => {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [webglAvailable, setWebglAvailable] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const globeRotation = useRef({ lat: 0, lng: 0, animating: false });

    // Check WebGL and reduced motion on mount
    useEffect(() => {
      setWebglAvailable(isWebGLAvailable());

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      rotateTo: (lat: number, lng: number, duration = 1000) => {
        globeRotation.current = { lat, lng, animating: true };
      },
      addMarker: (lat: number, lng: number, id?: string) => {
        const markerId = id || generateId();
        setMarkers((prev) => [...prev, { id: markerId, lat, lng }]);
        return markerId;
      },
      removeMarker: (id: string) => {
        setMarkers((prev) => prev.filter((m) => m.id !== id));
      },
      clearMarkers: () => {
        setMarkers([]);
      },
    }));

    // Demo markers on mount
    useEffect(() => {
      if (!webglAvailable) return;

      // Add demo markers for Paris and Tokyo
      const timer = setTimeout(() => {
        setMarkers([
          { id: 'paris', lat: 48.8566, lng: 2.3522 },
          { id: 'tokyo', lat: 35.6762, lng: 139.6503 },
        ]);
      }, 1000);

      return () => clearTimeout(timer);
    }, [webglAvailable]);

    if (!webglAvailable) {
      return <GlobeFallback size={size} />;
    }

    return (
      <div
        className="relative cursor-grab active:cursor-grabbing"
        style={{ width: size, height: size }}
        onClick={onGlobeClick}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          <Scene
            autoRotateSpeed={prefersReducedMotion ? 0 : autoRotateSpeed}
            interactive={interactive}
            markers={markers}
            globeRotation={globeRotation}
          />
        </Canvas>

        {/* Subtle vignette overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(10, 14, 26, 0.3) 100%)',
          }}
        />
      </div>
    );
  }
);

Globe.displayName = 'Globe';

// ============================================================================
// FALLBACK SVG GLOBE (updated with more realistic continent shapes)
// ============================================================================

function GlobeFallback({ size }: { size: number }) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 10px 30px rgba(74, 144, 226, 0.3))' }}
      >
        <defs>
          <radialGradient id="oceanFallback" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#6BB6FF" />
            <stop offset="100%" stopColor="#4A90E2" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx="100" cy="100" r="80" />
          </clipPath>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean */}
        <circle cx="100" cy="100" r="80" fill="url(#oceanFallback)" />

        {/* Continents — more recognizable shapes, clipped to globe */}
        <g fill="#A8D5A2" opacity="0.9" clipPath="url(#globeClip)">
          {/* North America */}
          <path d="M35,55 Q30,65 28,75 Q30,82 35,88 Q42,95 48,98 L52,92 Q48,85 50,78 Q55,70 52,62 Q48,55 42,52 Z" />
          {/* South America */}
          <path d="M55,115 Q50,120 48,130 Q50,142 55,150 Q60,155 62,148 Q65,140 63,130 Q60,122 55,115 Z" />
          {/* Europe */}
          <path d="M92,58 Q88,62 90,68 Q94,72 98,70 Q102,66 100,60 Q96,56 92,58 Z" />
          {/* Africa */}
          <path d="M92,85 Q88,90 86,100 Q88,112 92,120 Q96,128 100,125 Q104,118 102,108 Q100,95 96,88 Z" />
          {/* Asia */}
          <path d="M110,52 Q105,56 108,65 Q115,72 125,75 Q135,72 140,65 Q142,58 138,52 Q130,48 120,48 Q115,50 110,52 Z" />
          {/* India */}
          <path d="M118,82 Q115,88 116,95 Q118,100 122,98 Q124,92 122,85 Z" />
          {/* Australia */}
          <path d="M140,118 Q135,122 134,130 Q136,136 142,138 Q148,136 150,130 Q148,122 144,118 Z" />
        </g>

        {/* Clouds */}
        <g fill="#FFFFFF" opacity="0.6" clipPath="url(#globeClip)">
          <ellipse cx="60" cy="50" rx="12" ry="5" />
          <ellipse cx="125" cy="60" rx="14" ry="5" />
          <ellipse cx="80" cy="130" rx="10" ry="4" />
        </g>

        {/* Markers */}
        <g>
          <circle cx="95" cy="65" r="3.5" fill="#FF6B6B" filter="url(#softGlow)" />
          <circle cx="138" cy="62" r="3.5" fill="#FF6B6B" filter="url(#softGlow)" />
        </g>

        {/* Atmosphere */}
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="#6BB6FF"
          strokeWidth="2"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}

export default Globe;
