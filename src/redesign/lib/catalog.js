import { useEffect, useState } from "react";
import { normalizeDecorations } from "../../shared/decorations";

const REMOTE = "https://raw.githubusercontent.com/wickstudio/Discord-Avatar-Decoration-Bot/main/effects.json";
let cache = null;

export const loadDecorations = async () => {
  if (cache) return cache;
  for (const src of ["/decorations.json", REMOTE]) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        cache = normalizeDecorations(await res.json());
        return cache;
      }
    } catch (e) {
      continue;
    }
  }
  return [];
};

export const useDecorations = () => {
  const [state, setState] = useState({ loading: true, items: cache || [] });
  useEffect(() => {
    let alive = true;
    loadDecorations().then((items) => alive && setState({ loading: false, items }));
    return () => { alive = false; };
  }, []);
  return state;
};

export const BADGES = [
  { id: "founder", label: "Founder", color: "#fbbf24", desc: "Founder of user.pet", lockedVisible: true },
  { id: "staff", label: "Staff", color: "#6cc4ff", desc: "user.pet team member" },
  { id: "verified", label: "Verified", color: "#3ba7ff", desc: "Verified identity" },
  { id: "premium", label: "Premium", color: "#ffd166", desc: "Supports user.pet" },
  { id: "og", label: "OG", color: "#c4b5fd", desc: "Joined in the first wave" },
  { id: "booster", label: "Booster", color: "#ff73fa", desc: "Boosted the Discord" },
  { id: "bughunter", label: "Bug Hunter", color: "#4ade80", desc: "Reported a real bug" },
  { id: "donor", label: "Donor", color: "#fb7185", desc: "Donated to the project" },
  { id: "seller", label: "Seller", color: "#f59e0b", desc: "Sold on the marketplace" },
];

export const PLATFORMS = [
  "discord", "spotify", "tiktok", "youtube", "x", "instagram", "github", "twitch", "steam", "roblox",
  "namemc", "soundcloud", "telegram", "snapchat", "reddit", "pinterest", "kick", "cashapp", "paypal", "linktree", "website",
];

export const detectPlatform = (url = "") => {
  const u = url.toLowerCase();
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  return PLATFORMS.find((p) => p !== "website" && u.includes(p)) || "website";
};

export const iconUrl = (platform, color = "ffffff") => {
  if (platform === "website") return null;
  if (platform === "namemc") return "/icons/namemc.png";
  return `https://cdn.simpleicons.org/${platform}/${color.replace("#", "")}`;
};

export const BRAND = {
  discord: ["5865F2", "https://discord.gg/"], spotify: ["1DB954", "https://open.spotify.com/user/"], tiktok: ["25F4EE", "https://tiktok.com/@"],
  youtube: ["FF0000", "https://youtube.com/@"], x: ["FFFFFF", "https://x.com/"], instagram: ["E4405F", "https://instagram.com/"],
  github: ["FFFFFF", "https://github.com/"], twitch: ["9146FF", "https://twitch.tv/"], steam: ["66C0F4", "https://steamcommunity.com/id/"],
  roblox: ["FFFFFF", "https://roblox.com/users/"], namemc: ["39A9DB", "https://namemc.com/profile/"], soundcloud: ["FF5500", "https://soundcloud.com/"], telegram: ["26A5E4", "https://t.me/"],
  snapchat: ["FFFC00", "https://snapchat.com/add/"], reddit: ["FF4500", "https://reddit.com/u/"], pinterest: ["E60023", "https://pinterest.com/"],
  kick: ["53FC18", "https://kick.com/"], cashapp: ["00D632", "https://cash.app/$"], paypal: ["009CDE", "https://paypal.me/"],
  linktree: ["43E55E", "https://linktr.ee/"], website: ["6CC4FF", "https://"],
};

