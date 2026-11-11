import { useState } from "react";
import { Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { ChoiceChips, Field, Panel, btnCls, ghostCls, inputCls } from "../../../components/Controls";
import { FxText } from "../../../components/ProfileBits";
import { FONT_OPTIONS, TEXT_FX } from "../../../lib/catalog";
import { createEntryPassword } from "../../../lib/entryPassword";

const ENTRY_MODES = [
  ["button", "Click Button", "Visitor clicks a sleek pill button to enter & unlock audio."],
  ["anywhere", "Click Anywhere", "Clicking anywhere on the frosted glass screen enters immediately."],
  ["password", "Password Protected", "Requires a secret passphrase before revealing your profile."],
];

const ENTRY_TEMPLATES = [
  ["click to enter", "Minimal Classic"],
  ["[ press to initialize ]", "Cyber Terminal"],
  ["✦ tap to unlock sound ✦", "Aesthetic Glow"],
  ["enter the vault", "Dark Luxury"],
];

export const EntryTab = ({ p, up }) => {
  const [entryPassword, setEntryPassword] = useState("");
  const [savingEntryPassword, setSavingEntryPassword] = useState(false);

  const saveEntryPassword = async () => {
    const clean = entryPassword.trim();
    if (!clean) {
      toast.error("Enter a password first");
      return;
    }
    setSavingEntryPassword(true);
    try {
      const record = await createEntryPassword(clean);
      up((d) => {
        d.entry.mode = "password";
        d.entry.passwordSalt = record.passwordSalt;
        d.entry.passwordHash = record.passwordHash;
      });
      setEntryPassword("");
      toast.success("Entry password updated");
    } catch {
      toast.error("Could not set entry password");
    } finally {
      setSavingEntryPassword(false);
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <Panel
        title="Entry Screen Mode"
        desc="The start screen greets visitors first and unlocks browser autoplay for your background music and video."
      >
        <div className="grid gap-2.5 sm:grid-cols-3">
          {ENTRY_MODES.map(([id, label, desc]) => {
            const active = p.entry.mode === id;
            return (
              <button
                type="button"
                key={id}
                data-testid={`entry-mode-${id}`}
                onClick={() => up((d) => { d.entry.mode = id; })}
                className={`flex min-w-0 flex-col items-start rounded-2xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-white bg-white/[0.09]"
                    : "border-white/[0.08] bg-[#060609] hover:border-white/25"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="truncate text-xs font-bold text-white">{label}</span>
                  <Sparkles className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">{desc}</p>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Start Screen Text, Font & Presets"
        desc="Customize the prompt, subtitle, font family, and animated text effect shown before entering."
      >
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-zinc-400">Quick prompts:</span>
          {ENTRY_TEMPLATES.map(([prompt, name]) => (
            <button
              type="button"
              key={prompt}
              onClick={() => up((d) => { d.entry.title = prompt; })}
              className="rounded-full border border-white/[0.08] bg-[#060609] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
            >
              {name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Title / button text">
            <input
              data-testid="entry-title-input"
              className={inputCls}
              value={p.entry.title}
              onChange={(e) => up((d) => { d.entry.title = e.target.value; })}
              placeholder="click to enter"
            />
          </Field>
          <Field label="Subtitle (optional)">
            <input
              data-testid="entry-subtitle-input"
              className={inputCls}
              value={p.entry.subtitle}
              onChange={(e) => up((d) => { d.entry.subtitle = e.target.value; })}
              placeholder="headphones recommended"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Start Screen Font">
            <select
              value={p.entry.font || ""}
              onChange={(e) => up((d) => { d.entry.font = e.target.value; })}
              className={inputCls}
            >
              <option value="">Match Profile Card Font ({p.card.font})</option>
              {FONT_OPTIONS.filter(([id]) => id !== "custom").map(([id, label, , tag]) => (
                <option key={id} value={id}>
                  {label} ({tag})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Entry Text Animation">
            <ChoiceChips
              value={p.entry.textEffect}
              options={TEXT_FX}
              onChange={(v) => up((d) => { d.entry.textEffect = v; })}
            />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#060609] px-4 py-3">
          <div className="flex items-center gap-2.5 text-xs text-zinc-400">
            <Volume2 className="h-4 w-4 text-white" />
            <span>Live entry title preview:</span>
          </div>
          <div className="font-display text-sm font-bold text-white">
            <FxText
              fx={p.entry.textEffect}
              text={p.entry.title || "click to enter"}
              style={{ "--fx-color": p.card.accent }}
            />
          </div>
        </div>
      </Panel>

      {p.entry.mode === "password" && (
        <Panel
          title="Password Gate"
          desc="Visitors must enter this password before seeing your profile. Stored as a salted SHA-256 hash."
        >
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              type="password"
              className={inputCls}
              value={entryPassword}
              onChange={(e) => setEntryPassword(e.target.value)}
              placeholder={p.entry.passwordHash ? "Enter a new password to replace" : "Set entry password"}
            />
            <button type="button" onClick={saveEntryPassword} disabled={savingEntryPassword} className={btnCls}>
              {p.entry.passwordHash ? "Update password" : "Set password"}
            </button>
            {p.entry.passwordHash && (
              <button
                type="button"
                onClick={() => {
                  up((d) => {
                    d.entry.passwordSalt = "";
                    d.entry.passwordHash = "";
                  });
                  toast.success("Password cleared");
                }}
                className={ghostCls}
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {p.entry.passwordHash
              ? "Password protection is active."
              : "No password hash is set yet; the gate will stay unlocked until you save one."}
          </p>
        </Panel>
      )}
    </div>
  );
};
