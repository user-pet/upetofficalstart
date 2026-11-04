import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, LifeBuoy, ExternalLink, Activity, History } from "lucide-react";

const SERVICES = [
  ["Public profile edge & routing", "Operational", "99.98%"],
  ["Dashboard & live editor sync", "Operational", "99.95%"],
  ["Media storage & audio streaming", "Operational", "99.92%"],
  ["Discord OAuth & presence API", "Operational", "99.90%"],
];

const RELEASES = [
  {
    version: "v0.1.02",
    date: "2026",
    title: "Theme Presets, Mobile Responsive Polish & Security Hardening",
    items: [
      "Added one-click curated theme palettes in the Card editor (Midnight Glass, Cyber Neon, Obsidian Minimal, Sakura Frost, Sunset Ember, Emerald Matrix).",
      "Added drag-and-drop reordering for profile links and lyric lines alongside mobile touch controls.",
      "Upgraded Explore directory with filter pills (Most viewed, Verified & Staff, With music, A–Z) and richer profile cards.",
      "Hardened public profile entry gates, OAuth callback state verification, and responsive layouts down to 320px phones.",
    ],
  },
  {
    version: "v0.1.01",
    date: "2026",
    title: "Synced Lyrics Studio, Profile Presets & Help Centre",
    items: [
      "Introduced waveform lyric synchronization with LRC import/export and Spacebar tap-to-sync.",
      "Added up to 5 switchable profile presets so you can save complete looks and switch live anytime.",
      "Launched the dedicated Help Centre and ticket portal at help.user.pet.",
    ],
  },
];

export default function ComingSoon({ name = "Page" }) {
  const key = name.toLowerCase();

  return (
    <section data-testid={`coming-soon-${key}`} className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-start justify-center px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass mb-6 grid h-14 w-14 place-items-center rounded-2xl text-primary">
        {key === "status" ? <Activity className="h-6 w-6" /> : key === "changelog" ? <History className="h-6 w-6" /> : key === "support" ? <LifeBuoy className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-display text-4xl font-black sm:text-5xl lg:text-6xl">
        <span className="text-3d inline-block">{key === "status" ? "System" : key === "changelog" ? "Platform" : "user.pet"}</span>{" "}
        <span className="text-3d-accent inline-block">{name}</span>
      </motion.h1>

      {key === "status" && (
        <div className="mt-8 w-full space-y-4">
          <div className="glass flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>All user.pet systems are operational.</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map(([label, state, uptime]) => (
              <div key={label} className="glass flex items-center justify-between rounded-2xl p-4">
                <div>
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground">{uptime} uptime</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {key === "changelog" && (
        <div className="mt-8 w-full space-y-5">
          {RELEASES.map((release) => (
            <article key={release.version} className="glass rounded-3xl p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-xs font-semibold text-primary">{release.version}</span>
                <span className="text-xs text-muted-foreground">{release.date}</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold">{release.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {release.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {(key === "legal" || key === "terms") && (
        <div className="glass mt-8 w-full space-y-4 rounded-3xl p-6 text-sm leading-relaxed text-muted-foreground">
          <p className="text-base font-medium text-foreground">Acceptable Use & Terms of Service</p>
          <p>By creating or viewing a profile on user.pet, you agree to keep uploaded media, links, and profile content lawful, respectful, and free of malicious code or impersonation.</p>
          <p>You retain ownership of the media and links you publish to your profile, and you can export or delete your profile data at any time from your Dashboard settings.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/privacy" className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/25">Read Privacy Policy</Link>
            <a href="https://help.user.pet/legal/terms" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/5">Full Terms on Help Centre <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      )}

      {key === "support" && (
        <div className="glass mt-8 w-full space-y-4 rounded-3xl p-6 text-sm leading-relaxed text-muted-foreground">
          <p className="text-base font-medium text-foreground">Need help with your account, badges, or profile editor?</p>
          <p>Visit the user.pet Help Centre to browse guides, read FAQs, or open a support ticket with the moderation and support team.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="/help-preview" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground">Open Help Centre <ExternalLink className="h-3.5 w-3.5" /></a>
            <a href="/help-preview/contact" className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/25">Contact & Tickets</a>
          </div>
        </div>
      )}

      {!["status", "changelog", "legal", "terms", "support"].includes(key) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 max-w-md text-base text-muted-foreground">
          We are still polishing this section. Check back shortly.
        </motion.p>
      )}

      <Link to="/" data-testid="coming-soon-home" className="mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-primary/10"><ArrowLeft className="h-4 w-4" />Back home</Link>
    </section>
  );
}
