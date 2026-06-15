import { useMemo } from "react";

/**
 * Full-screen animated backdrop: drifting gradient orbs, a faint grid,
 * and slowly rising particles. Sits behind all content (fixed, -z-10).
 */
export default function Background() {
  // Pre-compute random particle properties once.
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const size = 2 + Math.random() * 4;
        return {
          id: i,
          left: Math.random() * 100,
          size,
          duration: 14 + Math.random() * 18,
          delay: -Math.random() * 30,
          drift: (Math.random() - 0.5) * 120,
          opacity: 0.25 + Math.random() * 0.5,
          hue:
            i % 3 === 0
              ? "rgba(52, 211, 153, 0.9)" // emerald
              : i % 3 === 1
              ? "rgba(34, 211, 238, 0.9)" // cyan
              : "rgba(129, 140, 248, 0.9)", // indigo
        };
      }),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06080f]">
      {/* Drifting colour orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Faint grid */}
      <div className="bg-grid absolute inset-0" />

      {/* Top + bottom vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06080f]/60 via-transparent to-[#06080f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />

      {/* Rising particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-[-10px] rounded-full"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.hue,
              boxShadow: `0 0 ${p.size * 2}px ${p.hue}`,
              animation: `particle-rise ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              "--p-drift": `${p.drift}px`,
              "--p-opacity": p.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
