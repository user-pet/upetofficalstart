import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Circle,
  Copy,
  Crown,
  ExternalLink,
  Eye,
  GalleryVerticalEnd,
  Hash,
  Link2,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useStore, fileToDataUrl } from "../../lib/store";
import { Panel, Field, inputCls, PageTitle } from "../../components/Controls";
import { Avatar } from "../../components/ProfileBits";

const Stat = ({ icon: Icon, label, value }) => (
  <div
    className="group rounded-2xl border border-pink-400/15 bg-[#110c22] p-5 shadow-[0_18px_50px_-28px_rgba(8,5,20,0.88)] transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-400/35"
    data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
  >
    <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
      <span>{label}</span>
      <Icon className="h-4 w-4 text-pink-300 transition-transform duration-200 group-hover:scale-110" />
    </div>
    <div className="mt-3 font-display text-3xl font-bold tracking-tight text-white">{value}</div>
  </div>
);

export default function Overview({ focusAnalytics = false, focusShare = false }) {
  const { user, setProfile, refreshProfileAnalytics } = useStore();
  useEffect(() => {
    refreshProfileAnalytics().catch(() => {});
  }, [refreshProfileAnalytics]);
  const nav = useNavigate();
  const file = useRef(null);
  const p = user.profile;
  const days = Math.max(1, Math.floor((Date.now() - user.createdAt) / 86400000));
  const uidNum =
    user.username === "dome" || user.username === "lamp"
      ? 1
      : user.role === "founder"
      ? 2
      : Math.max(3, (String(user.username || "").length * 17) % 400);
  const planTier =
    user.role === "founder"
      ? "Founder"
      : p.badges?.includes("donor") || p.badges?.includes("premium")
      ? "Supporter"
      : "Free Tier";
  const pageUrl = `${window.location.origin}/${p.username}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(pageUrl);
    toast.success("Link copied");
  };

  const sharePage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${p.displayName || p.username} (@${p.username})`,
          text: p.bio || `Check out @${p.username} on user.pet`,
          url: pageUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard?.writeText(pageUrl);
    toast.success("Profile link copied to share");
  };

  const tasks = [
    ["Upload a profile picture", !!p.media.avatar.src, "editor"],
    ["Write a bio", !!p.bio, "editor"],
    ["Add your first link", p.links.length > 0, "links"],
    ["Add music", !!(p.audio.src || p.audio.embedUrl), "music"],
    ["Pick an avatar decoration", !!p.effects.decoration, "editor"],
    ["Enable a widget", p.widgets.discord.enabled || p.widgets.tiktok.enabled, "widgets"],
    ["Customize entry screen", p.entry.title !== "click to enter" || p.entry.mode !== "button", "pages"],
    ["Connect Discord", !!user.connections.discord, "settings"],
  ];
  const done = tasks.filter((t) => t[1]).length;
  // Sort chronologically (oldest on the left, newest on the right)
  const sortedHistory = [...(p.viewHistory || [])].sort((a, b) =>
    String(a.day || "").localeCompare(String(b.day || ""))
  );
  const history = sortedHistory.map((h) => ({ day: String(h.day || "").slice(5), views: h.count }));
  const upload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      setProfile("media.avatar.src", await fileToDataUrl(f, 400, "avatar"));
      setProfile("media.avatar.type", f.type.startsWith("video/") ? "video" : "image");
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error?.message || "Profile picture could not be uploaded");
    }
  };
  return (
    <div data-testid="overview-page">
      <PageTitle
        title={focusAnalytics ? "Analytics" : focusShare ? "Share your page" : "Account overview"}
        sub={
          focusAnalytics
            ? "Chronological profile views and link activity."
            : focusShare
            ? "Copy your public user.pet handle or share your live Bento profile."
            : `Hey, ${p.alias || p.displayName || p.username} — here is how your page is doing.`
        }
      />

      {/* DASHBOARD OVERVIEW CARD ("Account overview") */}
      <section
        data-testid="account-overview-card"
        className="relative mb-5 overflow-hidden rounded-3xl border border-pink-400/25 bg-[#120d24] p-6 shadow-[0_24px_70px_-28px_rgba(8,5,22,0.92)] sm:p-8"
        style={{
          backgroundImage:
            "radial-gradient(60% 65% at 18% 12%, rgba(244,114,182,0.16), transparent 65%), radial-gradient(60% 65% at 85% 88%, rgba(108,196,255,0.15), transparent 65%)",
        }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Centered large live-status pill with pink-to-aqua dot */}
          <div
            data-testid="overview-live-pill"
            className="inline-flex items-center gap-2.5 rounded-full border border-pink-400/35 bg-[#181130] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-pink-200 shadow-[0_0_24px_-6px_rgba(244,114,182,0.45)]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full shadow-[0_0_10px_#f472b6]"
              style={{ background: "linear-gradient(135deg, #f472b6 0%, #a78bfa 50%, #6cc4ff 100%)" }}
            />
            <span>YOUR PAGE IS LIVE</span>
          </div>

          {/* Handle text */}
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            user.pet/<span className="bg-gradient-to-r from-pink-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">{p.username}</span>
          </h2>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            @{p.username} · {p.card?.layout === "bento" ? "Bento Grid" : p.card?.layout || "Bento"} layout
          </p>

          {/* Paired Primary CTA Buttons (Copy link + Share) with pink-to-aqua gradient borders */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              data-testid="overview-copy-link"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-300 via-violet-300 to-sky-300 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-[0_10px_28px_-6px_rgba(244,114,182,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-4px_rgba(108,196,255,0.75)]"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy link ({window.location.host}/{p.username})</span>
            </button>
            <button
              type="button"
              data-testid="overview-share-btn"
              onClick={sharePage}
              className="inline-flex items-center gap-2 rounded-full border border-pink-400/35 bg-[#181130] px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_-8px_rgba(108,196,255,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-[#20173e]"
            >
              <Share2 className="h-3.5 w-3.5 text-pink-300" />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => nav(`/${p.username}`)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#140e28] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-400/40 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-sky-300" />
              <span>Open live</span>
            </button>
          </div>
        </div>

        {/* Clean 2x2 Stats Grid below the actions: User ID, Total Views, Links Live, Plan tier */}
        <div
          data-testid="overview-2x2-stats"
          className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <div className="flex items-center justify-between rounded-2xl border border-pink-400/20 bg-[#0e0a1c]/90 p-4 transition-all duration-200 hover:border-pink-400/40">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                User ID
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-white">#{uidNum}</div>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-pink-400/25 bg-pink-400/10 text-pink-300">
              <Hash className="h-4 w-4" />
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-pink-400/20 bg-[#0e0a1c]/90 p-4 transition-all duration-200 hover:border-pink-400/40">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Views
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-white">
                {Number(p.views || 0).toLocaleString()}
              </div>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
              <Eye className="h-4 w-4" />
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-pink-400/20 bg-[#0e0a1c]/90 p-4 transition-all duration-200 hover:border-pink-400/40">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Links Live
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-white">{p.links.length}</div>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
              <Link2 className="h-4 w-4" />
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-pink-400/20 bg-[#0e0a1c]/90 p-4 transition-all duration-200 hover:border-pink-400/40">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Plan tier
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-white">{planTier}</div>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-pink-400/25 bg-pink-400/10 text-pink-300">
              {user.role === "founder" ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Eye} label="Profile views" value={p.views} />
        <Stat icon={Link2} label="Links" value={p.links.length} />
        <Stat icon={Award} label="Badges" value={p.badges.length} />
        <Stat icon={CalendarDays} label="Days active" value={days} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Views"
          desc={history.length ? "Chronological daily views (oldest to newest)" : "No view activity recorded yet"}
          testid="overview-chart"
        >
          <div className="h-56">
            {history.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#6cc4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(244,114,182,0.25)", background: "#110d20", color: "#fff" }} />
                  <Area type="monotone" dataKey="views" stroke="#f472b6" strokeWidth={2.2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-zinc-400">
                No views yet — share your link.
              </div>
            )}
          </div>
        </Panel>
        <Panel title="Suggestions" desc={`${done}/${tasks.length} complete`} testid="overview-suggestions">
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-sky-400 transition-all duration-300"
              style={{ width: `${(done / tasks.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-1">
            {tasks.map(([t, ok, to], i) => (
              <li key={t}>
                <button
                  data-testid={`suggestion-${i}`}
                  onClick={() => nav(`/dashboard/${to}`)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.06]"
                >
                  {ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-zinc-500" />
                  )}
                  <span className={ok ? "text-zinc-500 line-through" : ""}>{t}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <button
        type="button"
        onClick={() => nav("/dashboard/templates")}
        className="group mt-4 flex w-full items-center gap-4 rounded-2xl border border-pink-400/20 bg-[#110c22] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-400/45 hover:bg-[#16102c] sm:p-5"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-pink-400/25 bg-pink-400/10 text-pink-300">
          <GalleryVerticalEnd className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-sm text-white">Community Templates Hub &amp; Saved Presets</strong>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
            Browse community Bento templates, share your look, or save up to five personal profile presets.
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-pink-300 transition-transform group-hover:translate-x-1" />
      </button>
      <Panel title="Basics" className="mt-4" testid="overview-basics">
        <div className="grid gap-6 md:grid-cols-[auto_1fr_1fr]">
          <div className="flex flex-col items-center gap-3">
            <Avatar
              media={p.media.avatar}
              name={p.username}
              size={84}
              decoration={p.effects.decoration}
              hue={p.effects.decoHue}
              decoSize={p.effects.decoSize}
            />
            <input
              ref={file}
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              hidden
              onChange={upload}
            />
            <button
              data-testid="overview-upload-pfp"
              onClick={() => file.current.click()}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-300 to-sky-300 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-transform hover:scale-105"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload pfp
            </button>
          </div>
          <div className="space-y-3">
            <Field label="Alias">
              <input
                data-testid="overview-alias"
                className={inputCls}
                value={p.alias}
                onChange={(e) => setProfile("alias", e.target.value)}
              />
            </Field>
            <Field label="Display name">
              <input
                data-testid="overview-display-name"
                className={inputCls}
                value={p.displayName}
                onChange={(e) => setProfile("displayName", e.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-3">
            <Field label="Bio">
              <textarea
                data-testid="overview-bio"
                rows={3}
                className={inputCls}
                value={p.bio}
                onChange={(e) => setProfile("bio", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Panel>
    </div>
  );
}
