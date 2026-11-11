import { useEffect, useRef, useState } from "react";
import { BADGES } from "../lib/catalog";
import { ShieldCheck, Crown, Star, Sparkles, Zap, Bug, Heart, ShoppingBag, Award } from "lucide-react";

export const safeCssUrl = (raw) => {
  const s = String(raw || "").trim();
  if (!s || !/^(https?:\/\/|\/|data:image\/(png|jpeg|jpg|webp|gif|avif);base64,)/i.test(s)) return undefined;
  return `url("${s.replace(/["'()\\\r\n]/g, "")}")`;
};

export const mediaStyle = (m) => ({
  backgroundImage: m && m.src ? safeCssUrl(m.src) : undefined,
  backgroundSize: `${(m?.zoom || 1) * 100}%`,
  backgroundPosition: `${m?.x ?? 50}% ${m?.y ?? 50}%`,
  backgroundRepeat: "no-repeat",
  filter: m?.blur ? `blur(${m.blur}px)` : undefined,
  transform: m?.rotate ? `rotate(${m.rotate}deg)` : undefined,
});

export const isVideoMedia = (m) => m?.type === "video" || String(m?.type || "").startsWith("video/") || /\.(mp4|webm|mov)(?:$|[?#])/i.test(String(m?.src || ""));

export const MediaLayer = ({ media, className = "", style = {} }) => {
  if (!media?.src) return null;
  if (isVideoMedia(media)) return <video src={media.src} className={className} style={{ objectFit: "cover", objectPosition: `${media.x ?? 50}% ${media.y ?? 50}%`, filter: media.blur ? `blur(${media.blur}px)` : undefined, transform: `scale(${(media.zoom || 1) * (media.size || 100) / 100}) rotate(${media.rotate || 0}deg)`, ...style }} autoPlay loop muted playsInline preload="metadata" />;
  return <div className={className} style={{ ...mediaStyle(media), ...style }} />;
};

export const Avatar = ({ media, name = "", size = 96, decoration, hue = 0, decoSize = 120, className = "" }) => {
  const s = Math.round(size * ((media?.size ?? 100) / 100));
  const initials = String(name || "?")
    .trim()
    .replace(/^@/, "")
    .slice(0, 2)
    .toUpperCase() || "?";
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: s, height: s }}>
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/15 bg-[#0c1017] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        {media?.src ? (
          <MediaLayer media={media} className="h-full w-full" style={isVideoMedia(media) ? { transform: `scale(${media.zoom || 1}) rotate(${media.rotate || 0}deg)` } : { backgroundSize: `${(media.zoom || 1) * 100}%` }} />
        ) : (
          <div
            className="relative grid h-full w-full place-items-center overflow-hidden font-display font-bold tracking-tight text-white/90"
            style={{
              fontSize: s * 0.34,
              background: "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.10), transparent 62%), linear-gradient(145deg, #121824 0%, #090c12 100%)",
            }}
          >
            <span className="pointer-events-none absolute inset-[14%] rounded-full border border-dashed border-white/10" />
            <span className="relative z-10">{initials}</span>
          </div>
        )}
      </div>
      {decoration && (
        <img src={decoration.url} alt="" className="pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" style={{ width: `${decoSize}%`, filter: hue ? `hue-rotate(${hue}deg)` : undefined }} />
      )}
    </div>
  );
};

const BADGE_ICON = { founder: Crown, staff: ShieldCheck, verified: Sparkles, premium: Award, og: Star, booster: Zap, bughunter: Bug, donor: Heart, seller: ShoppingBag };

const alphaHex = (a) => Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0");

