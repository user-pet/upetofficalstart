import { NavLink, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Suspense, useLayoutEffect, useState } from "react";
import {
  Award,
  ChartNoAxesCombined,
  ExternalLink,
  GalleryVerticalEnd,
  LayoutGrid,
  LogOut,
  Menu,
  PenTool,
  Settings as Cog,
  ShieldCheck,
  Trophy,
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
  editor: Editor,
  profiles: Presets,
  badges: Badges,
  leaderboard: Leaderboard,
  settings: Settings,
  visitors: VisitorAnalytics,
  modview: Modview,
};
const warm = (path) => DASHBOARD_PAGES[path]?.preload?.().catch(() => {});

const NAV = [
  ["overview", "Overview", LayoutGrid],
  ["editor", "Customize", PenTool],
  ["profiles", "Profiles", GalleryVerticalEnd],
  ["badges", "Badges", Award],
  ["leaderboard", "Leaderboard", Trophy],
  ["settings", "Settings", Cog],
  ["visitors", "Visitors", ChartNoAxesCombined],
];

const Sidebar = () => {
  const { user, logout } = useStore();
  const { staff } = useHelpAuth();
  const nav = useNavigate();
  const out = () => {
    logout();
    nav("/");
  };
  return (
    <aside
      data-testid="dashboard-sidebar"
      className="fixed bottom-4 left-4 top-4 z-40 hidden w-64 flex-col rounded-[22px] border border-white/[0.08] bg-[#08080c]/95 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl md:flex"
    >
      <NavLink to="/" className="px-2 py-1" data-testid="sidebar-logo">
        <Logo />
      </NavLink>

      <div className="mt-6 px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Control Room
      </div>

      <nav className="mt-2 flex-1 space-y-1">
        {NAV.filter(([path]) => path !== "visitors" || user.role === "founder").map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={`/dashboard/${path}`}
            onMouseEnter={() => warm(path)}
            onFocus={() => warm(path)}
            data-testid={`sidebar-${path}`}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 text-slate-950 shadow-[0_6px_20px_-4px_rgba(56,189,248,0.55)]"
                  : "text-zinc-400 hover:translate-x-0.5 hover:bg-sky-400/10 hover:text-sky-200"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}

        {(staff?.active || user.role === "founder") && (
          <NavLink
            to="/dashboard/modview"
            onMouseEnter={() => warm("modview")}
            onFocus={() => warm("modview")}
            data-testid="sidebar-modview"
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white text-[#050507]"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              }`
            }
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Modview</span>
          </NavLink>
        )}
      </nav>

      <button
        data-testid="sidebar-view-page"
        onClick={() => nav(`/${user.username}`)}
        className="mb-2 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0c0c12] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white"
      >
        <span>user.pet/{user.username}</span>
        <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      <button
        data-testid="sidebar-logout"
        onClick={out}
        className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/10"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>

      <div
        data-testid="sidebar-profile-box"
        className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#060609] p-3"
      >
        <Avatar media={user.profile.media.avatar} name={user.username} size={38} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-white">{user.username}</div>
          <div className="truncate font-mono text-[10px] text-zinc-400">UID #1 · {user.role || "member"}</div>
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
  const { user, saveState, logout } = useStore();
  const { staff } = useHelpAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);
  const out = () => {
    close();
    logout();
    nav("/");
  };
  const links = NAV.filter(([path]) => path !== "visitors" || user.role === "founder");
  return (
    <>
      <header className="fixed inset-x-3 top-[max(.75rem,env(safe-area-inset-top))] z-40 flex h-14 items-center justify-between rounded-2xl border border-white/[0.08] bg-[#08080c]/95 px-4 backdrop-blur-xl md:hidden">
        <NavLink to="/">
          <Logo />
        </NavLink>
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-28 truncate font-mono text-xs text-zinc-400">
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : `@${user.username}`}
          </span>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open dashboard menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white"
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
            className="max-h-full overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0f] p-2"
            onClick={(event) => event.stopPropagation()}
          >
            {links.map(([path, label, Icon]) => (
              <NavLink
                key={path}
                to={`/dashboard/${path}`}
                onPointerDown={() => warm(path)}
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive ? "bg-white text-[#050507]" : "text-zinc-300"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            {staff?.active && (
              <NavLink
                to="/dashboard/modview"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive ? "bg-white text-[#050507]" : "text-zinc-300"
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4" />
                Modview
              </NavLink>
            )}
            <div className="my-2 border-t border-white/10" />
            <button
              type="button"
              onClick={() => {
                close();
                nav(`/${user.username}`);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-300"
            >
              <ExternalLink className="h-4 w-4" />
              View my page
            </button>
            <button
              type="button"
              onClick={out}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-rose-400"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      )}
      <nav className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-4 rounded-2xl border border-white/10 bg-[#08080c]/95 p-1.5 backdrop-blur-xl md:hidden">
        {NAV.filter(([path]) => ['overview', 'editor', 'profiles', 'settings'].includes(path)).map(
          ([path, label, Icon]) => (
            <NavLink
              key={path}
              to={`/dashboard/${path}`}
              onPointerDown={() => warm(path)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold ${
                  isActive ? "bg-white text-[#050507]" : "text-zinc-400"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          )
        )}
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
            <Route path="editor" element={<Editor />} />
            <Route path="shop" element={<Navigate to="/dashboard/editor" replace />} />
            <Route path="premium" element={<Navigate to="/dashboard/editor" replace />} />
            <Route path="notifications/*" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="profiles" element={<Presets />} />
            <Route path="badges" element={<Badges />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="studio-v2" element={<Navigate to="/dashboard/editor" replace />} />
            {user.role === "founder" && <Route path="visitors" element={<VisitorAnalytics />} />}
            <Route path="modview" element={<Modview />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