export const TEXT_FX = [
  "none", "glitch", "typewriter", "morph", "flicker", "rainbow", "neon", "wave", "bounce", "shake",
  "gradient", "blurin", "scramble", "rgb", "outline", "pulse", "fire", "ice", "sparkle", "float", "chroma", "3d", "swing",
];

export const BG_FX = [
  ["none", "None"],
  ["aurora", "Aurora WebGL"],
  ["hyperspeed", "Hyperspeed"],
  ["iridescence", "Iridescence"],
  ["silk", "Silk Shader"],
  ["waves", "Waves"],
  ["dotgrid", "Dot Grid"],
  ["letterglitch", "Letter Glitch"],
  ["rain", "Rain"],
  ["snow", "Snow"],
  ["thunder", "Thunder"],
  ["spotlight", "Spotlight"],
  ["stars", "Starfield"],
  ["fireflies", "Fireflies"],
  ["bubbles", "Bubbles"],
  ["embers", "Embers"],
  ["hearts", "Hearts"],
  ["sakura", "Sakura"],
  ["matrix", "Matrix Rain"],
];

export const OVERLAY_FX = [
  ["none", "None"],
  ["grain", "Film Grain"],
  ["vhs", "CRT / VHS"],
  ["rain", "Glass Rain"],
  ["shine", "Diagonal Shine"],
];

export const THEME_PRESETS = [
  { id: "obsidian", name: "Noiz Obsidian", accent: "#ffffff", cardColor: "#0c0c10", textColor: "#fafafa", bgColor: "#050507", alpha: 0.86, blur: 18, radius: 22, bg: "aurora", overlay: "none" },
  { id: "midnight", name: "Midnight Glass", accent: "#62b5ff", cardColor: "#0e1d33", textColor: "#eaf4ff", bgColor: "#07111f", alpha: 0.72, blur: 22, radius: 28, bg: "aurora", overlay: "none" },
  { id: "cyber", name: "Cyber Neon", accent: "#a855f7", cardColor: "#160d29", textColor: "#f5edff", bgColor: "#090414", alpha: 0.78, blur: 26, radius: 24, bg: "hyperspeed", overlay: "vhs" },
  { id: "sakura", name: "Sakura Frost", accent: "#ff85b3", cardColor: "#261321", textColor: "#fff0f6", bgColor: "#120810", alpha: 0.68, blur: 28, radius: 32, bg: "sakura", overlay: "shine" },
  { id: "ember", name: "Sunset Ember", accent: "#fb923c", cardColor: "#24140e", textColor: "#fff7ed", bgColor: "#100805", alpha: 0.75, blur: 20, radius: 26, bg: "embers", overlay: "grain" },
  { id: "emerald", name: "Emerald Matrix", accent: "#34d399", cardColor: "#0b211a", textColor: "#ecfdf5", bgColor: "#040f0b", alpha: 0.74, blur: 24, radius: 24, bg: "matrix", overlay: "vhs" },
];

export const DECORATIONS = [
  { id: "cyber-halo", label: "Cyber Halo", url: "/decorations/cyber-halo.png" },
  { id: "sakura-wreath", label: "Sakura Wreath", url: "/decorations/sakura-wreath.png" },
  { id: "void-crown", label: "Void Crown", url: "/decorations/void-crown.png" },
];

const makeFontOption = (id, name, sub, sample, family) => {
  const item = { id, name, sub, sample, family };
  Object.defineProperty(item, Symbol.iterator, {
    enumerable: false,
    value: function* () {
      yield id;
      yield name;
      yield family;
      yield sub;
    },
  });
  return item;
};

