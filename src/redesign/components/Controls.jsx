import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

export const Panel = ({ title, desc, children, className = "", testid, defaultOpen = true }) => {
  const [mobileOpen, setMobileOpen] = useState(defaultOpen);
  const collapsible = Boolean(title);
  return (
    <section
      data-testid={testid}
      className={`min-w-0 overflow-hidden rounded-2xl border border-sky-400/15 bg-[#080d17]/95 p-4 shadow-[0_18px_50px_-28px_rgba(2,8,23,0.9)] backdrop-blur-xl transition-colors duration-200 hover:border-sky-400/25 md:p-5 ${className}`}
    >
      {collapsible && (
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center gap-3 text-left md:hidden"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-display text-sm font-semibold tracking-tight text-white">{title}</span>
            {desc && <span className="mt-1 block text-xs leading-relaxed text-zinc-400">{desc}</span>}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-sky-300 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
      )}
      {collapsible && (
        <div className="hidden md:block">
          {title && <h3 className="font-display text-sm font-semibold tracking-tight text-white">{title}</h3>}
          {desc && <p className="mt-1 text-xs leading-relaxed text-zinc-400">{desc}</p>}
        </div>
      )}
      {!collapsible && desc && <p className="text-xs leading-relaxed text-zinc-400">{desc}</p>}
      <div className={`min-w-0 ${title || desc ? "mt-4" : ""} ${collapsible && !mobileOpen ? "hidden md:block" : ""}`}>
        {children}
      </div>
    </section>
  );
};

export const SliderRow = ({ label, value, min = 0, max = 100, step = 1, onChange, unit = "", testid }) => (
  <div className="min-w-0 space-y-2">
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="truncate text-zinc-400">{label}</span>
      <span className="shrink-0 font-mono text-sky-300">{Number(value).toFixed(step < 1 ? 2 : 0)}{unit}</span>
    </div>
    <Slider aria-label={label} data-testid={testid} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
  </div>
);

export const ColorRow = ({ label, value, onChange, testid }) => (
  <label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-sky-400/15 bg-[#050911] px-3 py-2 text-xs transition-all hover:border-sky-400/35">
    <span className="truncate text-zinc-400">{label}</span>
    <span className="flex shrink-0 items-center gap-2">
      <span className="font-mono uppercase text-sky-200">{value}</span>
      <input data-testid={testid} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 cursor-pointer rounded-lg border border-sky-400/20 bg-transparent p-0" />
    </span>
  </label>
);

export const ToggleRow = ({ label, checked, onChange, testid }) => (
  <label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-sky-400/15 bg-[#050911] px-3 py-2.5 text-sm text-zinc-100 transition-all hover:border-sky-400/35">
    <span className="truncate">{label}</span>
    <Switch data-testid={testid} checked={checked} onCheckedChange={onChange} />
  </label>
);

export const ChoiceChips = ({ value, options, onChange, testid }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const [id, label] = Array.isArray(option) ? option : [option, option];
      return (
        <button
          type="button"
          key={id}
          data-testid={testid ? `${testid}-${id}` : undefined}
          onClick={() => onChange(id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
            value === id
              ? "bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 text-slate-950 shadow-[0_4px_16px_rgba(56,189,248,0.4)]"
              : "border border-sky-400/15 bg-[#0b1220] text-zinc-300 hover:-translate-y-0.5 hover:border-sky-400/35 hover:text-white"
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
);

export const Field = ({ label, children }) => (
  <label className="block min-w-0 space-y-1.5">
    <span className="block truncate text-xs font-medium text-zinc-400">{label}</span>
    {children}
  </label>
);

export const inputCls = "w-full min-w-0 rounded-xl border border-sky-400/15 bg-[#050911] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/15";
export const btnCls = "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_8px_24px_-6px_rgba(56,189,248,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-4px_rgba(56,189,248,0.8)] active:scale-[0.99] disabled:opacity-50";
export const ghostCls = "inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-[#0b1220] px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/45 hover:bg-sky-400/10 hover:text-white";
export const dangerCls = "inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-5 py-2.5 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-50";

export const PageTitle = ({ title, sub }) => (
  <div className="mb-5 md:mb-8">
    <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
    {sub && <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:mt-2.5 sm:text-sm">{sub}</p>}
  </div>
);
