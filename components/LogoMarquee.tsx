"use client";

const clients = [
  "CBS",
  "MTV",
  "Coca-Cola",
  "Six Flags",
  "Disney",
  "Warner Bros.",
  "Pepsi",
  "Walmart",
  "CBS",
  "MTV",
  "Coca-Cola",
  "Six Flags",
  "Disney",
  "Warner Bros.",
  "Pepsi",
  "Walmart",
];

export default function LogoMarquee() {
  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div
        className="flex items-center gap-12 sm:gap-16"
        style={{
          animation: "marquee 28s linear infinite",
          width: "max-content",
        }}
      >
        {clients.map((client, i) => (
          <span
            key={i}
            className="text-base sm:text-lg font-bold tracking-tight flex-shrink-0"
            style={{ color: "rgba(147,97,202,0.32)" }}
          >
            {client}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flex { animation: none; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
