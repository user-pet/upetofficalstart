import { useStore } from "../../../lib/store";
import { Panel, SliderRow, ColorRow, ToggleRow, Field, inputCls } from "../../../components/Controls";
import { BadgeIcon, Tip } from "../../../components/ProfileBits";

const Chips = ({ value, options, onChange, testid }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((o) => <button key={o} data-testid={`${testid}-${o}`} onClick={() => onChange(o)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${value === o ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20"}`}>{o}</button>)}
  </div>
);

const LAYOUTS = [
  ["minimal", "Minimal", <><div className="mx-auto h-5 w-5 rounded-full bg-primary/60" /><div className="mx-auto mt-1.5 h-1.5 w-10 rounded bg-primary/40" /><div className="mx-auto mt-2 flex w-10 justify-center gap-1">{[0, 1, 2].map((i) => <div key={i} className="h-2 w-2 rounded-sm bg-primary/30" />)}</div></>],
  ["banner", "Banner", <><div className="h-5 w-full rounded bg-primary/40" /><div className="mx-auto -mt-2.5 h-5 w-5 rounded-full border-2 border-background bg-primary/70" /><div className="mx-auto mt-1 h-1.5 w-10 rounded bg-primary/40" /></>],
  ["compact", "Compact", <><div className="flex items-center gap-1.5"><div className="h-5 w-5 rounded-full bg-primary/60" /><div className="space-y-1"><div className="h-1.5 w-10 rounded bg-primary/40" /><div className="h-1.5 w-6 rounded bg-primary/25" /></div></div><div className="mt-2 h-2 w-full rounded bg-primary/25" /></>],
  ["slideshow", "Slideshow", <div className="space-y-1">{[0.6, 0.4, 0.25].map((o, i) => <div key={i} className="h-3 w-full rounded" style={{ background: `hsl(var(--primary) / ${o})` }} />)}</div>],
];

const THEME_PRESETS = [
  { id: "midnight", name: "Midnight Glass", accent: "#62b5ff", cardColor: "#0e1d33", textColor: "#eaf4ff", bgColor: "#07111f", alpha: 0.72, blur: 22, radius: 28 },
  { id: "cyber", name: "Cyber Neon", accent: "#a855f7", cardColor: "#160d29", textColor: "#f5edff", bgColor: "#090414", alpha: 0.78, blur: 26, radius: 24 },
  { id: "obsidian", name: "Obsidian Minimal", accent: "#f4f4f5", cardColor: "#121214", textColor: "#fafafa", bgColor: "#070708", alpha: 0.86, blur: 16, radius: 20 },
  { id: "sakura", name: "Sakura Frost", accent: "#ff85b3", cardColor: "#261321", textColor: "#fff0f6", bgColor: "#120810", alpha: 0.68, blur: 28, radius: 32 },
  { id: "ember", name: "Sunset Ember", accent: "#fb923c", cardColor: "#24140e", textColor: "#fff7ed", bgColor: "#100805", alpha: 0.75, blur: 20, radius: 26 },
  { id: "emerald", name: "Emerald Matrix", accent: "#34d399", cardColor: "#0b211a", textColor: "#ecfdf5", bgColor: "#040f0b", alpha: 0.74, blur: 24, radius: 24 },
];

export default function CardTab() {
  const { user, setProfile, updateProfile } = useStore();
  const p = user.profile;
  const c = p.card;
  const set = (k) => (v) => setProfile(`card.${k}`, v);
  const applyPreset = (preset) => {
    const patch = {
      "card.accent": preset.accent,
      "card.cardColor": preset.cardColor,
      "card.textColor": preset.textColor,
      "card.bgColor": preset.bgColor,
      "card.alpha": preset.alpha,
      "card.blur": preset.blur,
      "card.radius": preset.radius,
    };
    if (updateProfile) updateProfile(patch);
    else Object.entries(patch).forEach(([k, v]) => setProfile(k, v));
  };
  const bs = p.badgeStyle;
  const tt = p.tooltips;
  const setB = (k) => (v) => setProfile(`badgeStyle.${k}`, v);
  const setT = (k) => (v) => setProfile(`tooltips.${k}`, v);
  return (
    <>
      <Panel title="Layout" desc="Slideshow turns your whole page into full-screen slides you scroll down through." testid="card-layouts">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {LAYOUTS.map(([id, label, art]) => (
            <button key={id} data-testid={`layout-${id}`} onClick={() => set("layout")(id)} className={`rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 ${c.layout === id ? "border-primary bg-primary/15 ring-2 ring-primary/30" : "bg-background/40 hover:bg-primary/10"}`}>
              <div className="h-16 rounded-xl bg-background/60 p-2.5">{art}</div>
              <div className="mt-2 text-xs font-medium">{label}</div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Profile text" testid="card-text">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Display name"><input data-testid="card-display-name" className={inputCls} value={p.displayName} onChange={(e) => setProfile("displayName", e.target.value)} /></Field>
          <Field label="Location"><input data-testid="card-location" className={inputCls} value={p.location} onChange={(e) => setProfile("location", e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Bio"><textarea data-testid="card-bio" rows={2} className={inputCls} value={p.bio} onChange={(e) => setProfile("bio", e.target.value)} /></Field></div>
        </div>
      </Panel>
      <Panel title="Shape & glass" testid="card-sliders">
        <div className="grid gap-5 md:grid-cols-2">
          <SliderRow testid="card-alpha" label="Alpha" value={c.alpha} min={0} max={1} step={0.01} onChange={set("alpha")} />
          <SliderRow testid="card-radius" label="Rounding" value={c.radius} min={0} max={48} unit="px" onChange={set("radius")} />
          <SliderRow testid="card-width" label="Size" value={c.width} min={300} max={620} unit="px" onChange={set("width")} />
          <SliderRow testid="card-blur" label="Glass blur" value={c.blur} min={0} max={40} unit="px" onChange={set("blur")} />
          <SliderRow testid="card-border" label="Border alpha" value={c.borderAlpha} min={0} max={1} step={0.01} onChange={set("borderAlpha")} />
          <ToggleRow testid="card-tilt" label="3D tilt on hover" checked={c.tilt} onChange={set("tilt")} />
        </div>
      </Panel>
      <Panel title="Badges" desc="Style how badges look on your page." testid="badge-settings">
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#0b1626] p-3">{["owner", "staff", "verified", "premium", "og"].map((b) => <BadgeIcon key={b} id={b} cfg={bs} />)}</div>
        <div className="space-y-4">
          <Chips testid="badge-style" value={bs.style} options={["soft", "solid", "outline", "plain"]} onChange={setB("style")} />
          <div className="grid gap-5 md:grid-cols-3">
            <SliderRow testid="badge-bg-alpha" label="Background" value={bs.bgAlpha} min={0} max={1} step={0.01} onChange={setB("bgAlpha")} />
            <SliderRow testid="badge-size" label="Size" value={bs.size} min={10} max={28} unit="px" onChange={setB("size")} />
            <SliderRow testid="badge-glow" label="Glow" value={bs.glow} min={0} max={16} unit="px" onChange={setB("glow")} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleRow testid="badge-mono" label="Single color" checked={bs.monochrome} onChange={setB("monochrome")} />
            <ColorRow testid="badge-color" label="Badge color" value={bs.color} onChange={(value) => {
              setProfile("badgeStyle.color", value);
              setProfile("badgeStyle.monochrome", true);
            }} />
          </div>
        </div>
      </Panel>
      <Panel title="Tooltips" desc="Shown when hovering badges and icon links." testid="tooltip-settings">
        <div className="mb-4 flex justify-center rounded-xl bg-[#0b1626] p-3 pt-10"><Tip cfg={{ ...tt, enabled: true }} label="Hover tooltip"><span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">Hover me</span></Tip></div>
        <div className="space-y-4">
          <ToggleRow testid="tooltip-enabled" label="Enable tooltips" checked={tt.enabled} onChange={setT("enabled")} />
          <div className="flex flex-wrap gap-6">
            <Chips testid="tooltip-style" value={tt.style} options={["glass", "solid", "minimal"]} onChange={setT("style")} />
            <Chips testid="tooltip-position" value={tt.position} options={["top", "bottom"]} onChange={setT("position")} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorRow testid="tooltip-color" label="Background" value={tt.color} onChange={setT("color")} />
            <ColorRow testid="tooltip-text" label="Text" value={tt.textColor} onChange={setT("textColor")} />
          </div>
        </div>
      </Panel>
      <Panel title="Theme presets" desc="Apply a curated color and glass palette in one click without changing your text or links." testid="card-theme-presets">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const active = c.accent.toLowerCase() === preset.accent.toLowerCase() && c.cardColor.toLowerCase() === preset.cardColor.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`theme-preset-${preset.id}`}
                onClick={() => applyPreset(preset)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 ${active ? "border-primary bg-primary/15 ring-2 ring-primary/30" : "bg-background/40 hover:bg-primary/10"}`}
              >
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-inner" style={{ background: preset.bgColor }}>
                  <span className="absolute inset-1 rounded-lg" style={{ background: preset.cardColor, border: `1.5px solid ${preset.accent}` }} />
                  <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full" style={{ background: preset.accent }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{preset.name}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground">{preset.accent}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title="Colors" testid="card-colors">
        <div className="grid gap-3 md:grid-cols-2">
          <ColorRow testid="color-accent" label="Accent" value={c.accent} onChange={set("accent")} />
          <ColorRow testid="color-card" label="Card" value={c.cardColor} onChange={set("cardColor")} />
          <ColorRow testid="color-text" label="Text" value={c.textColor} onChange={set("textColor")} />
          <ColorRow testid="color-bg" label="Page background" value={c.bgColor} onChange={set("bgColor")} />
        </div>
      </Panel>
    </>
  );
}
