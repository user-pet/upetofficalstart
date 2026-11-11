import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { iconUrl } from "../lib/catalog";

const SOCIALS = [
  ["discord", "https://discord.gg/"],
  ["x", "https://x.com/"],
  ["tiktok", "https://tiktok.com/"],
  ["instagram", "https://instagram.com/"],
  ["github", "https://github.com/"],
];

const LINKS = [
  ["Explore", "/explore"],
  ["Donate", "/donate"],
  ["Status", "/status"],
  ["Changelog", "/changelog"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Support", "/support"],
];

export const Footer = ({ links = LINKS, socials = SOCIALS, className = "" }) => (
  <footer
    data-testid="site-footer"
    className={`mx-auto mt-24 w-full max-w-6xl border-t border-white/[0.08] px-6 py-14 ${className}`}
  >
    <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
      <div>
        <Logo />
        <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-400">
          Your page, your sound, your style. Claim a one-character handle, customize 60fps ReactBits shaders, interactive start screens, custom fonts, and custom cursors.
        </p>
        <div className="mt-5 flex gap-2">
          {socials.map(([p, href]) => (
            <a
              key={p}
              href={href}
              target="_blank"
              rel="noreferrer"
              data-testid={`footer-social-${p}`}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-[#0c0c12] transition-colors hover:border-white/25 hover:bg-white/[0.06]"
            >
              <img src={iconUrl(p, "ffffff")} alt={p} className="h-4 w-4 opacity-80" />
            </a>
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Product</div>
        <div className="mt-3 flex flex-col gap-2.5">
          {links.slice(0, 3).map(([l, to]) =>
            to.startsWith("http") ? (
              <a key={l} href={to} data-testid={`footer-link-${l.toLowerCase()}`} className="text-xs text-zinc-400 transition-colors hover:text-white">
                {l}
              </a>
            ) : (
              <Link key={l} to={to} data-testid={`footer-link-${l.toLowerCase()}`} className="text-xs text-zinc-400 transition-colors hover:text-white">
                {l}
              </Link>
            )
          )}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Resources</div>
        <div className="mt-3 flex flex-col gap-2.5">
          {links.slice(3, 5).map(([l, to]) =>
            to.startsWith("http") ? (
              <a key={l} href={to} data-testid={`footer-link-${l.toLowerCase()}`} className="text-xs text-zinc-400 transition-colors hover:text-white">
                {l}
              </a>
            ) : (
              <Link key={l} to={to} data-testid={`footer-link-${l.toLowerCase()}`} className="text-xs text-zinc-400 transition-colors hover:text-white">
                {l}
              </Link>
            )
          )}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Legal & Help</div>
        <div className="mt-3 flex flex-col gap-2.5">
          {links.slice(5).map(([l, to]) =>
            to.startsWith("http") ? (
              <a key={l} href={to} data-testid={`footer-link-${l.toLowerCase()}`} className="text-xs text-zinc-400 transition-colors hover:text-white">
                {l}
              </a>
            ) : (
              <Link key={l} to={to} data-testid={`footer-link-${l.toLowerCase()}`} className="text-xs text-zinc-400 transition-colors hover:text-white">
                {l}
              </Link>
            )
          )}
        </div>
      </div>
    </div>

    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6 font-mono text-[11px] text-zinc-500">
      <span>© {new Date().getFullYear()} user.pet · All rights reserved.</span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        All systems operational · v0.2.0
      </span>
    </div>
  </footer>
);