export const BadgeIcon = ({ id, size = 18, cfg }) => {
  const b = BADGES.find((x) => x.id === id);
  const Icon = BADGE_ICON[id] || Star;
  if (!b) return null;
  const st = cfg || { style: "soft", bgAlpha: 0.15, glow: 0, monochrome: false };
  const color = st.monochrome ? st.color : b.color;
  const s = cfg ? cfg.size : size;
  const isSoft = st.style === "soft";
  const isSolid = st.style === "solid";
  const isOutline = st.style === "outline";
  const background = isSolid ? color : isSoft ? `${color}${alphaHex(st.bgAlpha)}` : "transparent";
  const glow = Math.max(0, Number(st.glow) || 0);
  return (
    <span
      data-testid={`badge-${id}`}
      className="inline-grid place-items-center rounded-full transition-[width,height,background-color,border-color,filter,box-shadow] duration-150"
      style={{
        width: s + 10,
        height: s + 10,
        background,
        border: isOutline ? `1.5px solid ${color}` : "1.5px solid transparent",
        color: isSolid ? "#08111f" : color,
        filter: glow ? `drop-shadow(0 0 ${Math.max(1, glow * 0.55)}px ${color})` : undefined,
        boxShadow: glow ? `0 0 ${glow}px ${color}, inset 0 0 ${glow * 0.35}px ${color}` : undefined,
      }}
    >
      <Icon style={{ width: s, height: s }} />
    </span>
  );
};

const Typewriter = ({ text }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length + 8 ? 0 : v + 1)), 120);
    return () => clearInterval(t);
  }, [text]);
  return <span className="fx-caret">{text.slice(0, Math.min(n, text.length))}</span>;
};

const SPLIT = ["wave", "bounce", "blurin"];
const GLYPHS = "!<>-_\\/[]{}=+*^?#ABCDEFabcdef0123456789";

const Scramble = ({ text }) => {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let f = 0;
    const t = setInterval(() => {
      f = (f + 1) % (text.length * 3 + 30);
      const k = Math.floor(f / 3);
      setOut(text.split("").map((c, i) => (i < k || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
    }, 45);
    return () => clearInterval(t);
  }, [text]);
  return <span className="font-mono">{out}</span>;
};

export const FxText = ({ fx, text, className = "", style }) => {
  if (fx === "glitch") return <span className={`fx-glitch ${className}`} style={style} data-text={text}>{text}</span>;
  if (fx === "typewriter") return <span className={className} style={style}><Typewriter text={text} /></span>;
  if (fx === "scramble") return <span className={className} style={style}><Scramble text={text} /></span>;
  if (SPLIT.includes(fx)) return <span className={`fx-${fx} ${className}`} style={style}>{text.split("").map((c, i) => <span key={i} className="fx-l" style={{ "--i": i }}>{c}</span>)}</span>;
  if (fx && fx !== "none") return <span className={`fx-${fx} ${className}`} style={style}>{text}</span>;
  return <span className={className} style={style}>{text}</span>;
};

export const Tip = ({ cfg, label, children }) => {
  if (!cfg || !cfg.enabled || !label) return children;
  const bg = cfg.style === "minimal" ? "transparent" : cfg.style === "solid" ? cfg.color : `${cfg.color}cc`;
  const pos = cfg.position === "bottom" ? { top: "calc(100% + 6px)" } : { bottom: "calc(100% + 6px)" };
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="tip rounded-lg font-medium" style={{ ...pos, background: bg, color: cfg.textColor, backdropFilter: cfg.style === "glass" ? "blur(8px)" : undefined, border: cfg.style === "minimal" ? "none" : "1px solid rgba(255,255,255,.12)" }}>{label}</span>
    </span>
  );
};

