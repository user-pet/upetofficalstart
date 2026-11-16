import { useEffect, useState } from "react";

const wavePath = (amp, len, y) => {
  let d = `M 0 ${y}`;
  for (let x = 0; x < 3200; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
  return d;
};

const LINES = [
  { y: 0.22, amp: 36, len: 540, op: 0.20, dur: 24 },
  { y: 0.48, amp: 44, len: 620, op: 0.16, dur: 29 },
  { y: 0.76, amp: 34, len: 500, op: 0.18, dur: 26 },
];

const STARS = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  x: `${(index * 43 + 11) % 96}%`,
  y: `${(index * 61 + 7) % 92}%`,
  size: `${1.5 + (index % 3) * 0.9}px`,
  delay: `${-((index * 0.47) % 5)}s`,
  duration: `${2.4 + (index % 4) * 0.65}s`,
}));

export const WaveBackground = () => {
  const [isDashboard, setIsDashboard] = useState(
    () => typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")
  );

  useEffect(() => {
    const syncPath = () => {
      setIsDashboard(window.location.pathname.startsWith("/dashboard"));
    };
    window.addEventListener("popstate", syncPath);
    const interval = window.setInterval(syncPath, 400);
    return () => {
      window.removeEventListener("popstate", syncPath);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-testid="wave-background"
      style={{ contain: "strict" }}
    >
      {/* Deep tinted violet/navy base for dark mode (never pure #000000) */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 dark:opacity-100"
        style={{
          background:
            "radial-gradient(65% 58% at 18% 12%, rgba(244, 114, 182, 0.18), transparent 65%), radial-gradient(60% 55% at 84% 20%, rgba(108, 196, 255, 0.16), transparent 68%), radial-gradient(65% 60% at 50% 90%, rgba(167, 139, 250, 0.15), transparent 70%), linear-gradient(155deg, #0d0919 0%, #0b0d1e 50%, #120c24 100%)",
        }}
      />

      {/* Light mode soft tinted pink -> subtle aqua/violet canvas */}
      <div
        className="upet-light-aqua-pink-bg absolute inset-0 opacity-100 transition-opacity duration-300 dark:opacity-0"
        style={{
          background:
            "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #f3e8ff 64%, #e0f2fe 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-90 transition-opacity duration-300 dark:opacity-0"
        style={{
          background:
            "radial-gradient(58% 55% at 16% 12%, rgba(244, 114, 182, 0.25), transparent 68%), radial-gradient(62% 58% at 86% 18%, rgba(108, 196, 255, 0.24), transparent 70%), radial-gradient(65% 60% at 52% 88%, rgba(167, 139, 250, 0.20), transparent 72%)",
        }}
      />

      {/* ReactBits Aurora ambient depth layer */}
      <div
        className="bg-fx-aurora absolute -inset-[12%] opacity-40 dark:opacity-45"
        style={{ color: "#f472b6" }}
      />

      {/* Marketing-only particles & dots (omitted from Dashboard UI) */}
      {!isDashboard && (
        <>
          <div
            className="absolute inset-0 opacity-45 dark:opacity-75"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.075) 1px, transparent 0)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(ellipse 88% 75% at 50% 35%, #000 30%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 88% 75% at 50% 35%, #000 30%, transparent 100%)",
            }}
          />
          <div className="bg-fx-stars absolute inset-0 text-pink-300/40">
            {STARS.map((s) => (
              <i
                key={s.id}
                style={{
                  "--x": s.x,
                  "--y": s.y,
                  "--size": s.size,
                  "--delay": s.delay,
                  "--duration": s.duration,
                }}
              />
            ))}
          </div>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="none">
            <defs>
              <linearGradient id="upet-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="52%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6cc4ff" />
              </linearGradient>
            </defs>
            {LINES.map((l, i) => (
              <g key={i} className="wave-line" style={{ animationDuration: `${l.dur}s` }}>
                <path
                  d={wavePath(l.amp, l.len, l.y * 1000)}
                  fill="none"
                  stroke="url(#upet-wave-grad)"
                  strokeOpacity={l.op * 1.25}
                  strokeWidth={1.4}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>
        </>
      )}
    </div>
  );
};
