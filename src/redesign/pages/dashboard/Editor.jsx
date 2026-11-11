import { useState } from "react";
import {
  Check,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  Music,
  Palette,
  Sparkles,
  Type,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { PageTitle } from "../../components/Controls";
import AudioTab from "./editor/AudioTab";
import { CardTab } from "./editor/CardTab";
import EditorPreview from "./editor/EditorPreview";
import { EffectsTab } from "./editor/EffectsTab";
import { EntryTab } from "./editor/EntryTab";
import { FontsTab } from "./editor/FontsTab";
import { LinksTab } from "./editor/LinksTab";
import LyricsTab from "./editor/LyricsTab";
import { MediaTab } from "./editor/MediaTab";

const TABS = [
  ["media", "Media", ImageIcon],
  ["fonts", "Fonts & Text", Type],
  ["entry", "Entry", Sparkles],
  ["effects", "Effects / VFX", Palette],
  ["card", "Card", Layers],
  ["links", "Links", Link2],
  ["audio", "Audio", Music],
  ["lyrics", "Lyrics", Sparkles],
];

export default function Editor() {
  const { user, updateProfile, saveState } = useStore();
  const [tab, setTab] = useState("media");
  const p = user.profile;

  const up = (mut) => {
    const next = structuredClone(p);
    mut(next);
    const patch = {};
    for (const key of Object.keys(next)) {
      if (JSON.stringify(next[key]) !== JSON.stringify(p[key])) {
        patch[key] = next[key];
      }
    }
    if (Object.keys(patch).length > 0) {
      updateProfile(patch);
    }
  };

  return (
    <div data-testid="editor-page" className="min-w-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title="Profile Editor"
          sub="Every change saves and previews live. Customize your fonts, start screen, 60fps shaders, custom cursors, card layout, links, and synced lyrics."
        />
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="editor-autosave-status"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#0a0a0f] px-3.5 py-2 text-xs font-medium text-zinc-300"
          >
            {saveState === "saving" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> Saving…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Auto-saved
              </>
            )}
          </span>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <label className="sticky top-20 z-30 mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#08080c]/95 px-3 py-2 shadow-lg md:hidden">
        <span className="text-xs font-semibold text-zinc-400">Section</span>
        <select
          data-testid="editor-mobile-tab"
          value={tab}
          onChange={(event) => {
            setTab(event.target.value);
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }}
          className="min-w-0 flex-1 bg-transparent py-1 text-sm font-semibold text-white outline-none"
        >
          {TABS.map(([id, label]) => (
            <option key={id} value={id} className="bg-[#08080c] text-white">
              {label}
            </option>
          ))}
        </select>
      </label>

      {/* Aqua Pill Tab Bar */}
      <div className="mb-6 hidden flex-wrap gap-1.5 rounded-2xl border border-sky-400/15 bg-[#070b14] p-1.5 md:inline-flex">
        {TABS.map(([id, label, Icon]) => {
          const active = tab === id;
          return (
            <button
              type="button"
              key={id}
              data-testid={`editor-tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 text-slate-950 shadow-[0_6px_20px_-4px_rgba(56,189,248,0.55)]"
                  : "text-zinc-400 hover:-translate-y-0.5 hover:bg-sky-400/10 hover:text-sky-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div key={tab} className="min-w-0 overflow-hidden">
          {tab === "media" && <MediaTab p={p} up={up} />}
          {tab === "fonts" && <FontsTab p={p} up={up} />}
          {tab === "entry" && <EntryTab p={p} up={up} />}
          {tab === "effects" && <EffectsTab p={p} up={up} />}
          {tab === "card" && <CardTab p={p} up={up} />}
          {tab === "links" && <LinksTab p={p} up={up} />}
          {tab === "audio" && <AudioTab />}
          {tab === "lyrics" && <LyricsTab />}
        </div>

        <EditorPreview tab={tab} />
      </div>
    </div>
  );
}