export const FONT_OPTIONS = [
  makeFontOption("geist", "Geist Sans", "Noiz Default · Swiss", "Aa", "'Geist', -apple-system, BlinkMacSystemFont, sans-serif"),
  makeFontOption("manrope", "Manrope", "Humanist Display", "Aa", "'Manrope', 'Geist', sans-serif"),
  makeFontOption("urbanist", "Urbanist", "Sleek Geometric", "Aa", "'Urbanist', 'Geist', sans-serif"),
  makeFontOption("space", "Space Grotesk", "Kinetic Tech", "Aa", "'Space Grotesk', 'Geist', sans-serif"),
  makeFontOption("syne", "Syne", "Avant-Garde Wide", "Aa", "'Syne', 'Manrope', sans-serif"),
  makeFontOption("outfit", "Outfit", "Modern Rounded", "Aa", "'Outfit', 'Geist', sans-serif"),
  makeFontOption("jakarta", "Plus Jakarta", "Creator Studio", "Aa", "'Plus Jakarta Sans', 'Geist', sans-serif"),
  makeFontOption("sora", "Sora", "Sharp Neo-Tech", "Aa", "'Sora', 'Geist', sans-serif"),
  makeFontOption("editorial", "Editorial Serif", "Playfair Display", "Aa", "'Playfair Display', 'Instrument Serif', Georgia, serif"),
  makeFontOption("instrument", "Instrument Serif", "Italic Literary", "Aa", "'Instrument Serif', 'Playfair Display', Georgia, serif"),
  makeFontOption("mono", "Geist Mono", "Noiz Terminal Mono", "01", "'Geist Mono', monospace"),
  makeFontOption("jetbrains", "JetBrains Mono", "Code & Cyber", "</>", "'JetBrains Mono', 'Geist Mono', monospace"),
  makeFontOption("orbitron", "Orbitron", "Sci-Fi Mecha", "OX", "'Orbitron', 'Space Grotesk', sans-serif"),
  makeFontOption("pixel", "Pixelify Sans", "8-Bit Retro Gamer", "8B", "'Pixelify Sans', 'Geist Mono', monospace"),
  makeFontOption("gothic", "Old English / Noir", "Dark Gothic Serif", "𝔑", "'UnifrakturMaguntia', 'Playfair Display', Georgia, serif"),
  makeFontOption("custom", "Custom Font", "Upload .ttf / .woff2", "✦", "'UpetCustomFont', 'Geist', sans-serif"),
];

export const CARD_FONT_MAP = Object.fromEntries(FONT_OPTIONS.map((f) => [f.id, f.family]));

