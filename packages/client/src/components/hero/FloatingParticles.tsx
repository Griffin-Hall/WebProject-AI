const PARTICLES = [
  { size: 2, x: '10%', y: '20%', delay: '0s', duration: '7s', opacity: 0.3 },
  { size: 3, x: '25%', y: '60%', delay: '1s', duration: '8s', opacity: 0.2 },
  { size: 1.5, x: '40%', y: '30%', delay: '2s', duration: '6s', opacity: 0.25 },
  { size: 2.5, x: '60%', y: '70%', delay: '0.5s', duration: '9s', opacity: 0.2 },
  { size: 2, x: '75%', y: '40%', delay: '3s', duration: '7s', opacity: 0.15 },
  { size: 1.5, x: '85%', y: '15%', delay: '1.5s', duration: '8s', opacity: 0.2 },
  { size: 3, x: '15%', y: '80%', delay: '2.5s', duration: '6s', opacity: 0.15 },
  { size: 2, x: '50%', y: '50%', delay: '4s', duration: '7s', opacity: 0.2 },
  { size: 1.5, x: '90%', y: '65%', delay: '1s', duration: '9s', opacity: 0.25 },
  { size: 2, x: '5%', y: '45%', delay: '3.5s', duration: '8s', opacity: 0.2 },
  { size: 2.5, x: '70%', y: '85%', delay: '0.5s', duration: '6s', opacity: 0.15 },
  { size: 1.5, x: '35%', y: '10%', delay: '2s', duration: '7s', opacity: 0.3 },
];

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-float"
          style={{
            width: p.size * 2,
            height: p.size * 2,
            left: p.x,
            top: p.y,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