const useCanvasFx = (kind, amount, color, preview = false) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !["rain", "snow", "thunder", "squares", "hyperspeed"].includes(kind)) return;
    const ctx = c.getContext("2d");
    let raf;
    const resize = () => {
      c.width = c.offsetWidth || 240;
      c.height = c.offsetHeight || 140;
    };
    resize();
    const strength = Math.max(0.15, Math.min(1, Number(amount) / 100));

    if (kind === "squares") {
      const cell = preview ? 18 : 34;
      let t = 0;
      const tick = () => {
        t += 0.015;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        const ox = (t * 14) % cell;
        const oy = (t * 9) % cell;
        const cols = Math.ceil(c.width / cell) + 1;
        const rows = Math.ceil(c.height / cell) + 1;
        for (let ix = 0; ix < cols; ix++) {
          for (let iy = 0; iy < rows; iy++) {
            const x = ix * cell - ox;
            const y = iy * cell - oy;
            ctx.globalAlpha = 0.11 * strength;
            ctx.strokeRect(x, y, cell, cell);
            const wave = Math.sin(ix * 0.9 + iy * 0.7 + t * 2.2);
            if (wave > 0.82) {
              ctx.globalAlpha = (wave - 0.82) * 1.8 * strength;
              ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
            }
          }
        }
        if (!preview) raf = requestAnimationFrame(tick);
      };
      tick();
      window.addEventListener("resize", resize);
      return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }

    if (kind === "hyperspeed") {
      const streakCount = preview ? 12 : Math.max(16, Math.round(48 * strength));
      const streaks = Array.from({ length: streakCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: 8 + Math.random() * Math.max(c.width, c.height) * 0.55,
        speed: (preview ? 1.5 : 3.2) + Math.random() * 4.5,
        len: 14 + Math.random() * 46,
      }));
      const tick = () => {
        ctx.clearRect(0, 0, c.width, c.height);
        const cx = c.width * 0.5;
        const cy = c.height * 0.5;
        const maxR = Math.hypot(cx, cy) + 40;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        for (const s of streaks) {
          const x1 = cx + Math.cos(s.angle) * s.dist;
          const y1 = cy + Math.sin(s.angle) * s.dist;
          const x2 = cx + Math.cos(s.angle) * (s.dist + s.len * (s.dist / maxR + 0.3));
          const y2 = cy + Math.sin(s.angle) * (s.dist + s.len * (s.dist / maxR + 0.3));
          ctx.globalAlpha = Math.min(0.85, (s.dist / maxR) * strength);
          ctx.lineWidth = 1 + (s.dist / maxR) * 1.8;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          s.dist += s.speed * (0.4 + s.dist / maxR);
          if (s.dist > maxR) {
            s.dist = 4 + Math.random() * 18;
            s.angle = Math.random() * Math.PI * 2;
          }
        }
        if (!preview) raf = requestAnimationFrame(tick);
      };
      tick();
      window.addEventListener("resize", resize);
      return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }

    const available = Math.round((c.width * c.height) / (kind === "snow" ? 6500 : 4200));
    const maxCap = preview ? 18 : 140;
    const count = Math.min(Math.max(6, Math.round(available * strength)), maxCap);
    const parts = Array.from({ length: count }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, v: kind === "snow" ? 0.45 + Math.random() * 0.85 : 6 + Math.random() * 5, r: 1 + Math.random() * 2, d: Math.random() * Math.PI * 2 }));
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.78;
      ctx.lineWidth = 1;
      for (const p of parts) {
        if (kind === "snow") {
          p.d += 0.012;
          p.x += Math.sin(p.d) * 0.35;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1.5, p.y + p.v * 1.9); ctx.stroke();
        }
        p.y += p.v;
        if (p.y > c.height) { p.y = -10; p.x = Math.random() * c.width; }
      }
      if (!preview) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [kind, amount, color, preview]);
  return ref;
};

