"use client";

interface SoundBarsProps {
  count?: number;
  playing?: boolean;
  className?: string;
  color?: string;
  minOpacity?: number;
  maxOpacity?: number;
}

// Pre-generate deterministic bar configs (stable across renders)
function generateBars(count: number) {
  const golden = 1.618033988749;
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 4;
    const h = 15 + Math.abs(Math.sin(t * golden)) * 60 + Math.abs(Math.cos(t * 1.3)) * 20;
    return {
      heightPct: Math.min(h, 95),
      duration: 0.7 + (i % 7) * 0.18,
      delay: (i % 9) * 0.14,
      opacity: 0.12 + (i % 5) * 0.05,
    };
  });
}

const BARS_40 = generateBars(40);
const BARS_60 = generateBars(60);

export default function SoundBars({
  count = 40,
  playing = true,
  className = "",
  color = "#9361CA",
  minOpacity = 0.08,
  maxOpacity = 0.35,
}: SoundBarsProps) {
  const bars = count <= 40 ? BARS_40 : BARS_60;

  return (
    <div
      className={`flex items-end gap-[2px] ${className}`}
      aria-hidden="true"
    >
      {bars.slice(0, count).map((bar, i) => (
        <div
          key={i}
          className="flex-1 rounded-full origin-bottom"
          style={{
            backgroundColor: color,
            opacity: playing
              ? minOpacity + bar.opacity * ((maxOpacity - minOpacity) / 0.25)
              : minOpacity * 0.4,
            height: `${bar.heightPct}%`,
            minHeight: "3px",
            animation: playing
              ? `soundBar ${bar.duration}s ease-in-out ${bar.delay}s infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}
