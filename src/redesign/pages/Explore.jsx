import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Eye, Music2, Link2, Sparkles, X } from "lucide-react";
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
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    refreshDirectory().then(() => { if (active) setError(''); })
      .catch((reason) => { if (active) setError(reason?.message || 'Profiles could not load.'); });
    return () => { active = false; };
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
    <section className="mx-auto max-w-6xl px-6" data-testid="explore-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black sm:text-5xl lg:text-6xl"><span className="text-3d inline-block">Explore</span></h1>
          <p className="mt-4 text-base text-muted-foreground">Discover pages, themes, and synced music from the user.pet community.</p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 font-mono text-xs text-primary">{users.length} {users.length === 1 ? "profile" : "profiles"}</span>
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="glass flex w-full max-w-md items-center gap-2 rounded-full px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input data-testid="explore-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username, name, or bio…" className="flex-1 bg-transparent text-sm outline-none" />
          {q && (
            <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-muted-foreground hover:text-foreground">
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
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${filter === id ? "bg-primary text-primary-foreground shadow-sm" : "glass text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u, i) => {
          const hasAudio = Boolean(u.profile.audio?.src || u.profile.audio?.embedUrl || u.profile.audio?.title);
          const linkCount = (u.profile.links || []).length;
          return (
            <motion.div key={u.username} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }} whileHover={{ y: -6 }}>
              <Link to={`/${u.username}`} data-testid={`explore-user-${u.username}`} className="glass group flex h-full flex-col justify-between gap-4 rounded-3xl p-5 transition-colors hover:border-primary/40">
                <div className="flex items-start gap-4">
                  <Avatar media={u.profile.media.avatar} name={u.username} size={56} decoration={u.profile.effects.decoration} hue={u.profile.effects.decoHue} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate font-semibold">
                      <span className="truncate">{u.profile.displayName || u.username}</span>
                      {(u.profile.shownBadges || []).slice(0, 3).map((b) => <BadgeIcon key={b} id={b} size={11} />)}
                    </div>
                    <div className="truncate font-mono text-xs text-primary/80">user.pet/{u.username}</div>
                    {u.profile.bio && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{u.profile.bio}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/[.07] pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {linkCount > 0 && <span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3 text-primary/70" />{linkCount}</span>}
                    {hasAudio && <span className="inline-flex max-w-32 items-center gap-1 truncate"><Music2 className="h-3 w-3 shrink-0 text-primary/70" /><span className="truncate">{u.profile.audio?.title || "Audio"}</span></span>}
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono"><Eye className="h-3.5 w-3.5 text-primary/70" />{u.profile.views}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {!users.length && (
          <div className="glass col-span-full flex flex-col items-center justify-center gap-3 rounded-3xl p-10 text-center text-sm text-muted-foreground" data-testid="explore-empty">
            <Sparkles className="h-6 w-6 text-primary" />
            <p>No users found matching your current search or filter.</p>
            {(q || filter !== "popular") && (
              <button type="button" onClick={() => { setQ(""); setFilter("popular"); }} className="rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25">
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
