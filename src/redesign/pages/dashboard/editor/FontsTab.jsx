import { useRef } from "react";
import { Sparkles, Type, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ColorRow, ChoiceChips, Field, Panel, inputCls } from "../../../components/Controls";
import { FxText } from "../../../components/ProfileBits";
import { FONT_OPTIONS, TEXT_FX, fontStyle } from "../../../lib/catalog";
import { readFontDataUrl } from "./shared";

const NAME_SIZES = [
  ["sm", "Small"],
  ["md", "Medium"],
  ["lg", "Large"],
  ["xl", "Extra Large"],
];

const BIO_STYLES = [
  ["normal", "Clean"],
  ["italic", "Italic"],
  ["quote", "“Quoted”"],
];

export const FontsTab = ({ p, up }) => {
  const fontInputRef = useRef();
  const sampleName = p.displayName || p.username || "Creator";
  const sampleBio = p.bio || "Your page, your sound, your style.";

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
    <div className="min-w-0 space-y-4" data-testid="editor-fonts-panel">
      <Panel
        title="Profile Font Family"
        desc="Choose from 16 curated creator, editorial, monospace, and gaming typefaces — or upload your own font file."
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {FONT_OPTIONS.filter(([id]) => id !== "custom").map(([id, label, css, tag]) => {
            const active = p.card.font === id;
            return (
              <button
                type="button"
                key={id}
                data-testid={`fonts-option-${id}`}
                onClick={() => up((d) => { d.card.font = id; })}
                style={{ fontFamily: css }}
                className={`group flex min-w-0 flex-col items-start rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                  active
                    ? "border-sky-400 bg-sky-400/[0.12] shadow-[0_0_28px_-8px_rgba(56,189,248,0.55)]"
                    : "border-sky-400/15 bg-[#050911] hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/[0.06]"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-2xl font-bold leading-none text-white transition-transform duration-200 group-hover:scale-105">Aa</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${
                      active ? "bg-gradient-to-r from-sky-300 to-cyan-400 text-slate-950" : "border border-sky-400/15 bg-sky-400/[0.06] text-sky-200/80"
                    }`}
                  >
                    {tag}
                  </span>
                </div>
                <span className="mt-2.5 truncate text-sm font-bold text-white">{label}</span>
                <span className="mt-1 w-full truncate text-xs text-zinc-400">{sampleName}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Font Upload Box */}
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#060609] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Type className="h-3.5 w-3.5 text-zinc-300" />
                <span>Custom Font File (.woff2, .ttf, .otf)</span>
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                {p.card.customFontUrl
                  ? `Active custom font: ${p.card.customFontName || "Uploaded font"}`
                  : "Upload your own typeface file (max 250KB) or paste a direct font URL."}
              </p>
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
                data-testid="upload-custom-font-btn"
                onClick={() => fontInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#050507] transition-colors hover:bg-zinc-200"
              >
                <Upload className="h-3.5 w-3.5" /> Upload Font
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
                  className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Field label="Custom Font Name">
              <input
                className={inputCls}
                value={p.card.customFontName || ""}
                onChange={(e) => up((d) => { d.card.customFontName = e.target.value; })}
                placeholder="e.g. Akira Expanded"
              />
            </Field>
            <Field label="Or Direct Font URL (https://...)">
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

      <Panel
        title="Text Sizing, Bio Style & Start Screen Font"
        desc="Fine-tune your display name scale, bio formatting, and entry screen typography."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Display Name Size">
            <ChoiceChips
              testid="card-name-size"
              value={p.card.nameSize || "md"}
              options={NAME_SIZES}
              onChange={(v) => up((d) => { d.card.nameSize = v; })}
            />
          </Field>

          <Field label="Bio Formatting (Noiz Style)">
            <ChoiceChips
              testid="card-bio-style"
              value={p.card.bioStyle || "normal"}
              options={BIO_STYLES}
              onChange={(v) => up((d) => { d.card.bioStyle = v; })}
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Start Screen Font (Click-to-Enter Gate)">
            <select
              data-testid="entry-font-select"
              value={p.entry.font || ""}
              onChange={(e) => up((d) => { d.entry.font = e.target.value; })}
              className={inputCls}
            >
              <option value="">Match Profile Card Font ({p.card.font})</option>
              {FONT_OPTIONS.filter(([id]) => id !== "custom").map(([id, label, , tag]) => (
                <option key={id} value={id}>
                  {label} ({tag})
                </option>
              ))}
            </select>
          </Field>

          <ColorRow
            label="Primary Text Color"
            value={p.card.textColor}
            onChange={(v) => up((d) => { d.card.textColor = v; })}
          />
        </div>

        {/* Live Specimen Preview */}
        <div
          className="mt-4 rounded-2xl border border-white/[0.08] bg-[#060609] p-4"
          style={{ fontFamily: fontStyle(p.card.font, p.card.customFontUrl) }}
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            <span>Live Typography Specimen</span>
            <span>Font: {p.card.font}</span>
          </div>
          <div className="mt-2 text-xl font-bold text-white">
            <FxText
              fx={p.effects.text}
              text={sampleName}
              style={{ color: p.card.textColor, "--fx-color": p.effects.textColor }}
            />
          </div>
          <p
            className={`mt-1 text-xs text-zinc-300 ${
              p.card.bioStyle === "italic" || p.card.bioStyle === "quote" ? "italic" : ""
            }`}
          >
            {p.card.bioStyle === "quote" ? `“${sampleBio}”` : sampleBio}
          </p>
        </div>
      </Panel>

      <Panel
        title="Animated Text Effects (22 Presets)"
        desc="Add neon glow, glitch, chromatic aberration, gradient shimmer, or typewriter motion to your display name."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {TEXT_FX.map((fxItem) => {
            const [id, label] = Array.isArray(fxItem) ? fxItem : [fxItem, fxItem];
            const active = p.effects.text === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => up((d) => { d.effects.text = id; })}
                className={`flex min-w-0 flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                  active
                    ? "border-white bg-white/[0.09]"
                    : "border-white/[0.08] bg-[#060609] hover:border-white/20"
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
            label="Text Effect Glow Color"
            value={p.effects.textColor}
            onChange={(v) => up((d) => { d.effects.textColor = v; })}
          />
        </div>
      </Panel>
    </div>
  );
};