let injectedCustomFontUrl = "";
export const fontStyle = (fontId = "geist", customFontUrl = "") => {
  if (fontId === "custom" && customFontUrl && typeof document !== "undefined") {
    if (injectedCustomFontUrl !== customFontUrl) {
      injectedCustomFontUrl = customFontUrl;
      let styleEl = document.getElementById("upet-custom-font-face");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "upet-custom-font-face";
        document.head.appendChild(styleEl);
      }
      const safeUrl = String(customFontUrl).replace(/["'()\\\r\n]/g, "");
      styleEl.textContent = `@font-face { font-family: 'UpetCustomFont'; src: url("${safeUrl}"); font-display: swap; }`;
    }
    return CARD_FONT_MAP.custom;
  }
  return CARD_FONT_MAP[fontId] || CARD_FONT_MAP.geist;
};

const makeCursorPreset = (id, label, desc) => {
  const item = { id, label, desc };
  Object.defineProperty(item, Symbol.iterator, {
    enumerable: false,
    value: function* () {
      yield id;
      yield label;
      yield desc;
    },
  });
  return item;
};

export const CURSOR_PRESETS = [
  makeCursorPreset("default", "Default", "System pointer"),
  makeCursorPreset("neon-arrow", "Noiz Neon", "Glowing obsidian arrow"),
  makeCursorPreset("obsidian", "MacOS Dark", "Crisp white-edge arrow"),
  makeCursorPreset("crosshair", "Crosshair", "FPS precision reticle"),
  makeCursorPreset("dot", "Minimal Dot", "Clean floating orb"),
  makeCursorPreset("pixel-sword", "Pixel Blade", "8-bit arcade katana"),
  makeCursorPreset("cyber-ring", "Cyber Ring", "Target hollow ring"),
  makeCursorPreset("star", "Sparkle Star", "4-point radiant star"),
  makeCursorPreset("cat", "Neko Paw", "Cute anime cat cursor"),
  makeCursorPreset("ghost", "Phantom", "Floating spirit cursor"),
  makeCursorPreset("heart", "Cyber Heart", "Glowing pixel heart"),
  makeCursorPreset("plus", "Swiss Plus", "Minimalist + crosshair"),
];

export const getCursorSvgMarkup = (preset = "default", color = "#ffffff") => {
  const hex = /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : "#ffffff";
  if (preset === "neon-arrow" || preset === "default") {
    return {
      hotspot: "4 4",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M4 3L23 13.5L14 15.8L10.5 24.5L4 3Z" fill="#090b10" stroke="${hex}" stroke-width="2" stroke-linejoin="round"/></svg>`,
    };
  }
  if (preset === "obsidian") {
    return {
      hotspot: "4 4",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M5 3L21 15L13.5 16.2L17 23.5L14 24.8L10.5 17.5L5 22V3Z" fill="#050507" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    };
  }
  if (preset === "crosshair") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="7" fill="none" stroke="${hex}" stroke-width="1.75"/><path d="M14 2V8M14 20V26M2 14H8M20 14H26" stroke="${hex}" stroke-width="1.75" stroke-linecap="round"/><circle cx="14" cy="14" r="2" fill="#ffffff"/></svg>`,
    };
  }
  if (preset === "dot") {
    return {
      hotspot: "12 12",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="${hex}" stroke="#ffffff" stroke-width="1.5"/></svg>`,
    };
  }
  if (preset === "pixel-sword") {
    return {
      hotspot: "4 4",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" shape-rendering="crispEdges"><rect x="4" y="4" width="4" height="4" fill="#ffffff"/><rect x="8" y="8" width="4" height="4" fill="${hex}"/><rect x="12" y="12" width="4" height="4" fill="${hex}"/><rect x="16" y="16" width="4" height="4" fill="#94a3b8"/><rect x="12" y="20" width="4" height="4" fill="#64748b"/><rect x="20" y="12" width="4" height="4" fill="#64748b"/><rect x="20" y="20" width="4" height="4" fill="#fbbf24"/></svg>`,
    };
  }
  if (preset === "cyber-ring") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="9" fill="rgba(9,11,16,0.45)" stroke="${hex}" stroke-width="2"/><circle cx="14" cy="14" r="2.2" fill="#ffffff"/></svg>`,
    };
  }
  if (preset === "star") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 2L16.8 11.2L26 14L16.8 16.8L14 26L11.2 16.8L2 14L11.2 11.2L14 2Z" fill="${hex}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
    };
  }
  if (preset === "cat") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M6 12L4 4L11 8H17L24 4L22 12C23.5 14 24 16.5 23 19C21.5 22.5 18 24 14 24C10 24 6.5 22.5 5 19C4 16.5 4.5 14 6 12Z" fill="#0b0c10" stroke="${hex}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="10.5" cy="15" r="1.5" fill="#ffffff"/><circle cx="17.5" cy="15" r="1.5" fill="#ffffff"/><path d="M12.5 18.2Q14 19.6 15.5 18.2" fill="none" stroke="${hex}" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    };
  }
  if (preset === "ghost") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 4C8.5 4 5 8 5 13.5V24L8 21.5L11 24L14 21.5L17 24L20 21.5L23 24V13.5C23 8 19.5 4 14 4Z" fill="#0b0c10" stroke="${hex}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="11" cy="13" r="1.6" fill="#ffffff"/><circle cx="17" cy="13" r="1.6" fill="#ffffff"/></svg>`,
    };
  }
  if (preset === "heart") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 24.5L12.1 22.8C6.2 17.5 3 14.5 3 10.2C3 6.8 5.7 4.2 9 4.2C11 4.2 12.9 5.1 14 6.6C15.1 5.1 17 4.2 19 4.2C22.3 4.2 25 6.8 25 10.2C25 14.5 21.8 17.5 15.9 22.8L14 24.5Z" fill="${hex}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    };
  }
  if (preset === "plus") {
    return {
      hotspot: "14 14",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 4V24M4 14H24" stroke="${hex}" stroke-width="2.4" stroke-linecap="round"/><circle cx="14" cy="14" r="2" fill="#050507" stroke="#ffffff" stroke-width="1.2"/></svg>`,
    };
  }
  return null;
};

