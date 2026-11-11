import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Sparkles, Check, Copy, ArrowUpRight, ShieldCheck, Zap, Coffee } from "lucide-react";
import { useStore } from "../lib/store";
import { BadgeIcon } from "../components/ProfileBits";

const TIERS = [
  {
    id: "coffee",
    name: "Server Coffee",
    amount: 5,
    tag: "STARTER",
    desc: "Keeps edge caching, custom audio streaming, and profile CDN fast and ad-free.",
    perks: [
      "Permanent Donor Heart badge on your profile",
      "Listed on the community supporters wall",
      "Directly funds zero-ad profile hosting",
    ],
  },
  {
    id: "supporter",
    name: "Core Supporter",
    amount: 15,
    tag: "MOST POPULAR",
    featured: true,
    desc: "Supports new ReactBits shaders, synced lyric engines, and custom domain verification.",
    perks: [
      "Permanent Donor Heart badge with custom glow",
      "Priority username & Discord domain support",
      "Early access to new profile shaders & cursor FX",
      "Highlighted supporter credit in directory",
    ],
  },
  {
    id: "patron",
    name: "Studio Patron",
    amount: 35,
    tag: "PATRON",
    desc: "Backs independent development and high-bitrate media storage for the whole community.",
    perks: [
      "All Core Supporter perks included",
      "Featured spotlight slot on the Explore directory",
      "Custom profile preset shared with the community",
      "Direct feature voting in the Founder channel",
    ],
  },
];

const DIRECT_METHODS = [
  { id: "eth", label: "Ethereum (ERC-20)", value: "0x71C...userpet.eth", full: "0x71C95911E9a5D330f4D621842EC243EE1343292e" },
  { id: "sol", label: "Solana (SOL)", value: "upet...9xK4", full: "upet7Hk9xK4mN2pQr8vWzL5jT3cY1bF6dE8sA4wG9xK4" },
];

