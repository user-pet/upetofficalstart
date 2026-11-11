import { useRef } from "react";
import { Check, ChevronLeft, ChevronRight, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ChoiceChips, ColorRow, Field, Panel, SliderRow, ToggleRow, inputCls } from "../../../components/Controls";
import { CARD_ENTRANCES, CARD_LAYOUTS, FONT_OPTIONS, THEME_PRESETS } from "../../../lib/catalog";
import { readFontDataUrl } from "./shared";

const LayoutWireframe = ({ id, accent = "#38bdf8" }) => {
  return (
    <div
      className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 p-4"
      style={{
        background: "radial-gradient(85% 90% at 20% 15%, rgba(56,189,248,0.16), rgba(236,72,153,0.12) 55%, rgba(6,10,18,0.92) 100%)",
      }}
    >
      {id === "minimal" && (
        <div className="flex w-44 flex-col items-center gap-2 rounded-xl border border-sky-400/35 bg-[#091122]/90 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400 to-pink-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
          <div className="h-2 w-20 rounded-full bg-white/80" />
          <div className="h-1.5 w-14 rounded-full bg-white/35" />
          <div className="mt-1 flex gap-1.5">
            <span className="h-3.5 w-3.5 rounded-md border border-sky-400/40 bg-sky-400/20" />
            <span className="h-3.5 w-3.5 rounded-md border border-pink-400/40 bg-pink-400/20" />
            <span className="h-3.5 w-3.5 rounded-md border border-sky-400/40 bg-sky-400/20" />
          </div>
          <div className="h-3.5 w-full rounded-md border border-white/10 bg-white/10" />
        </div>
      )}
      {id === "stereo" && (
        <div className="grid w-56 grid-cols-[0.9fr_1.1fr] items-center gap-2.5 rounded-xl border border-sky-400/35 bg-[#091122]/90 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] p-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-pink-400" />
            <div className="h-1.5 w-12 rounded-full bg-white/80" />
            <div className="h-1 w-9 rounded-full bg-white/35" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded-md border border-sky-400/30 bg-sky-400/15" />
            <div className="h-4 w-full rounded-md border border-pink-400/30 bg-pink-400/15" />
            <div className="h-4 w-full rounded-md border border-white/15 bg-white/10" />
          </div>
        </div>
      )}
      {id === "banner" && (
        <div className="flex w-48 flex-col items-center overflow-hidden rounded-xl border border-sky-400/35 bg-[#091122]/90 pb-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="h-10 w-full bg-gradient-to-r from-sky-400/65 via-fuchsia-400/55 to-pink-400/65" />
          <div className="-mt-3.5 h-7 w-7 rounded-full border-2 border-[#091122] bg-gradient-to-br from-sky-300 to-pink-400" />
          <div className="mt-1.5 h-2 w-20 rounded-full bg-white/85" />
          <div className="mt-2 flex w-4/5 flex-col gap-1.5">
            <div className="h-3 w-full rounded bg-white/15" />
            <div className="h-3 w-full rounded bg-white/10" />
          </div>
        </div>
      )}
      {id === "crest" && (
        <div className="relative mt-3 flex w-44 flex-col items-center gap-1.5 rounded-xl border border-pink-400/40 bg-[#091122]/90 px-3 pb-3 pt-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="absolute -top-4 h-8 w-8 rounded-full border-2 border-sky-300 bg-gradient-to-br from-sky-400 to-pink-500 shadow-[0_0_16px_rgba(236,72,153,0.6)]" />
          <div className="h-2 w-20 rounded-full bg-white/85" />
          <div className="h-1.5 w-14 rounded-full bg-white/40" />
          <div className="mt-1 h-3.5 w-full rounded-md bg-sky-400/20" />
          <div className="h-3.5 w-full rounded-md bg-pink-400/20" />
        </div>
      )}
      {id === "portrait" && (
        <div className="grid w-56 grid-cols-[0.85fr_1.15fr] gap-2.5 rounded-xl border border-sky-400/35 bg-[#091122]/90 p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="h-24 rounded-lg bg-gradient-to-b from-sky-400/60 via-fuchsia-500/45 to-pink-500/60" />
          <div className="flex flex-col justify-center gap-1.5">
            <div className="h-2.5 w-16 rounded-full bg-white/85" />
            <div className="h-1.5 w-12 rounded-full bg-white/40" />
            <div className="mt-1 h-3.5 w-full rounded bg-white/15" />
            <div className="h-3.5 w-full rounded bg-white/10" />
          </div>
        </div>
      )}
      {id === "bento" && (
        <div className="grid w-56 grid-cols-2 gap-1.5 rounded-xl border border-sky-400/35 bg-[#091122]/90 p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="col-span-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] p-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sky-400 to-pink-400" />
            <div className="h-2 w-16 rounded-full bg-white/80" />
          </div>
          <div className="h-8 rounded-lg border border-sky-400/30 bg-sky-400/15" />
          <div className="h-8 rounded-lg border border-pink-400/30 bg-pink-400/15" />
        </div>
      )}
      {id === "compact" && (
        <div className="flex w-48 flex-col gap-2 rounded-xl border border-sky-400/35 bg-[#091122]/90 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-pink-400" />
            <div className="space-y-1">
              <div className="h-2 w-16 rounded-full bg-white/85" />
              <div className="h-1.5 w-10 rounded-full bg-white/40" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="h-4 flex-1 rounded bg-sky-400/20" />
            <span className="h-4 flex-1 rounded bg-pink-400/20" />
            <span className="h-4 flex-1 rounded bg-white/15" />
          </div>
        </div>
      )}
      {id === "slideshow" && (
        <div className="relative flex w-48 flex-col items-center gap-1.5 rounded-xl border border-sky-400/35 bg-[#091122]/90 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          <div className="font-mono text-[8px] tracking-widest text-sky-300">01 / PROFILE</div>
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-pink-400" />
          <div className="h-2 w-16 rounded-full bg-white/80" />
          <div className="mt-1 h-2.5 w-2.5 rotate-45 border-b border-r border-pink-300" />
        </div>
      )}
    </div>
  );
};

