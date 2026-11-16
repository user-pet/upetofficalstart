import { NavLink, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Suspense, useLayoutEffect, useState } from "react";
import {
  Award,
  ChartNoAxesCombined,
  ExternalLink,
  FileStack,
  GalleryVerticalEnd,
  Gamepad2,
  LayoutGrid,
  Link2,
  LogOut,
  Menu,
  Moon,
  Music,
  PenTool,
  Puzzle,
  Settings as Cog,
  Share2,
  ShieldCheck,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { useHelpAuth } from "../../../help/context/HelpAuth.jsx";
import { Logo } from "../../components/Logo";
import { Avatar } from "../../components/ProfileBits";
import { lazyWithRetry } from "../../lib/lazyWithRetry";
import { RouteLoading } from "../../components/RouteState";

const Overview = lazyWithRetry(() => import("./Overview"), "dashboard-overview");
const Editor = lazyWithRetry(() => import("./Editor"), "dashboard-editor");
const Badges = lazyWithRetry(() => import("./Badges"), "dashboard-badges");
const Leaderboard = lazyWithRetry(() => import("./Leaderboard"), "dashboard-leaderboard");
const Settings = lazyWithRetry(() => import("./Settings"), "dashboard-settings");
const VisitorAnalytics = lazyWithRetry(() => import("./VisitorAnalytics"), "dashboard-visitors");
const Modview = lazyWithRetry(() => import("./Modview"), "dashboard-modview");
const Presets = lazyWithRetry(() => import("./Presets"), "dashboard-profiles");

const DASHBOARD_PAGES = {
  overview: Overview,
  analytics: Overview,
  share: Overview,
  links: Editor,
  editor: Editor,
  profile: Editor,
  templates: Presets,
  profiles: Presets,
  music: Editor,
  widgets: Editor,
  pages: Editor,
  games: Editor,
  badges: Badges,
  leaderboard: Leaderboard,
  settings: Settings,
  visitors: VisitorAnalytics,
  modview: Modview,
};
const warm = (path) => DASHBOARD_PAGES[path]?.preload?.().catch(() => {});

// Legacy mobile filter reference kept for compatibility: ['overview', 'editor', 'profiles', 'settings']
// Main Section: Overview, Analytics, Share
const MAIN_NAV = [
  ["overview", "Overview", LayoutGrid],
  ["analytics", "Analytics", ChartNoAxesCombined],
  ["share", "Share", Share2],
];

// Your Page Section: Links first (Hierarchy Tweak), then Profile, Templates, Music, Widgets, Pages, Games & setup, Badges
const PAGE_NAV = [
  ["links", "Links", Link2],
  ["editor", "Profile", UserRound],
  ["templates", "Templates", GalleryVerticalEnd],
  ["music", "Music", Music],
  ["widgets", "Widgets", Puzzle],
  ["pages", "Pages", FileStack],
  ["games", "Games & setup", Gamepad2],
  ["badges", "Badges", Award],
];

// Mobile bottom bar quick items
const MOBILE_BOTTOM_NAV = [
  ["overview", "Overview", LayoutGrid],
  ["links", "Links", Link2],
  ["editor", "Profile", PenTool],
  ["templates", "Templates", GalleryVerticalEnd],
  ["settings", "Settings", Cog],
];

const navItemCls = (isActive) =>
  `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-pink-400 via-violet-400 to-sky-400 text-slate-950 shadow-[0_6px_20px_-4px_rgba(244,114,182,0.5)]"
      : "text-zinc-300 hover:translate-x-0.5 hover:bg-pink-400/10 hover:text-pink-200"
  }`;

const Sidebar = () => {
  const { user, logout, theme, toggleTheme } = useStore();
  const { staff } = useHelpAuth();
  const nav = useNavigate();
  const out = () => {
    logout();
    nav("/");
  };
  return (
    <aside
      data-testid="dashboard-sidebar"
      className="fixed bottom-4 left-4 top-4 z-40 hidden w-64 flex-col rounded-[22px] border border-pink-400/20 bg-[#100b22]/92 p-4 shadow-[0_24px_60px_-24px_rgba(8,5,22,0.95)] backdrop-blur-2xl md:flex"
    >
      <div className="flex items-center justify-between px-2 py-1">
        <NavLink to="/" data-testid="sidebar-logo">
          <Logo />
        </NavLink>
        <button
          type="button"
          data-testid="sidebar-theme-toggle"
          onClick={toggleTheme}
          title="Toggle Light / Dark theme"
          aria-label="Toggle Light / Dark theme"
          className="grid h-8 w-8 place-items-center rounded-full border border-pink-400/25 bg-white/[0.05] text-zinc-300 transition-all hover:border-pink-400/50 hover:text-white"
        >
          {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="scroll-thin mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Main Section */}
        <div>
          <div className="px-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pink-300/80">
            Main
          </div>
          <nav className="mt-1.5 space-y-1" aria-label="Main navigation">
            {MAIN_NAV.map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={`/dashboard/${path}`}
                onMouseEnter={() => warm(path)}
                onFocus={() => warm(path)}
                data-testid={`sidebar-${path}`}
                className={({ isActive }) => navItemCls(isActive)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Your Page Section */}
        <div>
          <div className="px-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300/80">
            Your Page
          </div>
          <nav className="mt-1.5 space-y-1" aria-label="Your Page navigation">
            {PAGE_NAV.map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={`/dashboard/${path}`}
                onMouseEnter={() => warm(path)}
                onFocus={() => warm(path)}
                data-testid={`sidebar-${path}`}
                className={({ isActive }) => navItemCls(isActive)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Account & Admin */}
        <div>
          <div className="px-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
            Account
          </div>
          <nav className="mt-1.5 space-y-1" aria-label="Account navigation">
            <NavLink
              to="/dashboard/settings"
              onMouseEnter={() => warm("settings")}
              onFocus={() => warm("settings")}
              data-testid="sidebar-settings"
              className={({ isActive }) => navItemCls(isActive)}
            >
              <Cog className="h-4 w-4 shrink-0" />
              <span>Settings</span>
            </NavLink>

            {(staff?.active || user.role === "founder") && (
              <NavLink
                to="/dashboard/modview"
                onMouseEnter={() => warm("modview")}
                onFocus={() => warm("modview")}
                data-testid="sidebar-modview"
                className={({ isActive }) => navItemCls(isActive)}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Modview &amp; Notes</span>
              </NavLink>
            )}
          </nav>
        </div>
      </div>

      <button
        data-testid="sidebar-view-page"
        onClick={() => nav(`/${user.username}`)}
        className="mt-3 mb-2 flex items-center justify-between rounded-xl border border-pink-400/20 bg-[#150f2c] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-pink-400/45 hover:text-white"
      >
        <span className="truncate">user.pet/{user.username}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-pink-300" />
      </button>

      <div
        data-testid="sidebar-profile-box"
        className="flex items-center gap-3 rounded-2xl border border-pink-400/20 bg-[#0d091a] p-2.5"
      >
        <Avatar media={user.profile.media.avatar} name={user.username} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-white">{user.username}</div>
          <div className="truncate font-mono text-[10px] text-zinc-400">
            UID #1 · {user.role || "member"}
          </div>
        </div>
        <button
          data-testid="sidebar-profile-logout"
          onClick={out}
          title="Logout"
          className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

const MobileNav = () => {
  const { user, saveState, logout, theme, toggleTheme } = useStore();
  const { staff } = useHelpAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);
  const out = () => {
    close();
    logout();
    nav("/");
  };
  return (
    <>
      <header className="fixed inset-x-3 top-[max(.75rem,env(safe-area-inset-top))] z-40 flex h-14 items-center justify-between rounded-2xl border border-pink-400/20 bg-[#100b22]/92 px-4 backdrop-blur-2xl md:hidden">
        <NavLink to="/">
          <Logo />
        </NavLink>
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-28 truncate font-mono text-xs text-zinc-400">
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : `@${user.username}`}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-xl border border-pink-400/20 bg-white/[0.06] text-white"
          >
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open dashboard menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-xl border border-pink-400/20 bg-white/[0.06] text-white"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>
      {open && (
        <div
          className="fixed inset-0 z-[39] bg-black/75 px-3 pb-24 pt-20 backdrop-blur-sm md:hidden"
          onClick={close}
        >
          <nav
            className="max-h-full space-y-3 overflow-y-auto rounded-2xl border border-pink-400/25 bg-[#100b22]/96 p-3 backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <div className="px-2 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-pink-300">
                Main
              </div>
              {MAIN_NAV.map(([path, label, Icon]) => (
                <NavLink
                  key={path}
                  to={`/dashboard/${path}`}
                  onPointerDown={() => warm(path)}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-gradient-to-r from-pink-400 to-sky-400 text-slate-950 font-bold" : "text-zinc-300"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
            <div>
              <div className="px-2 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-sky-300">
                Your Page
              </div>
              {PAGE_NAV.map(([path, label, Icon]) => (
                <NavLink
                  key={path}
                  to={`/dashboard/${path}`}
                  onPointerDown={() => warm(path)}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-gradient-to-r from-pink-400 to-sky-400 text-slate-950 font-bold" : "text-zinc-300"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="border-t border-white/10 pt-2">
              <NavLink
                to="/dashboard/settings"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-gradient-to-r from-pink-400 to-sky-400 text-slate-950 font-bold" : "text-zinc-300"
                  }`
                }
              >
                <Cog className="h-4 w-4" />
                Settings
              </NavLink>
              {(staff?.active || user.role === "founder") && (
                <NavLink
                  to="/dashboard/modview"
                  onClick={close}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-gradient-to-r from-pink-400 to-sky-400 text-slate-950 font-bold" : "text-zinc-300"
                    }`
                  }
                >
                  <ShieldCheck className="h-4 w-4" />
                  Modview
                </NavLink>
              )}
              <button
                type="button"
                onClick={() => {
                  close();
                  nav(`/${user.username}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300"
              >
                <ExternalLink className="h-4 w-4" />
                View my page
              </button>
              <button
                type="button"
                onClick={out}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
      <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-2xl border border-pink-400/20 bg-[#100b22]/95 p-1.5 backdrop-blur-2xl md:hidden">
        {MOBILE_BOTTOM_NAV.map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={`/dashboard/${path}`}
            onPointerDown={() => warm(path)}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-semibold ${
                isActive ? "bg-gradient-to-r from-pink-400 to-sky-400 text-slate-950" : "text-zinc-400"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default function Dashboard() {
  const { user } = useStore();
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return (
    <div className="dash-bg min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="min-h-screen overflow-x-hidden px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] sm:px-4 md:py-8 md:pl-[19rem] md:pr-8">
        <Suspense fallback={<RouteLoading label="Opening this section…" />}>
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="analytics" element={<Overview focusAnalytics />} />
            <Route path="share" element={<Overview focusShare />} />
            <Route path="links" element={<Editor initialTab="links" />} />
            <Route path="editor" element={<Editor />} />
            <Route path="profile" element={<Editor initialTab="card" />} />
            <Route path="templates" element={<Presets />} />
            <Route path="profiles" element={<Presets />} />
            <Route path="music" element={<Editor initialTab="audio" />} />
            <Route path="widgets" element={<Editor initialTab="links" />} />
            <Route path="pages" element={<Editor initialTab="entry" />} />
            <Route path="games" element={<Editor initialTab="links" />} />
            <Route path="badges" element={<Badges />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="shop" element={<Navigate to="/dashboard/editor" replace />} />
            <Route path="premium" element={<Navigate to="/dashboard/editor" replace />} />
            <Route path="notifications/*" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="studio-v2" element={<Navigate to="/dashboard/editor" replace />} />
            {user.role === "founder" && <Route path="visitors" element={<VisitorAnalytics />} />}
            <Route path="modview/*" element={<Modview />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
