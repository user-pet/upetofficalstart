const wavePath = (amp, len, y) => {
  let d = `M 0 ${y}`;
  for (let x = 0; x < 3200; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
  return d;
};

const LINES = [
  { y: 0.18, amp: 38, len: 520, op: 0.22, dur: 22 },
  { y: 0.34, amp: 54, len: 640, op: 0.16, dur: 28 },
  { y: 0.50, amp: 32, len: 440, op: 0.26, dur: 19 },
  { y: 0.66, amp: 48, len: 580, op: 0.14, dur: 32 },
  { y: 0.82, amp: 36, len: 480, op: 0.18, dur: 25 },
];

const STARS = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  x: `${(index * 43 + 11) % 96}%`,
  y: `${(index * 61 + 7) % 92}%`,
  size: `${1.5 + (index % 3) * 0.9}px`,
  delay: `${-((index * 0.47) % 5)}s`,
  duration: `${2.4 + (index % 4) * 0.65}s`,
}));

export const WaveBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" data-testid="wave-background" style={{ contain: "strict" }}>
    {/* Light mode Aqua-to-Pink atmospheric canvas */}
    <div
      className=" upet-light-aqua-pink-bg absolute inset-0 opacity-100 transition-opacity duration-300 dark:opacity-0"
      style={{
        background:
          "linear-gradient(135deg, #d8f8ff 0%, #e0f2fe 24%, #f5e8ff 54%, #fce7f3 78%, #ffd8ec 100%)",
      }}
    />
    <div
      className="absolute inset-0 opacity-90 transition-opacity duration-300 dark:opacity-0"
      style={{
        background:
          "radial-gradient(58% 55% at 14% 12%, rgba(56, 189, 248, 0.28), transparent 68%), radial-gradient(62% 58% at 88% 18%, rgba(244, 114, 182, 0.30), transparent 70%), radial-gradient(65% 60% at 52% 88%, rgba(236, 72, 153, 0.22), transparent 72%)",
      }}
    />
    {/* ReactBits Aurora ambient shader layer */}
    <div
      className="bg-fx-aurora absolute -inset-[12%] opacity-40 dark:opacity-45"
      style={{ color: "hsl(var(--primary))" }}
    />
    {/* Top atmospheric spotlight */}
    <div
      className="absolute inset-x-0 top-0 h-[560px]"
      style={{
        background:
          "radial-gradient(62% 68% at 50% -8%, hsl(var(--primary) / 0.22), transparent 74%), radial-gradient(40% 50% at 82% 14%, rgba(236, 72, 153, 0.16), transparent 70%)",
      }}
    />
    {/* ReactBits DotGrid matrix with radial vignette mask */}
    <div
      className="absolute inset-0 opacity-55 dark:opacity-90"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.085) 1px, transparent 0)",
        backgroundSize: "26px 26px",
        maskImage: "radial-gradient(ellipse 90% 80% at 50% 35%, #000 35%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 35%, #000 35%, transparent 100%)",
      }}
    />
    {/* Ambient ReactBits starfield */}
    <div className="bg-fx-stars absolute inset-0 text-primary/45">
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
    {/* Animated flowing wave ribbons */}
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="none">
      <defs>
        <linearGradient id="upet-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#6cc4ff" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {LINES.map((l, i) => (
        <g key={i} className="wave-line" style={{ animationDuration: `${l.dur}s` }}>
          <path
            d={wavePath(l.amp, l.len, l.y * 1000)}
            fill="none"
            stroke="url(#upet-wave-grad)"
            strokeOpacity={l.op * 1.35}
            strokeWidth={1.45}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  </div>
);
