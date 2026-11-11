import { MousePointerClick, Sparkles, Wand2 } from "lucide-react";
import { ChoiceChips, ColorRow, Panel, SliderRow } from "../../../components/Controls";
import { BackgroundFx, FxText } from "../../../components/ProfileBits";
import { setGlobalSiteCursor } from "../../../components/SiteCursor";
import {
  BG_FX,
  CURSOR_PRESETS,
  DECORATIONS,
  OVERLAY_FX,
  TEXT_FX,
  buildCursorCssValue,
  getCursorPreviewDataUrl,
} from "../../../lib/catalog";

const CURSOR_FX_LIST = [
  ["none", "None", "No trail"],
  ["splash", "Splash Fluid", "WebGL fluid ripples"],
  ["sparkle", "Sparkle Dust", "Glittering star trail"],
  ["blob", "Blob Trail", "Smooth liquid orb"],
  ["crosshair", "Crosshair", "Tactical HUD reticle"],
  ["spotlight", "Spotlight", "Soft radial glow"],
  ["pixel", "Pixel Trail", "8-bit arcade blocks"],
];

export const EffectsTab = ({ p, up }) => (
  <div className="min-w-0 space-y-4">
    <Panel title="Text Effect" desc="Animated effect on your display name (22 presets).">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {TEXT_FX.map((fxItem) => {
          const [id, label] = Array.isArray(fxItem) ? fxItem : [fxItem, fxItem];
          const active = p.effects.text === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => up((d) => { d.effects.text = id; })}
              className={`group flex min-w-0 flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                active
                  ? "border-white bg-white/[0.09]"
                  : "border-white/[0.08] bg-[#060609] hover:border-white/25"
              }`}
            >
              <span className="w-full truncate text-xs font-bold text-white">
                <FxText fx={id} text={label} style={{ "--fx-color": p.effects.textColor }} />
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
                <Sparkles className="h-2.5 w-2.5" /> {id}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 max-w-xs">
        <ColorRow
          label="Effect color"
          value={p.effects.textColor}
          onChange={(v) => up((d) => { d.effects.textColor = v; })}
        />
      </div>
    </Panel>

    <Panel
      title="Background Effect (ReactBits Engine)"
      desc="60fps WebGL shaders & animated canvas scenes behind your card."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {BG_FX.map(([id, label]) => {
          const active = p.effects.background === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => up((d) => { d.effects.background = id; })}
              className={`group relative overflow-hidden rounded-xl border p-2.5 text-left transition-all ${
                active
                  ? "border-white ring-1 ring-white/20"
                  : "border-white/[0.08] hover:border-white/25"
              }`}
            >
              <div className="relative mb-2 h-12 w-full overflow-hidden rounded-lg border border-white/[0.07] bg-[#050507]">
                {id !== "none" ? (
                  <BackgroundFx kind={id} amount={50} color={p.effects.backgroundColor} preview />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] text-zinc-600">Off</div>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-semibold text-white">{label}</span>
                <Wand2 className={`h-3 w-3 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
              </div>
            </button>
          );
        })}
      </div>
      {p.effects.background !== "none" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SliderRow
            label="Intensity"
            value={p.effects.backgroundAmount}
            onChange={(v) => up((d) => { d.effects.backgroundAmount = v; })}
          />
          <ColorRow
            label="Particle / shader color"
            value={p.effects.backgroundColor}
            onChange={(v) => up((d) => { d.effects.backgroundColor = v; })}
          />
        </div>
      )}
    </Panel>

    <Panel title="Overlay Texture" desc="Subtle film grain, CRT scanlines, or vignette.">
      <ChoiceChips
        value={p.effects.overlay}
        options={OVERLAY_FX}
        onChange={(v) => up((d) => { d.effects.overlay = v; })}
      />
    </Panel>

    <Panel
      title="Custom Cursors & Hover Trails"
      desc="Hover or click any cursor card to test it live across your profile and the website. Choose from 12 built-in SVG pointers and pair with a 60fps particle trail."
    >
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-400">
        <span>Built-in Custom Cursor Pointers (12 Presets)</span>
        <span className="font-mono text-[10px] text-sky-300">Click to apply to profile &amp; site</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {CURSOR_PRESETS.map(([id, label, desc]) => {
          const active = (p.effects.cursorPreset || "default") === id;
          const previewUrl = getCursorPreviewDataUrl(id, p.effects.cursorColor || "#6cc4ff");
          const hoverCursor = buildCursorCssValue(id, p.effects.cursorColor || "#6cc4ff");
          return (
            <button
              type="button"
              key={id}
              data-testid={`cursor-preset-${id}`}
              onClick={() => {
                up((d) => { d.effects.cursorPreset = id; });
                setGlobalSiteCursor(id, p.effects.cursorColor || "#6cc4ff");
              }}
              style={{ cursor: hoverCursor || "pointer" }}
              className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                active
                  ? "border-sky-400 bg-sky-400/[0.12] shadow-[0_0_24px_-8px_rgba(56,189,248,0.5)]"
                  : "border-sky-400/15 bg-[#050911] hover:-translate-y-0.5 hover:border-sky-400/40"
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sky-400/20 bg-[#080f1d]">
                {previewUrl ? (
                  <img src={previewUrl} alt={label} className="h-5 w-5" />
                ) : (
                  <MousePointerClick className="h-4 w-4 text-sky-300" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-white">{label}</span>
                <span className="block truncate text-[10px] text-zinc-400">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 mb-2 text-xs font-medium text-zinc-400">Interactive Cursor Trail</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {CURSOR_FX_LIST.map(([id, label, desc]) => {
          const active = p.effects.cursor === id;
          return (
            <button
              type="button"
              key={id}
              data-testid={`cursor-trail-${id}`}
              onClick={() => up((d) => { d.effects.cursor = id; })}
              className={`flex min-w-0 flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                active
                  ? "border-white bg-white/[0.09]"
                  : "border-white/[0.08] bg-[#060609] hover:border-white/25"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="truncate text-xs font-bold text-white">{label}</span>
                <MousePointerClick className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
              </div>
              <span className="mt-0.5 truncate text-[10px] text-zinc-400">{desc}</span>
            </button>
          );
        })}
      </div>

      {(p.effects.cursor !== "none" || (p.effects.cursorPreset && p.effects.cursorPreset !== "default")) && (
        <div className="mt-3 max-w-xs">
          <ColorRow
            label="Cursor & trail color"
            value={p.effects.cursorColor}
            onChange={(v) => {
              up((d) => { d.effects.cursorColor = v; });
              setGlobalSiteCursor(p.effects.cursorPreset || "neon-arrow", v);
            }}
          />
        </div>
      )}
    </Panel>

    <Panel title="Avatar Decoration" desc="Animated Discord-style frame around your avatar.">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => up((d) => { d.effects.decoration = null; })}
          className={`grid h-16 place-items-center rounded-xl border text-xs transition-colors ${
            !p.effects.decoration
              ? "border-white bg-white/[0.09] text-white"
              : "border-white/[0.08] bg-[#060609] text-zinc-400 hover:border-white/25"
          }`}
        >
          None
        </button>
        {DECORATIONS.map((dec) => (
          <button
            type="button"
            key={dec.id}
            onClick={() => up((d) => { d.effects.decoration = dec; })}
            className={`group relative grid h-16 place-items-center rounded-xl border p-1 transition-colors ${
              p.effects.decoration?.id === dec.id
                ? "border-white bg-white/[0.09]"
                : "border-white/[0.08] bg-[#060609] hover:border-white/25"
            }`}
            title={dec.label}
          >
            <img src={dec.url} alt={dec.label} className="h-12 w-12 object-contain" />
          </button>
        ))}
      </div>
      {p.effects.decoration && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SliderRow
            label="Hue shift"
            value={p.effects.decoHue}
            min={0}
            max={360}
            unit="°"
            onChange={(v) => up((d) => { d.effects.decoHue = v; })}
          />
          <SliderRow
            label="Size"
            value={p.effects.decoSize}
            min={100}
            max={160}
            unit="%"
            onChange={(v) => up((d) => { d.effects.decoSize = v; })}
          />
        </div>
      )}
    </Panel>
  </div>
);