export default function Donate() {
  const { user, setProfile } = useStore();
  const [billing, setBilling] = useState("once");
  const [selectedTier, setSelectedTier] = useState("supporter");
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activeTier = TIERS.find((t) => t.id === selectedTier) || TIERS[1];
  const displayAmount = customAmount ? Number(customAmount) || activeTier.amount : activeTier.amount;

  const handleSupport = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (user?.profile) {
      const nextBadges = Array.from(new Set([...(user.profile.badges || []), "donor"]));
      const nextShown = Array.from(new Set([...(user.profile.shownBadges || []), "donor"]));
      setProfile("badges", nextBadges);
      setProfile("shownBadges", nextShown);
      toast.success(`Thank you! The Donor badge has been unlocked on @${user.username}.`);
    } else {
      toast.success(`Thank you for supporting user.pet ($${displayAmount} ${billing === "monthly" ? "/ month" : "one-time"})!`);
    }
  };

  const copyAddress = (label, value) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} address copied`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-2 sm:px-6" data-testid="donate-page">
      {/* Top editorial header */}
      <div className="border-b border-white/[0.08] pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            data-testid="donate-currently-available"
            className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-medium text-emerald-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Currently Available · Independent &amp; Community-Funded
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            100% goes to bandwidth, audio CDN &amp; open profile tools
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:leading-[1.03]">
              Keep <span className="text-primary">user.pet</span> fast, independent, and{" "}
              <span className="font-serif italic font-normal text-foreground/90">human-crafted.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We don’t run ads, sell visitor data, or lock expressive profile effects behind predatory paywalls.
              Community donations fund our global media edge and unlock the permanent{" "}
              <span className="font-semibold text-foreground">Donor badge</span> on your profile.
            </p>
          </div>

          {/* Live Donor Badge Showcase */}
          <div className="rounded-2xl border border-white/[0.09] bg-card/65 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                SUPPORTER PERK PREVIEW
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-400">
                <Heart className="h-3 w-3 fill-rose-400" /> #fb7185
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3.5 rounded-xl border border-white/[0.07] bg-black/35 p-3.5">
              <BadgeIcon id="donor" size={22} cfg={{ style: "soft", bgAlpha: 0.2, glow: 8, size: 20, monochrome: false }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-foreground">
                    {user ? `@${user.username}` : "Your Profile"}
                  </span>
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-300">
                    Donor
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Displays the glowing Donor Heart badge on your card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid: Tiers + Interactive Checkout */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight">Choose a contribution tier</h2>
            <div className="inline-flex rounded-full border border-white/10 bg-card/60 p-1" role="group" aria-label="Donation frequency">
              {[
                ["once", "One-time"],
                ["monthly", "Monthly"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  data-testid={`donate-frequency-${id}`}
                  onClick={() => setBilling(id)}
                  className={`rounded-full px-4 py-1.5 font-ui text-xs font-semibold transition-colors ${
                    billing === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {TIERS.map((tier) => {
              const active = selectedTier === tier.id && !customAmount;
              return (
                <button
                  key={tier.id}
                  type="button"
                  data-testid={`donate-tier-${tier.id}`}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setCustomAmount("");
                  }}
                  className={`group relative w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary/[0.08] ring-2 ring-primary/25"
                      : "border-white/[0.08] bg-card/45 hover:border-white/20 hover:bg-card/75"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {tier.tag}
                      </span>
                      <h3 className="mt-1 font-display text-lg font-bold text-foreground">{tier.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-bold tracking-tight text-foreground">${tier.amount}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {billing === "monthly" ? "/mo" : "once"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>
                  <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs text-foreground/85">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Checkout summary & instant badge activation */}
        <div className="space-y-5">
          <form
            onSubmit={handleSupport}
            className="rounded-2xl border border-white/[0.1] bg-card/75 p-6 backdrop-blur-xl"
            data-testid="donate-checkout-form"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  ● CURRENTLY AVAILABLE
                </div>
                <h3 className="mt-0.5 font-display text-lg font-bold">Complete Contribution</h3>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-bold text-primary">${displayAmount}</div>
                <div className="font-mono text-[10px] uppercase text-muted-foreground">{billing}</div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Custom amount (USD, optional)
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-background/60 px-3 py-2 focus-within:border-primary">
                  <span className="font-mono text-sm text-muted-foreground">$</span>
                  <input
                    data-testid="donate-custom-amount"
                    type="number"
                    min="1"
                    max="10000"
                    placeholder={String(activeTier.amount)}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="ml-2 flex-1 bg-transparent font-mono text-sm outline-none"
                  />
                  <span className="font-mono text-xs text-muted-foreground">USD</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Supporter message / handle (optional)
                </label>
                <input
                  data-testid="donate-note-input"
                  type="text"
                  placeholder={user ? `@${user.username} — keep building!` : "@yourname — keep building!"}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                data-testid="donate-submit-button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-ui text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
              >
                <Heart className="h-4 w-4 fill-current" />
                {submitted
                  ? "Contribution Recorded · Donor Badge Active"
                  : `Donate $${displayAmount} ${billing === "monthly" ? "Monthly" : "Now"}`}
              </button>

              {submitted && (
                <div
                  data-testid="donate-confirmation"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200"
                >
                  Thank you for backing <span className="font-semibold">user.pet</span>!{" "}
                  {user ? (
                    <>
                      Your <span className="font-semibold">Donor badge</span> is now active on{" "}
                      <Link to={`/${user.username}`} className="underline">
                        user.pet/{user.username}
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="underline">
                        Sign in
                      </Link>{" "}
                      to attach the Donor badge to your profile.
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-white/[0.08] pt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Direct Crypto / Tipping Addresses
              </div>
              <div className="mt-2.5 space-y-2">
                {DIRECT_METHODS.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-background/40 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-foreground">{m.label}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{m.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyAddress(m.label, m.full)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-foreground/85 hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-white/[0.07] bg-card/40 p-3">
              <ShieldCheck className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 font-mono text-[11px] font-semibold">Zero Ads</div>
              <div className="text-[10px] text-muted-foreground">100% clean profiles</div>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-card/40 p-3">
              <Zap className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 font-mono text-[11px] font-semibold">60fps Shaders</div>
              <div className="text-[10px] text-muted-foreground">ReactBits powered</div>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-card/40 p-3">
              <Coffee className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 font-mono text-[11px] font-semibold">Donor Badge</div>
              <div className="text-[10px] text-muted-foreground">Instant unlock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