export const getCursorPreviewDataUrl = (preset = "default", color = "#ffffff") => {
  const res = getCursorSvgMarkup(preset, color);
  if (!res?.svg) return "";
  return `data:image/svg+xml;utf8,${encodeURIComponent(res.svg)}`;
};

export const buildCursorCssValue = (preset = "default", color = "#6cc4ff", customSrc = "") => {
  if (customSrc) {
    const clean = String(customSrc).replace(/["'()\\\r\n]/g, "");
    return `url("${clean}") 16 16, auto`;
  }
  if (!preset || preset === "default") return undefined;
  const res = getCursorSvgMarkup(preset, color);
  if (!res?.svg) return undefined;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(res.svg)}") ${res.hotspot}, auto`;
};

export const CARD_ENTRANCES = [
  ["none", "None", "Instant static display", "normal"],
  ["condense", "Condense", "Smooth focus & scale-in arrival", "normal"],
  ["sweep", "Prism Sweep", "Diagonal sky-to-pink shimmer sweep", "normal"],
  ["origin", "Horizon Rise", "3D perspective lift from below", "normal"],
  ["deal", "Holo Deal", "3D card-flip deal with edge glint", "normal"],
  ["ripple", "Shockwave", "Expanding sonar pulse rings", "normal"],
  ["trace", "Laser Trace", "Glowing beam orbiting the card border", "signature"],
  ["signal", "Chroma Signal", "Dual cyan-rose RGB signal pulse", "signature"],
  ["circuit", "Cyber Circuit", "Dual neon nodes racing around the frame", "signature"],
  ["blueprint", "Architect Grid", "Drafting crosshairs & glowing corner brackets", "signature"],
  ["lock", "Vault Lock", "Tactical corner clamps snapping into place", "signature"],
];

export const CARD_LAYOUTS = [
  {
    id: "minimal",
    name: "Centered",
    badge: "Classic",
    bullets: ["One centered card", "Your picture above your name", "Clean stacked or 2-column links"],
  },
  {
    id: "stereo",
    name: "Stereo",
    badge: "Split View",
    bullets: ["You beside your links", "Built for long link lists", "Slim header on phones"],
  },
  {
    id: "banner",
    name: "Cover",
    badge: "Header Art",
    bullets: ["A big cover picture on top", "Your avatar & name over it", "Made for strong artwork"],
  },
  {
    id: "crest",
    name: "Crest",
    badge: "Floating",
    bullets: ["Your picture floating over the top edge", "Centered and double-framed", "A larger hero avatar"],
  },
  {
    id: "portrait",
    name: "Portrait",
    badge: "Side Card",
    bullets: ["A tall portrait beside your bio", "Badges tucked in the corner", "Full-width links below"],
  },
  {
    id: "bento",
    name: "Bento",
    badge: "Modular Grid",
    bullets: ["Links & widgets as a grid of tiles", "Wide and square interactive tiles", "Made for rich profiles"],
  },
  {
    id: "compact",
    name: "Compact",
    badge: "Minimal",
    bullets: ["Left-aligned compact header", "Icon-first social dock", "Ultra-clean footprint"],
  },
  {
    id: "slideshow",
    name: "Slideshow",
    badge: "Full-Screen",
    bullets: ["Vertical snap-scroll chapters", "Dedicated Profile, Links & Now slides", "Stage presentation"],
  },
];