export const BackgroundFx = ({ kind, amount = 50, color = "#ffffff", preview = false }) => {
  const strength = Math.max(0, Math.min(1, Number(amount) / 100));
  const ref = useCanvasFx(kind, amount, color, preview);
  if (!kind || kind === "none") return null;
  const maxParticles = preview ? 6 : 20;
  const particleCount = strength === 0 ? 0 : Math.max(3, Math.round(maxParticles * strength));
  const particles = Array.from({ length: particleCount }, (_, index) => index);
  const starCap = preview ? 12 : 42;
  const stars = Array.from({ length: strength === 0 ? 0 : Math.max(4, Math.round(starCap * strength)) }, (_, index) => index);
  const colCap = preview ? 5 : 14;
  const columns = Array.from({ length: strength === 0 ? 0 : Math.max(3, Math.round(colCap * strength)) }, (_, index) => index);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ color, opacity: strength === 0 ? 0 : .35 + strength * .65, "--fx-color": color, "--fx-strength": strength, contain: "strict" }}>
      {kind === "spotlight" && <div className="absolute inset-0 float-y" style={{ opacity: strength, background: "radial-gradient(45% 58% at 50% 0%, color-mix(in srgb, currentColor 55%, transparent), transparent 72%)" }} />}
      {["rain", "snow", "thunder", "squares", "hyperspeed"].includes(kind) && <canvas ref={ref} className="absolute inset-0 h-full w-full" />}
      {kind === "thunder" && <div className="bg-thunder-flash absolute inset-0" style={{ opacity: strength, backgroundColor: color }} />}
      {kind === "aurora" && <div className="bg-fx-aurora absolute -inset-[12%]" style={{ opacity: .25 + strength * .75 }} />}
      {kind === "dotgrid" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.35 + strength * 0.65,
            backgroundImage: "radial-gradient(circle, currentColor 1.25px, transparent 1.35px)",
            backgroundSize: preview ? "12px 12px" : "22px 22px",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 42%, #000 35%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 42%, #000 35%, transparent 100%)",
          }}
        />
      )}
      {kind === "silk" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.3 + strength * 0.65,
            background:
              "radial-gradient(120% 80% at 15% 20%, color-mix(in srgb, currentColor 42%, transparent), transparent 58%), radial-gradient(110% 90% at 85% 75%, color-mix(in srgb, currentColor 32%, #6366f1 24%), transparent 62%), repeating-linear-gradient(-28deg, color-mix(in srgb, currentColor 12%, transparent) 0px, transparent 22px, color-mix(in srgb, currentColor 8%, transparent) 44px)",
          }}
        />
      )}
      {kind === "iridescence" && (
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.32 + strength * 0.64,
            background:
              "conic-gradient(from 210deg at 50% 50%, color-mix(in srgb, currentColor 45%, #38bdf8), color-mix(in srgb, currentColor 35%, #f472b6), color-mix(in srgb, currentColor 40%, #a855f7), color-mix(in srgb, currentColor 45%, #34d399), color-mix(in srgb, currentColor 45%, #38bdf8))",
            filter: "blur(28px)",
            transform: "scale(1.15)",
          }}
        />
      )}
      {kind === "stars" && <div className="bg-fx-stars absolute inset-0">{stars.map((index) => <i key={index} style={{ "--x": `${(index * 47 + 13) % 98}%`, "--y": `${(index * 67 + 7) % 96}%`, "--size": `${2 + (index % 4) * 1.1}px`, "--delay": `${-((index * .37) % 4.5)}s`, "--duration": `${1.8 + (index % 5) * .45}s` }} />)}</div>}
      {["fireflies", "bubbles", "embers", "sakura"].includes(kind) && <div className={`bg-fx-particles bg-fx-${kind} absolute inset-0`}>{particles.map((index) => <i key={index} style={{ "--i": index, "--x": `${(index * 37 + 11) % 96}%`, "--delay": `${-((index * 0.53) % 7)}s`, "--duration": `${5.5 + (index % 5) * 0.85}s`, "--size": `${8 + (index % 4) * 4}px`, "--drift": `${(index % 3 - 1) * 20}px` }} />)}</div>}
      {kind === "hearts" && <div className="bg-fx-particles bg-fx-hearts absolute inset-0">{particles.slice(0, Math.max(3, Math.round(particleCount * .75))).map((index) => <i key={index} style={{ "--i": index, "--x": `${(index * 41 + 7) % 94}%`, "--delay": `${-((index * 0.61) % 8)}s`, "--duration": `${6 + (index % 5) * 0.8}s`, "--font-size": `${9 + (index % 4) * 3}px`, "--drift": `${(index % 3 - 1) * 20}px` }}>♥</i>)}</div>}
      {kind === "matrix" && <div className="bg-fx-matrix absolute inset-0">{columns.map((index) => <span key={index} style={{ "--i": index, "--delay": `${-(index % 5) * 0.7}s` }}>01<br />10<br />11<br />00<br />10<br />01</span>)}</div>}
    </div>
  );
};

