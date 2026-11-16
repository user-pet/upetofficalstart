import { useRef } from "react";
import { toast } from "sonner";
import { Upload, Trash2, SlidersHorizontal, RotateCcw, Wand2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { useStore, fileToDataUrl } from "../../../lib/store";
import { Panel, SliderRow, ColorRow, inputCls } from "../../../components/Controls";
import { BackgroundFx, MediaLayer } from "../../../components/ProfileBits";
import { BG_FX } from "../../../lib/catalog";

const SLOTS = [
  ["avatar", "Avatar", 20, "rounded-full", true],
  ["banner", "Banner", 50, "rounded-xl", true],
  ["background", "Background", 100, "rounded-xl", true],
  ["cursor", "Cursor", 5, "rounded-xl", false],
];
const DEFAULTS = { zoom: 1, blur: 0, rotate: 0, size: 100, x: 50, y: 50 };

const MediaBox = ({ slot, label, max, shape, video }) => {
  const { user, setProfile } = useStore();
  const m = user.profile.media[slot];
  const file = useRef(null);
  const set = (k) => (v) => setProfile(`media.${slot}.${k}`, v);
  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > max * 1024 * 1024) return toast.error(`Max ${max}MB`);
    try {
      set("src")(await fileToDataUrl(f, max, slot));
      set("type")(f.type.startsWith("video/") ? "video" : "image");
      toast.success(`${label} uploaded`);
    } catch (error) {
      toast.error(error?.message || `${label} could not be uploaded`);
    }
  };
  return (
    <div
      data-testid={`media-box-${slot}`}
      className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#060609] p-3"
    >
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white">
        <span>{label}</span>
        <span className="font-mono text-[10px] text-zinc-500">{m.src ? "set" : "empty"}</span>
      </div>
      <button
        type="button"
        data-testid={`media-upload-${slot}`}
        onClick={() => file.current.click()}
        className={`group relative grid h-24 w-full place-items-center overflow-hidden border border-dashed border-white/20 bg-[#0b0b10] transition-colors hover:border-white/40 hover:bg-white/[0.04] ${
          shape === "rounded-full" ? "rounded-xl" : shape
        }`}
      >
        {m.src ? (
          <div
            className={`absolute ${
              shape === "rounded-full"
                ? "inset-y-1 left-1/2 aspect-square -translate-x-1/2 overflow-hidden rounded-full"
                : "inset-0 overflow-hidden"
            }`}
          >
            <MediaLayer
              media={m}
              className="h-full w-full"
              style={{ backgroundSize: slot === "avatar" ? `${m.zoom * 100}%` : "cover" }}
            />
          </div>
        ) : (
          <Upload className="h-5 w-5 text-zinc-300 transition-transform group-hover:-translate-y-0.5" />
        )}
      </button>
      <input
        ref={file}
        type="file"
        accept={video ? "image/*,video/mp4,video/webm,video/quicktime" : "image/*"}
        hidden
        onChange={onFile}
      />
      <div className="mt-2 flex gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              data-testid={`media-settings-${slot}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#111118] py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Settings
            </button>
          </PopoverTrigger>
          <PopoverContent
            collisionPadding={12}
            className="max-h-[75dvh] w-[min(18rem,calc(100vw-1.5rem))] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0f] p-4 text-white shadow-2xl"
            align="center"
          >
            <div className="text-sm font-semibold text-white">{label} settings</div>
            <SliderRow testid={`media-${slot}-zoom`} label="Zoom" value={m.zoom} min={1} max={4} step={0.05} unit="x" onChange={set("zoom")} />
            <SliderRow testid={`media-${slot}-blur`} label="Blur" value={m.blur} min={0} max={30} unit="px" onChange={set("blur")} />
            <SliderRow testid={`media-${slot}-rotate`} label="Rotate" value={m.rotate} min={-180} max={180} unit="°" onChange={set("rotate")} />
            <SliderRow testid={`media-${slot}-size`} label="Resize" value={m.size} min={50} max={200} unit="%" onChange={set("size")} />
            <SliderRow testid={`media-${slot}-x`} label="Position X" value={m.x} min={0} max={100} unit="%" onChange={set("x")} />
            <SliderRow testid={`media-${slot}-y`} label="Position Y" value={m.y} min={0} max={100} unit="%" onChange={set("y")} />
            <input
              data-testid={`media-${slot}-url`}
              className={inputCls}
              placeholder="or paste an image URL"
              defaultValue={m.src.startsWith("data:") ? "" : m.src}
              onBlur={(e) => e.target.value && set("src")(e.target.value)}
            />
            <button
              type="button"
              data-testid={`media-${slot}-reset`}
              onClick={() => Object.entries(DEFAULTS).forEach(([k, v]) => set(k)(v))}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset adjustments
            </button>
          </PopoverContent>
        </Popover>
        {m.src && (
          <button
            type="button"
            data-testid={`media-remove-${slot}`}
            onClick={() => {
              set("src")("");
              set("type")("");
            }}
            className="grid w-8 place-items-center rounded-lg bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export function MediaTab() {
  const { storageError, user, setProfile } = useStore();
  const visibleSlots = SLOTS.filter(([slot]) => slot !== "banner" || user.profile.card.layout === "banner");
  const activeBgFx = user.profile.effects?.background || "aurora";
  const bgFxColor = user.profile.effects?.backgroundColor || "#f472b6";

  return (
    <div className="min-w-0 space-y-4">
      <Panel
        title="Media"
        desc="Upload images or looping video, then fine-tune zoom, blur, rotation, size and position. Background images retain up to 4K resolution."
      >
        {storageError && <div className="mb-3 rounded-xl bg-rose-500/10 p-2 text-xs text-rose-400">{storageError}</div>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {visibleSlots.map(([slot, label, max, shape, video]) => (
            <MediaBox key={slot} slot={slot} label={label} max={max} shape={shape} video={video} />
          ))}
        </div>
        {user.profile.card.layout !== "banner" && (
          <p className="mt-3 text-xs text-zinc-400">
            Banner media appears here only when <strong className="text-white">Cover (Banner)</strong> is selected in the Card tab.
          </p>
        )}
      </Panel>

      <Panel
        title="LIVE EFFECTS · Background Shaders"
        desc="Select a live ReactBits shader background (Galaxy, Silk, Iridescence, Clouds, Ghost Fibers, CRT Warp) to give your page instant depth."
        testid="media-live-effects"
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[13px] font-bold uppercase tracking-wider text-pink-300">
            LIVE EFFECTS
          </span>
          <span className="font-mono text-xs text-zinc-400">
            {BG_FX.find(([id]) => id === activeBgFx)?.[1] || activeBgFx}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {BG_FX.slice(0, 12).map(([id, label]) => {
            const active = activeBgFx === id;
            return (
              <button
                type="button"
                key={id}
                data-testid={`live-bg-fx-${id}`}
                onClick={() => setProfile("effects.background", id)}
                className={`group relative overflow-hidden rounded-xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                  active
                    ? "border-pink-400 bg-pink-400/10 ring-1 ring-pink-400/35"
                    : "border-white/[0.08] bg-[#0e0a1c] hover:border-pink-400/35"
                }`}
              >
                <div className="relative mb-2 h-14 w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[#0b0816]">
                  {id !== "none" ? (
                    <BackgroundFx kind={id} amount={68} color={bgFxColor} preview />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-zinc-500">None</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-semibold text-white">{label}</span>
                  <Wand2 className={`h-3.5 w-3.5 shrink-0 ${active ? "text-pink-300" : "text-zinc-500"}`} />
                </div>
              </button>
            );
          })}
        </div>
        {activeBgFx !== "none" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SliderRow
              label="Shader intensity"
              value={user.profile.effects?.backgroundAmount ?? 60}
              onChange={(v) => setProfile("effects.backgroundAmount", v)}
            />
            <ColorRow
              label="Shader accent color"
              value={bgFxColor}
              onChange={(v) => setProfile("effects.backgroundColor", v)}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}

export default MediaTab;
