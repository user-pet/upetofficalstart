import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Eye, Music2, Link2, Sparkles, X, LayoutGrid, List, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useStore } from "../lib/store";
import { Avatar, BadgeIcon } from "../components/ProfileBits";

const FILTERS = [
  ["popular", "Most viewed"],
  ["verified", "Verified & Staff"],
  ["music", "With music"],
  ["az", "A–Z"],
];

export default function Explore() {
  const { db, refreshDirectory } = useStore();
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  useEffect(() => {
    let active = true;
    refreshDirectory()
      .then(() => {
        if (active) setError("");
      })
      .catch((reason) => {
        if (active) setError(reason?.message || "Profiles could not load.");
      });
    return () => {
      active = false;
    };
  }, [refreshDirectory]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("popular");
  const users = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = Object.values(db.users).filter((u) => {
      if (u.banned) return false;
      const haystack = `${u.username} ${u.profile.alias || ""} ${u.profile.displayName || ""} ${u.profile.bio || ""}`.toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (filter === "verified") {
        const badges = u.profile.badges || u.profile.shownBadges || [];
        return badges.some((b) => ["owner", "staff", "verified", "founder"].includes(b));
      }
      if (filter === "music") {
        return Boolean(u.profile.audio?.src || u.profile.audio?.embedUrl || u.profile.audio?.title);
      }
      return true;
    });
    if (filter === "az") {
      return list.sort((a, b) => (a.profile.displayName || a.username).localeCompare(b.profile.displayName || b.username));
    }
    return list.sort((a, b) => (b.profile.views || 0) - (a.profile.views || 0));
  }, [db, q, filter]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20" data-testid="explore-page">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-8">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            COMMUNITY INDEX
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Explore <span className="font-serif italic font-normal text-foreground/85">Directory</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Real pages crafted by the user.pet community — featuring custom typography, ReactBits shaders, and synced audio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-card/60 px-3.5 py-1.5 font-mono text-xs text-foreground/85">
            {users.length} {users.length === 1 ? "profile" : "profiles"}
          </span>
          <div className="inline-flex rounded-full border border-white/10 bg-card/60 p-1" role="group" aria-label="Directory layout">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`rounded-full p-1.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`rounded-full p-1.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="glass flex w-full max-w-md items-center gap-2 rounded-full px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            data-testid="explore-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by username, name, or bio…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter directory">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-testid={`explore-filter-${id}`}
              onClick={() => setFilter(id)}
              className={`rounded-full px-3.5 py-1.5 font-ui text-xs font-semibold transition-colors ${
                filter === id ? "bg-primary text-primary-foreground shadow-sm" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="mt-8 divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-card/45 backdrop-blur-xl">
          {users.map((u, idx) => {
            const hasAudio = Boolean(u.profile.audio?.src || u.profile.audio?.embedUrl || u.profile.audio?.title);
            const linkCount = (u.profile.links || []).length;
            const domainVerified = Boolean(u.profile.integrations?.discordDomain?.code);
            return (
              <Link
                key={u.username}
                to={`/${u.username}`}
                data-testid={`explore-user-${u.username}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="hidden w-6 font-mono text-xs text-muted-foreground sm:inline-block">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <Avatar media={u.profile.media.avatar} name={u.username} size={44} decoration={u.profile.effects.decoration} hue={u.profile.effects.decoHue} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-display text-sm font-bold text-foreground">
                        {u.profile.displayName || u.username}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">@{u.username}</span>
                      {(u.profile.shownBadges || []).slice(0, 3).map((b) => (
                        <BadgeIcon key={b} id={b} size={11} />
                      ))}
                      {domainVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified domain
                        </span>
                      )}
                    </div>
                    {u.profile.bio && <p className="mt-0.5 truncate text-xs text-muted-foreground max-w-lg">{u.profile.bio}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-muted-foreground">
                  {hasAudio && (
                    <span className="hidden items-center gap-1 text-primary/80 md:inline-flex">
                      <Music2 className="h-3.5 w-3.5" />
                      <span className="max-w-28 truncate">{u.profile.audio?.title || "Audio"}</span>
                    </span>
                  )}
                  {linkCount > 0 && (
                    <span className="hidden items-center gap-1 sm:inline-flex">
                      <Link2 className="h-3.5 w-3.5" />
                      {linkCount}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-primary/70" />
                    {u.profile.views}
                  </span>
                  <ArrowUpRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u, i) => {
            const hasAudio = Boolean(u.profile.audio?.src || u.profile.audio?.embedUrl || u.profile.audio?.title);
            const linkCount = (u.profile.links || []).length;
            const accent = u.profile.card?.accent || "#62b5ff";
            return (
              <motion.div
                key={u.username}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.24) }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={`/${u.username}`}
                  data-testid={`explore-user-${u.username}`}
                  className="glass group relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl p-5 transition-colors hover:border-primary/40"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-75"
                    style={{ background: accent }}
                  />
                  <div className="flex items-start gap-4">
                    <Avatar media={u.profile.media.avatar} name={u.username} size={54} decoration={u.profile.effects.decoration} hue={u.profile.effects.decoHue} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5 truncate font-display font-bold tracking-tight">
                          <span className="truncate">{u.profile.displayName || u.username}</span>
                          {(u.profile.shownBadges || []).slice(0, 3).map((b) => (
                            <BadgeIcon key={b} id={b} size={11} />
                          ))}
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </div>
                      <div className="truncate font-mono text-xs text-primary/80">@{u.username}</div>
                      {u.profile.bio && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {u.profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[.07] pt-3 font-mono text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {linkCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Link2 className="h-3 w-3 text-primary/70" />
                          {linkCount}
                        </span>
                      )}
                      {hasAudio && (
                        <span className="inline-flex max-w-32 items-center gap-1 truncate">
                          <Music2 className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">{u.profile.audio?.title || "Audio"}</span>
                        </span>
                      )}
                      {u.profile.effects?.background && u.profile.effects.background !== "none" && (
                        <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] uppercase text-foreground/65">
                          {u.profile.effects.background}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-primary/70" />
                      {u.profile.views}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {!users.length && (
            <div className="glass col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl p-10 text-center text-sm text-muted-foreground" data-testid="explore-empty">
              <Sparkles className="h-6 w-6 text-primary" />
              <p>No users found matching your current search or filter.</p>
              {(q || filter !== "popular") && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setFilter("popular");
                  }}
                  className="rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
