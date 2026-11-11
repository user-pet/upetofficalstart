import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, Link2 } from "lucide-react";
import { useStore } from "../../../lib/store";
import { PLATFORMS, detectPlatform, iconUrl, BRAND } from "../../../lib/catalog";
import { Panel, SliderRow, ColorRow, ToggleRow, ChoiceChips, Field, inputCls, btnCls } from "../../../components/Controls";
import PlatformIcon from "../../../components/PlatformIcon";
import { DiscordWidget } from "../../../components/Widgets";

const WidgetPanel = ({ id, title, fields }) => {
  const { user, setProfile } = useStore();
  const w = user.profile.widgets[id];
  const set = (k) => (v) => setProfile(`widgets.${id}.${k}`, v);
  return (
    <Panel title={title} testid={`widget-panel-${id}`}>
      <div className="min-w-0 space-y-4">
        <ToggleRow testid={`widget-${id}-enabled`} label="Show on profile" checked={w.enabled} onChange={set("enabled")} />
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map(([k, label, ph]) => (
            <Field key={k} label={label}>
              <input
                data-testid={`widget-${id}-${k}`}
                className={inputCls}
                placeholder={ph}
                value={w[k]}
                onChange={(e) => set(k)(e.target.value.trim())}
              />
            </Field>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SliderRow testid={`widget-${id}-alpha`} label="Alpha" value={w.alpha} min={0} max={1} step={0.01} onChange={set("alpha")} />
          <SliderRow testid={`widget-${id}-radius`} label="Rounding" value={w.radius} min={0} max={32} unit="px" onChange={set("radius")} />
          <ColorRow testid={`widget-${id}-accent`} label="Accent" value={w.accent} onChange={set("accent")} />
        </div>
      </div>
    </Panel>
  );
};

const platformLabel = (platform) => (platform === "namemc" ? "NameMC" : platform[0].toUpperCase() + platform.slice(1));

const DiscordWidgetPanel = () => {
  const { user, setProfile } = useStore();
  const widget = user.profile.widgets.discord;
  const connection = user.connections.discord;
  const set = (key) => (value) => setProfile(`widgets.discord.${key}`, value);
  return (
    <Panel title="Discord widget" desc="Discord identity comes from an authorized account connection." testid="widget-panel-discord">
      {connection ? (
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#060609] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#5865f2]/15">
              {connection.avatar ? (
                <img src={connection.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <img src={iconUrl("discord", "5865f2")} alt="" className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{connection.username}</div>
              <div className="truncate text-xs text-emerald-400">@{connection.handle || connection.username} · Connected</div>
            </div>
            <Link to="/dashboard/settings" className="text-xs font-semibold text-white hover:underline">
              Manage
            </Link>
          </div>
          <ToggleRow testid="widget-discord-enabled" label="Show on profile" checked={widget.enabled} onChange={set("enabled")} />
          <div className="max-w-sm">
            <DiscordWidget cfg={widget} />
          </div>
          <div>
            <p className="mb-2 text-xs text-zinc-400">Card layout</p>
            <ChoiceChips
              testid="widget-discord-layout"
              value={widget.layout || "compact"}
              options={[
                ["compact", "Compact"],
                ["expanded", "Expanded"],
              ]}
              onChange={set("layout")}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleRow testid="widget-discord-banner" label="Show Discord banner" checked={widget.showBanner !== false} onChange={set("showBanner")} />
            <ToggleRow testid="widget-discord-badges" label="Show public Discord badges" checked={widget.showBadges !== false} onChange={set("showBadges")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SliderRow testid="widget-discord-alpha" label="Opacity" value={widget.alpha} min={0} max={1} step={0.01} onChange={set("alpha")} />
            <SliderRow testid="widget-discord-glow" label="Glow" value={widget.glow || 0} min={0} max={1} step={0.05} onChange={set("glow")} />
            <SliderRow testid="widget-discord-radius" label="Border radius" value={widget.radius} min={0} max={40} unit="px" onChange={set("radius")} />
            <ColorRow testid="widget-discord-accent" label="Accent colour" value={widget.accent} onChange={set("accent")} />
          </div>
          {!connection.fetchedAt && (
            <p className="text-xs text-zinc-400">
              Reconnect Discord in Settings to import your banner, avatar decoration, guild tag, and public badges.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-white/[0.12] bg-[#060609] p-4">
          <div>
            <p className="text-sm font-semibold text-white">Connect Discord first</p>
            <p className="mt-1 text-xs text-zinc-400">You’ll sign in with Discord and approve basic identity access.</p>
          </div>
          <Link to="/dashboard/settings" className={btnCls}>
            Connect Discord
          </Link>
        </div>
      )}
    </Panel>
  );
};

export function LinksTab() {
  const { user, setProfile } = useStore();
  const links = user.profile.links;
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const urlRef = useRef(null);
  const ls = user.profile.linkStyle;
  const setL = (k) => (v) => setProfile(`linkStyle.${k}`, v);
  const detected = detectPlatform(url);

  const preset = (pl) => {
    setUrl(BRAND[pl][1]);
    setLabel("");
    setTimeout(() => {
      urlRef.current?.focus();
      urlRef.current?.setSelectionRange(BRAND[pl][1].length, BRAND[pl][1].length);
    }, 0);
  };

  const add = (e) => {
    e.preventDefault();
    const normalizedUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    try {
      new URL(normalizedUrl);
    } catch {
      return toast.error("Paste a complete link first");
    }
    const platform = detectPlatform(normalizedUrl);
    setProfile("links", [
      ...links,
      { id: Date.now().toString(36), url: normalizedUrl, label: label.trim() || platformLabel(platform), platform },
    ]);
    setUrl("");
    setLabel("");
    toast.success("Link added");
  };

  const move = (i, d) => {
    const next = [...links];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setProfile("links", next);
  };

  const dropAt = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...links];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setProfile("links", next);
    setDragIndex(null);
  };

  const edit = (i, k, v) => setProfile(`links[${i}].${k}`, v);

  return (
    <div className="min-w-0 space-y-4">
      <Panel title="Links" desc="Platform icons are detected from the URL automatically." testid="links-panel">
        <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#060609] p-4">
          <form onSubmit={add} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(160px,0.45fr)_auto] lg:items-end">
            <Field label="Paste a link">
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  ref={urlRef}
                  data-testid="link-url-input"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`${inputCls} pl-10`}
                  placeholder="youtube.com/@you"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </Field>
            <Field label="Button text (optional)">
              <input
                data-testid="link-label-input"
                className={inputCls}
                placeholder={url ? platformLabel(detected) : "My channel"}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </Field>
            <button data-testid="link-add-button" className={`${btnCls} h-11 shrink-0 justify-center px-5`}>
              <Plus className="h-4 w-4" />
              Add link
            </button>
          </form>
          {url && (
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
              <PlatformIcon platform={detected} color={`#${BRAND[detected][0]}`} size={15} />
              <span>Detected as {platformLabel(detected)}</span>
            </div>
          )}
        </div>

        <div className="mt-4" data-testid="link-presets">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-zinc-400">Quick start</span>
            <button
              type="button"
              onClick={() => setShowAllPlatforms((value) => !value)}
              className="flex items-center gap-1 text-xs font-semibold text-white hover:underline"
            >
              {showAllPlatforms ? "Show less" : "More platforms"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllPlatforms ? "rotate-180" : ""}`} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(showAllPlatforms ? PLATFORMS : PLATFORMS.slice(0, 8)).map((pl) => (
              <button
                key={pl}
                type="button"
                aria-label={`Start a ${platformLabel(pl)} link`}
                data-testid={`link-preset-${pl}`}
                onClick={() => preset(pl)}
                className="flex h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-[#060609] px-3 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
              >
                <PlatformIcon platform={pl} color={`#${BRAND[pl][0]}`} size={15} />
                {platformLabel(pl)}
              </button>
            ))}
          </div>
        </div>

        {/* Contained 2-row stacked link items so they never overflow into EditorPreview */}
        <ul className="mt-5 min-w-0 space-y-3">
          {links.map((l, i) => (
            <li
              key={l.id}
              data-testid={`link-row-${i}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropAt(i)}
              onDragEnd={() => setDragIndex(null)}
              className={`min-w-0 space-y-2.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060609] p-3.5 transition-opacity ${
                dragIndex === i ? "opacity-50 ring-2 ring-white/30" : ""
              }`}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:flex-nowrap">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08]"
                  style={{
                    color: `#${BRAND[l.platform]?.[0] || BRAND.website[0]}`,
                    background: `#${BRAND[l.platform]?.[0] || BRAND.website[0]}16`,
                  }}
                >
                  <PlatformIcon platform={l.platform} color="currentColor" size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <input
                    aria-label="Button text"
                    className={`${inputCls} py-2 font-semibold`}
                    value={l.label}
                    placeholder="Button text"
                    onChange={(e) => edit(i, "label", e.target.value)}
                  />
                </div>

                <select
                  aria-label="Platform icon"
                  data-testid={`link-platform-${i}`}
                  value={l.platform}
                  onChange={(e) => edit(i, "platform", e.target.value)}
                  className="h-10 w-32 shrink-0 rounded-xl border border-white/[0.09] bg-[#0c0c12] px-2.5 text-xs text-white outline-none focus:border-white/35"
                >
                  {PLATFORMS.map((pl) => (
                    <option key={pl} value={pl}>
                      {platformLabel(pl)}
                    </option>
                  ))}
                </select>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-25"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === links.length - 1}
                    onClick={() => move(i, 1)}
                    className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-25"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete link"
                    data-testid={`link-delete-${i}`}
                    onClick={() => setProfile("links", links.filter((x) => x.id !== l.id))}
                    className="grid h-9 w-9 place-items-center rounded-lg text-rose-400 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                <input
                  aria-label="Destination URL"
                  className={`${inputCls} py-2 font-mono text-xs text-zinc-300`}
                  value={l.url}
                  placeholder="https://..."
                  onChange={(e) => {
                    edit(i, "url", e.target.value);
                    edit(i, "platform", detectPlatform(e.target.value));
                  }}
                />
              </div>
            </li>
          ))}
          {!links.length && <li className="text-sm text-zinc-500">No links yet.</li>}
        </ul>
      </Panel>

      <Panel title="Link style" desc="Icons, colors and glow." testid="link-style">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-6">
            {[
              ["mode", ["list", "icons"]],
              ["iconColor", ["brand", "accent", "white"]],
            ].map(([k, opts]) => (
              <div key={k} className="flex gap-1.5">
                {opts.map((o) => (
                  <button
                    type="button"
                    key={o}
                    data-testid={`link-style-${k}-${o}`}
                    onClick={() => setL(k)(o)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      ls[k] === o
                        ? "bg-white text-[#050507]"
                        : "border border-white/[0.08] bg-[#111117] text-zinc-300 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <SliderRow testid="link-glow" label="Glow" value={ls.glow} min={0} max={1.5} step={0.05} onChange={setL("glow")} />
            <SliderRow testid="link-icon-size" label="Icon size" value={ls.size} min={12} max={32} unit="px" onChange={setL("size")} />
            <SliderRow testid="link-radius" label="Rounding" value={ls.radius} min={0} max={24} unit="px" onChange={setL("radius")} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ColorRow testid="link-glow-color" label="Glow color (custom)" value={ls.glowColor || "#6cc4ff"} onChange={setL("glowColor")} />
            <button
              type="button"
              data-testid="link-glow-brand"
              onClick={() => setL("glowColor")("")}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                !ls.glowColor
                  ? "border-white bg-white/[0.09] text-white"
                  : "border-white/[0.08] bg-[#060609] text-zinc-400 hover:border-white/25"
              }`}
            >
              Use brand colors for glow
            </button>
          </div>
        </div>
      </Panel>

      <DiscordWidgetPanel />
      <WidgetPanel
        id="tiktok"
        title="TikTok widget"
        fields={[
          ["username", "TikTok username", "@username"],
          ["videoUrl", "Video URL to embed (optional)", "https://www.tiktok.com/@user/video/..."],
        ]}
      />
    </div>
  );
}

export default LinksTab;