export const CursorFx = ({ kind = "none", color = "#6cc4ff", preview = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!kind || kind === "none" || preview) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = parent.clientWidth || window.innerWidth;
      canvas.height = parent.clientHeight || window.innerHeight;
    };
    resize();

    const pointer = { x: canvas.width * 0.5, y: canvas.height * 0.4, tx: canvas.width * 0.5, ty: canvas.height * 0.4, active: false };
    const trail = [];

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      pointer.active = true;
      if (kind === "splash") {
        trail.push({ x: pointer.tx, y: pointer.ty, r: 3, maxR: 28 + Math.random() * 18, alpha: 0.72 });
      } else if (kind === "sparkle") {
        for (let i = 0; i < 2; i++) {
          trail.push({
            x: pointer.tx + (Math.random() - 0.5) * 14,
            y: pointer.ty + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 1.4,
            vy: -0.5 - Math.random() * 1.2,
            size: 2.5 + Math.random() * 3.5,
            alpha: 0.95,
          });
        }
      } else if (kind === "pixel") {
        const snap = 10;
        trail.push({
          x: Math.floor(pointer.tx / snap) * snap,
          y: Math.floor(pointer.ty / snap) * snap,
          size: snap - 1,
          alpha: 0.85,
        });
      }
      if (trail.length > 48) trail.splice(0, trail.length - 48);
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pointer.x += (pointer.tx - pointer.x) * 0.18;
      pointer.y += (pointer.ty - pointer.y) * 0.18;

      if (kind === "splash") {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          p.r += 1.15;
          p.alpha *= 0.94;
          if (p.alpha < 0.03) { trail.splice(i, 1); continue; }
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (kind === "sparkle") {
        ctx.fillStyle = color;
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha *= 0.93;
          if (p.alpha < 0.04) { trail.splice(i, 1); continue; }
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size * 0.65, p.y);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size * 0.65, p.y);
          ctx.closePath();
          ctx.fill();
        }
      } else if (kind === "pixel") {
        ctx.fillStyle = color;
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          p.alpha *= 0.91;
          if (p.alpha < 0.04) { trail.splice(i, 1); continue; }
          ctx.globalAlpha = p.alpha;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      } else if (kind === "blob" && pointer.active) {
        const grad = ctx.createRadialGradient(pointer.x, pointer.y, 2, pointer.x, pointer.y, 76);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.34;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 76, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "spotlight" && pointer.active) {
        const grad = ctx.createRadialGradient(pointer.x, pointer.y, 8, pointer.x, pointer.y, 170);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 170, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "crosshair" && pointer.active) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(pointer.x, 0);
        ctx.lineTo(pointer.x, canvas.height);
        ctx.moveTo(0, pointer.y);
        ctx.lineTo(canvas.width, pointer.y);
        ctx.stroke();
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [kind, color, preview]);

  if (!kind || kind === "none") return null;

  if (preview) {
    return (
      <div className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden" style={{ color }}>
        {kind === "splash" && <div className="h-9 w-9 rounded-full border-2 border-current opacity-75 shadow-[0_0_16px_currentColor]" />}
        {kind === "sparkle" && <div className="font-mono text-base tracking-widest text-current">✦ ✧ ✦</div>}
        {kind === "blob" && <div className="h-11 w-11 rounded-full bg-current opacity-55 blur-md" />}
        {kind === "crosshair" && (
          <div className="relative h-full w-full">
            <div className="absolute inset-x-0 top-1/2 h-px bg-current opacity-40" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-current opacity-40" />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current" />
          </div>
        )}
        {kind === "spotlight" && <div className="h-14 w-14 rounded-full bg-current opacity-35 blur-xl" />}
        {kind === "pixel" && (
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 bg-current opacity-90" />
            <span className="h-2.5 w-2.5 bg-current opacity-60" />
            <span className="h-2.5 w-2.5 bg-current opacity-30" />
          </div>
        )}
      </div>
    );
  }

  return <canvas ref={canvasRef} data-testid={`cursor-fx-${kind}`} className="pointer-events-none absolute inset-0 z-30 h-full w-full" />;
};

export const OverlayFx = ({ kind }) => {
  if (!kind || kind === "none") return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 30 }}>
      <div className={`absolute ${kind === "grain" ? "" : "inset-0"} ov-${kind}`} />
    </div>
  );
};