const MiniEntrancePreview = ({ id }) => {
  const loopCls =
    id === "condense"
      ? "upet-mini-loop-condense"
      : id === "sweep"
      ? "upet-mini-loop-sweep"
      : id === "origin"
      ? "upet-mini-loop-origin"
      : id === "deal"
      ? "upet-mini-loop-deal"
      : "";

  return (
    <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#070c18]">
      {/* Ambient subtle glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(65% 65% at 25% 20%, rgba(56, 189, 248, 0.18), transparent 70%), radial-gradient(65% 65% at 80% 80%, rgba(236, 72, 153, 0.18), transparent 70%)",
        }}
      />

      {/* Blueprint outer grid lines */}
      {id === "blueprint" && (
        <div className="pointer-events-none absolute inset-2">
          <div className="absolute inset-x-2 top-2 h-px bg-sky-400/50" />
          <div className="absolute inset-x-2 bottom-2 h-px bg-pink-400/50" />
          <div className="absolute inset-y-2 left-3 w-px bg-sky-400/50" />
          <div className="absolute inset-y-2 right-3 w-px bg-pink-400/50" />
          <span className="absolute left-1.5 top-0.5 font-mono text-[9px] text-sky-300">+</span>
          <span className="absolute right-1.5 top-0.5 font-mono text-[9px] text-pink-300">+</span>
          <span className="absolute bottom-0.5 left-1.5 font-mono text-[9px] text-pink-300">+</span>
          <span className="absolute bottom-0.5 right-1.5 font-mono text-[9px] text-sky-300">+</span>
        </div>
      )}

      {/* Ripple shockwave rings */}
      {id === "ripple" && (
        <>
          <div
            className="pointer-events-none absolute h-14 w-24 rounded-lg border border-sky-400/70"
            style={{ animation: "upet-card-ripple-wave 2.1s ease-out infinite" }}
          />
          <div
            className="pointer-events-none absolute h-14 w-24 rounded-lg border border-pink-400/60"
            style={{ animation: "upet-card-ripple-wave 2.1s ease-out 0.9s infinite" }}
          />
        </>
      )}

      {/* Lock corner brackets */}
      {id === "lock" && (
        <div
          className="pointer-events-none absolute h-16 w-28"
          style={{ animation: "upet-lock-pulse 2s ease-in-out infinite" }}
        >
          <span className="absolute left-0 top-0 h-3 w-3 rounded-tl border-l-2 border-t-2 border-sky-400" />
          <span className="absolute right-0 top-0 h-3 w-3 rounded-tr border-r-2 border-t-2 border-pink-400" />
          <span className="absolute bottom-0 left-0 h-3 w-3 rounded-bl border-b-2 border-l-2 border-pink-400" />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-br border-b-2 border-r-2 border-sky-400" />
        </div>
      )}

      {/* Miniature Card */}
      <div
        className={`relative flex h-14 w-24 flex-col justify-between overflow-hidden rounded-lg border border-white/15 bg-[#0d1526]/95 p-2 shadow-md ${loopCls}`}
        style={
          id === "signal"
            ? { animation: "upet-signal-glitch 2.4s steps(2, end) infinite" }
            : undefined
        }
      >
        {/* Trace orbiting laser beam */}
        {id === "trace" && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
            style={{
              padding: "1.5px",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div className="upet-frame-trace-spinner" />
          </div>
        )}

        {/* Circuit dual racing beams */}
        {id === "circuit" && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
            style={{
              padding: "1.5px",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div className="upet-frame-circuit-spinner" />
          </div>
        )}

        {/* Sweep shimmer */}
        {id === "sweep" && (
          <div
            className="pointer-events-none absolute -inset-y-4 w-10 bg-gradient-to-r from-transparent via-sky-300/50 to-transparent"
            style={{ animation: "upet-card-sweep-beam 2.4s ease-in-out infinite" }}
          />
        )}

        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br from-sky-400 to-pink-400" />
          <div className="space-y-1">
            <div className="h-1.5 w-10 rounded-full bg-white/80" />
            <div className="h-1 w-6 rounded-full bg-white/35" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-sky-400/30" />
          <div className="h-1.5 w-4/5 rounded-full bg-pink-400/30" />
        </div>
      </div>
    </div>
  );
};

const applyThemePreset = (d, preset) => {
  d.card.accent = preset.accent;
  d.card.cardColor = preset.cardColor;
  d.card.bgColor = preset.bgColor;
  d.card.textColor = preset.textColor;
  d.effects.textColor = preset.accent;
  d.effects.cursorColor = preset.accent;
  d.effects.background = preset.bg;
  d.effects.overlay = preset.overlay;
};

export const CardTab = ({ p, up }) => {
  const fontInputRef = useRef();

  const handleFontUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await readFontDataUrl(file);
      const cleanName = file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 40) || "Custom Font";
      up((d) => {
        d.card.font = "custom";
        d.card.customFontUrl = dataUrl;
        d.card.customFontName = cleanName;
      });
      toast.success(`Uploaded font "${cleanName}"`);
    } catch (err) {
      toast.error(err?.message || "Could not upload font file");
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <Panel title="Theme Presets" desc="Apply a complete visual mood in one click.">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {THEME_PRESETS.map((preset) => {
            const active =
              p.card.accent === preset.accent &&
              p.card.cardColor === preset.cardColor &&
              p.effects.background === preset.bg;
            return (
              <button
                type="button"
                key={preset.id}
                data-testid={`theme-preset-${preset.id}`}
                onClick={() => {
                  up((d) => applyThemePreset(d, preset));
                  toast.success(`Applied ${preset.name} theme`);
                }}
                className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all ${
                  active
                    ? "border-white ring-2 ring-white/20"
                    : "border-white/[0.08] hover:border-white/25"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${preset.bgColor} 0%, ${preset.cardColor} 100%)`,
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="h-4 w-4 rounded-full border border-white/30 shadow-sm"
                    style={{ background: preset.accent }}
                  />
                  <span className="rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white/80">
                    {preset.bg}
                  </span>
                </div>
                <div className="truncate text-xs font-bold" style={{ color: preset.textColor }}>
                  {preset.name}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-white/60">
                  {preset.overlay === "none" ? "Clean surface" : `${preset.overlay} overlay`}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Card Layout">
        <ChoiceChips
          testid="card-layout"
          value={p.card.layout}
          options={[
            ["minimal", "Minimal"],
            ["compact", "Compact"],
            ["banner", "Banner"],
            ["slideshow", "Slideshow"],
          ]}
          onChange={(v) => up((d) => { d.card.layout = v; })}
        />
      </Panel>

      <Panel
        title="Typography & Fonts"
        desc="Select from 16 built-in creator & gamer fonts or upload your own .ttf / .woff2 font file."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {FONT_OPTIONS.filter(([id]) => id !== "custom").map(([id, label, css, tag]) => (
            <button
              type="button"
              key={id}
              data-testid={`card-font-${id}`}
              onClick={() => up((d) => { d.card.font = id; })}
              style={{ fontFamily: css }}
              className={`flex min-w-0 flex-col items-start rounded-xl border p-3 text-left transition-all ${
                p.card.font === id
                  ? "border-white bg-white/[0.09]"
                  : "border-white/[0.08] bg-[#060609] hover:border-white/25"
              }`}
            >
              <span className="text-lg font-bold leading-tight text-white">Aa</span>
              <span className="mt-1 w-full truncate text-xs font-semibold text-white">{label}</span>
              <span className="font-sans text-[10px] text-zinc-400">{tag}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#060609] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-white">Custom Font (.ttf, .otf, .woff, .woff2)</div>
              <div className="text-[11px] text-zinc-400">
                {p.card.customFontUrl
                  ? `Active: ${p.card.customFontName || "Uploaded font"}`
                  : "Upload a font file (max 250KB) or paste a direct font URL."}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fontInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
                className="hidden"
                onChange={handleFontUpload}
              />
              <button
                type="button"
                data-testid="upload-custom-font"
                onClick={() => fontInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#050507] transition-colors hover:bg-zinc-200"
              >
                <Upload className="h-3.5 w-3.5" /> Upload font
              </button>
              {p.card.customFontUrl && (
                <button
                  type="button"
                  onClick={() =>
                    up((d) => {
                      d.card.customFontUrl = "";
                      d.card.customFontName = "";
                      if (d.card.font === "custom") d.card.font = "geist";
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Field label="Custom font label">
              <input
                className={inputCls}
                value={p.card.customFontName || ""}
                onChange={(e) => up((d) => { d.card.customFontName = e.target.value; })}
                placeholder="My Display Font"
              />
            </Field>
            <Field label="Or direct font URL (https://...)">
              <input
                className={inputCls}
                value={p.card.customFontUrl?.startsWith("data:") ? "" : p.card.customFontUrl || ""}
                onChange={(e) =>
                  up((d) => {
                    d.card.customFontUrl = e.target.value;
                    if (e.target.value) d.card.font = "custom";
                  })
                }
                placeholder="https://example.com/font.woff2"
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Identity">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Display name">
            <input
              data-testid="card-display-name"
              className={inputCls}
              value={p.displayName}
              onChange={(e) => up((d) => { d.displayName = e.target.value; })}
            />
          </Field>
          <Field label="Alias / subtitle">
            <input
              className={inputCls}
              value={p.alias}
              onChange={(e) => up((d) => { d.alias = e.target.value; })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Bio">
              <textarea
                rows={2}
                className={inputCls}
                value={p.bio}
                onChange={(e) => up((d) => { d.bio = e.target.value; })}
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              className={inputCls}
              value={p.location}
              onChange={(e) => up((d) => { d.location = e.target.value; })}
            />
          </Field>
          <Field label="Bio Formatting">
            <ChoiceChips
              value={p.card.bioStyle || "normal"}
              options={[
                ["normal", "Clean"],
                ["italic", "Italic"],
                ["quote", "“Quoted”"],
              ]}
              onChange={(v) => up((d) => { d.card.bioStyle = v; })}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Geometry & Glass">
        <div className="grid gap-4 md:grid-cols-2">
          <SliderRow
            label="Width"
            value={p.card.width}
            min={340}
            max={560}
            unit="px"
            onChange={(v) => up((d) => { d.card.width = v; })}
          />
          <SliderRow
            label="Corner radius"
            value={p.card.radius}
            min={0}
            max={40}
            unit="px"
            onChange={(v) => up((d) => { d.card.radius = v; })}
          />
          <SliderRow
            label="Opacity"
            value={p.card.alpha}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(v) => up((d) => { d.card.alpha = v; })}
          />
          <SliderRow
            label="Backdrop blur"
            value={p.card.blur}
            min={0}
            max={30}
            unit="px"
            onChange={(v) => up((d) => { d.card.blur = v; })}
          />
          <SliderRow
            label="Border alpha"
            value={p.card.borderAlpha}
            min={0}
            max={0.6}
            step={0.02}
            onChange={(v) => up((d) => { d.card.borderAlpha = v; })}
          />
          <ToggleRow
            label="3D hover tilt"
            checked={p.card.tilt}
            onChange={(v) => up((d) => { d.card.tilt = v; })}
          />
        </div>
      </Panel>

      <Panel title="Colors">
        <div className="grid gap-2 sm:grid-cols-2">
          <ColorRow label="Accent" value={p.card.accent} onChange={(v) => up((d) => { d.card.accent = v; })} />
          <ColorRow label="Card surface" value={p.card.cardColor} onChange={(v) => up((d) => { d.card.cardColor = v; })} />
          <ColorRow label="Page background" value={p.card.bgColor} onChange={(v) => up((d) => { d.card.bgColor = v; })} />
          <ColorRow label="Text color" value={p.card.textColor} onChange={(v) => up((d) => { d.card.textColor = v; })} />
        </div>
      </Panel>
    </div>
  );
};
