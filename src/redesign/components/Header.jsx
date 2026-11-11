import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, Sun, Moon, LayoutDashboard, ExternalLink, LogOut, MousePointerClick } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useStore } from "../lib/store";
import { Logo } from "./Logo";
import { Avatar } from "./ProfileBits";
import { SiteNavShell } from "./SitePrimitives";
import { CURSOR_PRESETS, getCursorPreviewDataUrl } from "../lib/catalog";
import { setGlobalSiteCursor } from "./SiteCursor";

const TABS = [
  ["Studio", "/#features-title"],
  ["Explore", "/explore"],
  ["Donate", "/donate"],
  ["Help", "/support"],
];

const CursorMenu = () => {
  const [activeCursor, setActiveCursor] = useState(
    () => (typeof window !== "undefined" && localStorage.getItem("upet_site_cursor")) || "neon-arrow"
  );

  const pickCursor = (id) => {
    setActiveCursor(id);
    setGlobalSiteCursor(id, "#6cc4ff");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="site-cursor-picker"
          title="Change website cursor"
          aria-label="Change website cursor"
          className="hidden h-8 items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-2.5 text-[11px] font-semibold text-sky-200 transition-all hover:border-sky-400/45 hover:bg-sky-400/15 hover:text-white sm:inline-flex"
        >
          <MousePointerClick className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden lg:inline">Cursor</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-2xl border border-sky-400/20 bg-[#080d16]/95 p-2 text-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-sky-300">
          Website Aqua Cursor
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sky-400/15" />
        <div className="grid grid-cols-2 gap-1 pt-1">
          {CURSOR_PRESETS.filter(([id]) => id !== "default").slice(0, 8).map(([id, label]) => {
            const preview = getCursorPreviewDataUrl(id, "#6cc4ff");
            const selected = activeCursor === id;
            return (
              <DropdownMenuItem
                key={id}
                onClick={() => pickCursor(id)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/50"
                    : "text-zinc-300 focus:bg-white/10 focus:text-white"
                }`}
              >
                {preview ? <img src={preview} alt="" className="h-4 w-4 shrink-0" /> : <MousePointerClick className="h-3.5 w-3.5" />}
                <span className="truncate">{label}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AccountMenu = () => {
  const { user, logout } = useStore();
  const nav = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="header-account-button"
          className="rounded-full ring-2 ring-sky-400/45 transition-all duration-200 hover:scale-105 hover:ring-sky-300"
        >
          <Avatar media={user.profile.media.avatar} name={user.username} size={34} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border border-sky-400/20 bg-[#080d16]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-semibold text-white">{user.profile.alias}</div>
          <div className="text-xs text-sky-300/80">user.pet/{user.username}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          data-testid="menu-dashboard"
          onClick={() => nav("/dashboard")}
          className="rounded-xl text-zinc-200 focus:bg-sky-400/15 focus:text-sky-200"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-sky-400" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid="menu-go-to-page"
          onClick={() => nav(`/${user.username}`)}
          className="rounded-xl text-zinc-200 focus:bg-sky-400/15 focus:text-sky-200"
        >
          <ExternalLink className="mr-2 h-4 w-4 text-sky-400" />
          Go to page
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          data-testid="menu-logout"
          onClick={() => {
            logout();
            nav("/");
          }}
          className="rounded-xl text-red-400 focus:bg-red-500/15 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Header = () => {
  const { user, theme, toggleTheme } = useStore();
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <SiteNavShell data-testid="header-pill">
        <Link to="/" data-testid="header-logo" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {TABS.map(([label, to]) =>
            to.startsWith("/#") ? (
              <a
                key={to}
                href={to}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-400/10 hover:text-sky-200"
              >
                {label}
              </a>
            ) : (
              <NavLink
                key={to}
                to={to}
                data-testid={`nav-${label.toLowerCase()}`}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sky-400/15 text-sky-200 ring-1 ring-sky-400/35"
                      : "text-zinc-300 hover:-translate-y-0.5 hover:bg-sky-400/10 hover:text-sky-200"
                  }`
                }
              >
                {label}
              </NavLink>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 md:hidden">
            <NavLink
              to="/explore"
              data-testid="nav-explore-mobile"
              className="rounded-full px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-sky-300"
            >
              Explore
            </NavLink>
            <NavLink
              to="/donate"
              data-testid="nav-donate-mobile"
              className="rounded-full px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-sky-300"
            >
              Donate
            </NavLink>
          </div>

          <CursorMenu />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="group hidden h-9 items-center gap-2 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 pl-3.5 pr-1.5 text-xs font-bold text-slate-950 shadow-[0_8px_24px_-6px_rgba(56,189,248,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-4px_rgba(56,189,248,0.9)] sm:inline-flex"
              >
                <span>Dashboard</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-950 text-sky-300 transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <AccountMenu />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-sky-200 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                data-testid="header-login-button"
                className="group inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 pl-3.5 pr-1.5 text-xs font-bold text-slate-950 shadow-[0_8px_26px_-6px_rgba(56,189,248,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(56,189,248,0.9)]"
              >
                <span>Claim your page</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-950 text-sky-300 transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          )}

          <button
            data-testid="theme-toggle"
            onClick={toggleTheme}
            className="grid h-8 w-8 place-items-center rounded-full border border-sky-400/20 bg-white/[0.04] text-zinc-300 transition-all hover:border-sky-400/45 hover:bg-sky-400/10 hover:text-sky-200"
            aria-label="Toggle theme"
          >
            <span key={theme}>
              {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </span>
          </button>
        </div>
      </SiteNavShell>
    </header>
  );
};
