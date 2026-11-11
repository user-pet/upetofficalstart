import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRound, AtSign, ShieldCheck, Plug, Loader2, Crown, Trash2, Globe, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useStore } from '../../lib/store';
import { iconUrl } from '../../lib/catalog';
import { PageTitle, Panel, Field, inputCls, btnCls, ghostCls, dangerCls } from '../../components/Controls';
import { auth } from '../../../app/firebase';
import { isApprovedFounder } from '../../../app/FounderGate';

function Password() {
  const { changePassword } = useStore();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const save = async (event) => {
    event.preventDefault();
    if (form.next.length < 6) return toast.error('New password must be at least 6 characters');
    if (form.next !== form.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    const result = await changePassword(form.current, form.next);
    setBusy(false);
    if (!result.ok) return toast.error(result.error);
    setForm({ current: '', next: '', confirm: '' });
    toast.success('Password updated');
  };
  return (
    <Panel title={<span className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" />Password</span>} testid="settings-password">
      <form onSubmit={save} className="grid gap-3 md:grid-cols-3">
        <Field label="Current password"><input type="password" className={inputCls} value={form.current} onChange={(event) => setForm({ ...form, current: event.target.value })} autoComplete="current-password" /></Field>
        <Field label="New password"><input type="password" className={inputCls} value={form.next} onChange={(event) => setForm({ ...form, next: event.target.value })} autoComplete="new-password" /></Field>
        <Field label="Confirm new password"><input type="password" className={inputCls} value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} autoComplete="new-password" /></Field>
        <div className="md:col-span-3"><button disabled={busy} className={btnCls}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Update password</button></div>
      </form>
    </Panel>
  );
}

function Identity() {
  const { user, setProfile, renameUser } = useStore();
  const [username, setUsername] = useState(user.username);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => setUsername(user.username), [user.username]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const nextChangeAt = Number(user.usernameChangedAt || 0) + 2 * 60 * 60 * 1000;
  const remaining = Math.max(0, nextChangeAt - now);
  const cooldown = Boolean(user.usernameChangedAt && remaining > 0);
  const cooldownLabel = cooldown ? `${Math.floor(remaining / 3_600_000)}h ${Math.ceil((remaining % 3_600_000) / 60_000)}m` : '';
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const result = await renameUser(username);
    setBusy(false);
    if (!result.ok) return toast.error(result.error);
    toast.success(`Username changed to @${result.username}`);
  };
  return (
    <Panel title={<span className="flex items-center gap-2"><AtSign className="h-4 w-4 text-primary" />Identity</span>} desc="Your username controls your public user.pet URL. It is separate from your display name and alias." testid="settings-alias">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Alias / profile subtitle"><input className={inputCls} value={user.profile.alias} onChange={(event) => setProfile('alias', event.target.value)} /></Field>
        <Field label="Login email"><input className={inputCls} value={user.email} disabled /></Field>
      </div>
      <form onSubmit={submit} className="mt-4 rounded-2xl border border-primary/20 bg-primary/[.05] p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Field label="Username (your user.pet URL)"><div className="flex rounded-xl border bg-background/70 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25"><span className="flex items-center border-r px-3 text-xs text-muted-foreground">user.pet/</span><input data-testid="settings-username-input" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" value={username} disabled={cooldown || busy} onChange={(event) => setUsername(event.target.value.toLowerCase())} autoCapitalize="none" autoCorrect="off" spellCheck={false} /></div></Field>
          <button data-testid="settings-username-save" disabled={cooldown || busy || username.trim().toLowerCase() === user.username} className={`${btnCls} min-h-10 disabled:cursor-not-allowed disabled:opacity-45`}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Change username</button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Use 3–20 letters, numbers, dots, underscores, or hyphens. You can change your username once every 2 hours. Your display name stays unchanged.</p>
        {cooldown && <p className="mt-2 text-xs font-semibold text-amber-300">Next username change available in {cooldownLabel}.</p>}
      </form>
    </Panel>
  );
}

const CONNECTIONS = [
  ['spotify', 'Spotify', 'Spotify username', 'Your Spotify profile username'],
  ['tiktok', 'TikTok', 'TikTok username', '@username'],
  ['github', 'GitHub', 'GitHub username', 'Your GitHub username'],
];

function Connections() {
  const { user, setUser, setProfile, updateProfile } = useStore();
  const [values, setValues] = useState({});
  const [discordBusy, setDiscordBusy] = useState(false);
  useEffect(() => {
    const receiveResult = (result) => {
      if (result?.type === 'upet-discord-error') {
        setDiscordBusy(false);
        toast.error(result.error || 'Discord connection failed');
        return;
      }
      if (result?.type !== 'upet-discord-connected' || result.uid !== user.uid || !/^\d{17,20}$/.test(String(result.connection?.id || ''))) return;
      updateProfile({
        'integrations.discord': result.connection,
        'widgets.discord.userId': result.connection.id,
        'widgets.discord.username': result.connection.username,
        'widgets.discord.handle': result.connection.handle,
        'widgets.discord.avatar': result.connection.avatar,
        'widgets.discord.banner': result.connection.banner,
        'widgets.discord.decoration': result.connection.decoration,
        'widgets.discord.guildTag': result.connection.guildTag,
        'widgets.discord.guildBadge': result.connection.guildBadge,
        'widgets.discord.publicFlags': result.connection.publicFlags,
        'widgets.discord.enabled': true,
      });
      setDiscordBusy(false);
      toast.success(`Discord connected as ${result.connection.username}`);
    };
    const receive = (event) => {
      if (event.origin !== window.location.origin || event.data?.uid !== user.uid) return;
      receiveResult(event.data);
    };
    const hash = window.location.hash;
    if (hash.startsWith('#discord-result=')) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
      try { receiveResult(JSON.parse(decodeURIComponent(hash.slice('#discord-result='.length)))); }
      catch { toast.error('Discord connection could not be completed. Please try again.'); }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [updateProfile, user.uid]);
  const connectDiscord = async () => {
    const popup = window.open('', 'upet-discord-connect', 'popup,width=520,height=760');
    setDiscordBusy(true);
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Sign in again before connecting Discord.');
      const response = await fetch('/api/discord-auth', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error || 'Discord connection could not start.');
      if (popup) popup.location.href = result.url;
      else window.location.href = result.url;
    } catch (error) {
      popup?.close();
      setDiscordBusy(false);
      toast.error(error?.message || 'Discord connection could not start');
    }
  };
  const connect = (id, label) => {
    const value = (values[id] ?? user.connections[id]?.username ?? '').trim();
    if (!value) return toast.error(`Enter your ${label} username first`);
    setUser(`connections.${id}`, { username: value });
    if (id === 'tiktok') updateProfile({ 'widgets.tiktok.username': value, 'widgets.tiktok.enabled': true });
    setValues((current) => ({ ...current, [id]: value }));
    toast.success(`${label} username saved`);
  };
  const disconnect = (id) => {
    const next = { ...user.connections };
    delete next[id];
    setUser('connections', next);
    if (id === 'discord') {
      updateProfile({
        'widgets.discord.userId': '',
        'widgets.discord.username': '',
        'widgets.discord.handle': '',
        'widgets.discord.avatar': '',
        'widgets.discord.banner': '',
        'widgets.discord.decoration': '',
        'widgets.discord.guildTag': '',
        'widgets.discord.guildBadge': '',
        'widgets.discord.publicFlags': 0,
        'widgets.discord.enabled': false,
      });
    }
  };
  return (
    <Panel title={<span className="flex items-center gap-2"><Plug className="h-4 w-4 text-primary" />Connections</span>} desc="Authorize Discord, or type and save the username for another account." testid="settings-connections">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border bg-background/40 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#5865f2]/15">{user.connections.discord?.avatar ? <img src={user.connections.discord.avatar} alt="" className="h-full w-full object-cover" /> : <img src={iconUrl('discord', '5865f2')} alt="" className="h-5 w-5" />}</span>
            <div className="min-w-0 flex-1"><div className="text-sm font-semibold">Discord</div>{user.connections.discord ? <div className="truncate text-xs text-emerald-500">{user.connections.discord.username} <span className="text-muted-foreground">@{user.connections.discord.handle}</span></div> : <div className="text-xs leading-relaxed text-muted-foreground">Opens Discord so you can authorize your account.</div>}</div>
          </div>
          {user.connections.discord ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={discordBusy} onClick={connectDiscord} className={`${btnCls} min-w-0 flex-1`}>{discordBusy && <Loader2 className="h-4 w-4 animate-spin" />}{discordBusy ? 'Opening Discord…' : 'Reconnect Discord'}</button><button type="button" onClick={() => disconnect('discord')} className={`${ghostCls} min-w-0 flex-1`}>Disconnect</button></div> : <button type="button" disabled={discordBusy} onClick={connectDiscord} className={`${btnCls} mt-4 w-full`}>{discordBusy && <Loader2 className="h-4 w-4 animate-spin" />}{discordBusy ? 'Opening Discord…' : 'Connect Discord'}</button>}
        </div>
        {CONNECTIONS.map(([id, label, fieldLabel, placeholder]) => {
          const connection = user.connections[id];
          const value = values[id] ?? connection?.username ?? '';
          return (
            <form key={id} onSubmit={(event) => { event.preventDefault(); connect(id, label); }} className="flex flex-col rounded-2xl border bg-background/40 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15"><img src={iconUrl(id, '38aaff')} alt="" className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{label}</div><div className={`truncate text-xs ${connection ? 'text-emerald-500' : 'text-muted-foreground'}`}>{connection ? `Saved as ${connection.username}` : 'Enter the username shown on your profile'}</div></div>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold text-foreground">{fieldLabel}</span>
                <input data-testid={`connection-${id}-input`} className={`${inputCls} border-primary/35 bg-background/80 placeholder:text-muted-foreground/70 focus:border-primary`} placeholder={placeholder} value={value} onChange={(event) => setValues((current) => ({ ...current, [id]: event.target.value }))} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
              </label>
              <div className="mt-3 flex gap-2">
                {connection && <button type="button" onClick={() => disconnect(id)} className={`${ghostCls} flex-1`}>Remove</button>}
                <button type="submit" data-testid={`connection-${id}-save`} className={`${btnCls} flex-1`}>{connection ? 'Save changes' : `Save ${label}`}</button>
              </div>
            </form>
          );
        })}
      </div>
    </Panel>
  );
}

function FounderAndAccount() {
  const { user, grantFounder } = useStore();

  const handleGrantFounder = () => {
    grantFounder?.();
    toast.success(`Founder role & badges granted to @${user.username}`);
  };

  return (
    <Panel
      title={<span className="flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />Founder access</span>}
      desc="Grant your signed-in account full Founder permissions and official Founder badges."
      testid="settings-founder"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/[.06] p-4">
        <div>
          <div className="text-sm font-bold">Current role: <span className="uppercase text-primary">{user.role || 'member'}</span></div>
          <div className="text-xs text-muted-foreground">Signed in as <span className="font-semibold text-foreground">@{user.username}</span> ({user.email})</div>
        </div>
        <button
          type="button"
          data-testid="grant-founder-button"
          onClick={handleGrantFounder}
          className={btnCls}
        >
          <Crown className="h-4 w-4" />
          {user.role === 'founder' ? 'Refresh Founder role & badges' : 'Grant myself Founder'}
        </button>
      </div>
    </Panel>
  );
}

function DeleteAccount() {
  const { user, deleteUser } = useStore();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const deletedHandle = user.username;
    setBusy(true);
    const result = await deleteUser(deletedHandle);
    setBusy(false);
    if (!result?.ok) {
      toast.error(result?.error || 'Could not delete account.');
      return;
    }
    toast.success(`Account @${deletedHandle} deleted`);
    navigate('/login', { replace: true });
  };

  return (
    <Panel
      title={<span className="flex items-center gap-2 text-rose-400"><Trash2 className="h-4 w-4" />Delete account</span>}
      desc="Permanently delete this account and remove its local profile and session."
      testid="settings-delete-account"
    >
      {!confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Deleting <span className="font-semibold text-foreground">@{user.username}</span> will remove the account and sign you out immediately.
          </p>
          <button
            type="button"
            data-testid="delete-account-button"
            onClick={() => setConfirming(true)}
            className={dangerCls}
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/35 bg-rose-500/10 p-4">
          <div className="text-xs text-rose-200">
            Are you sure you want to delete <span className="font-bold">@{user.username}</span>?
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="cancel-delete-account-button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className={ghostCls}
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="confirm-delete-account-button"
              disabled={busy}
              onClick={handleDelete}
              className={dangerCls}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Confirm delete @{user.username}
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function VerifyOnDiscord() {
  const { user, updateProfile } = useStore();
  const savedCode = user.profile?.integrations?.discordDomain?.code || '';
  const [code, setCode] = useState(savedCode);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCode(user.profile?.integrations?.discordDomain?.code || '');
  }, [user.profile?.integrations?.discordDomain?.code]);

  useEffect(() => {
    if (!savedCode || !user.username) return;
    fetch('/api/well-known-discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, code: savedCode }),
    }).catch(() => {});
  }, [savedCode, user.username]);

  const subdomainUrl = `https://${user.username}.user.pet`;
  const wellKnownUrl = `${subdomainUrl}/.well-known/discord`;

  const handleSave = async (event) => {
    event.preventDefault();
    const raw = code.trim();
    if (!raw) {
      updateProfile({ 'integrations.discordDomain': { code: '', updatedAt: Date.now() } });
      await fetch('/api/well-known-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, code: '' }),
      }).catch(() => {});
      toast.success('Discord domain verification token cleared');
      return;
    }
    const normalized = raw.startsWith('dh=') ? raw : `dh=${raw}`;
    if (!/^dh=[a-zA-Z0-9_-]{6,128}$/.test(normalized)) {
      toast.error('Enter a valid Discord verification code starting with dh=');
      return;
    }
    setBusy(true);
    updateProfile({
      'integrations.discordDomain': {
        code: normalized,
        updatedAt: Date.now(),
      },
    });
    await fetch('/api/well-known-discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, code: normalized }),
    }).catch(() => {});
    setBusy(false);
    setCode(normalized);
    toast.success('Discord verification code active! Click Verify in Discord.');
  };

  const copyText = (value, label) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Verify on Discord
          {savedCode && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Ready to verify
            </span>
          )}
        </span>
      }
      desc="Verify your personal user.pet subdomain on your Discord profile (Connections → Website)."
      testid="settings-discord-domain"
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-background/45 p-4 text-xs leading-relaxed text-muted-foreground">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">How it works in 4 steps</div>
          <ol className="list-decimal space-y-1.5 pl-4 text-foreground/90">
            <li>
              In Discord, open <span className="font-semibold text-foreground">User Settings → Connections → Add → Website (Domain)</span>.
            </li>
            <li>
              Enter <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11px] text-primary">{subdomainUrl}</code> as your domain.
            </li>
            <li>
              Copy the <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">dh=...</code> token Discord shows for <code className="font-mono text-[11px]">/.well-known/discord</code>.
            </li>
            <li>
              Paste it here, click <span className="font-semibold text-foreground">Save &amp; activate</span>, then hit <span className="font-semibold text-foreground">Verify</span> in Discord!
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => copyText(subdomainUrl, 'Subdomain URL')}
              className={`${ghostCls} h-8 px-3 text-[11px]`}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy {subdomainUrl}
            </button>
            {savedCode && (
              <a
                href={`/.well-known/discord?user=${encodeURIComponent(user.username)}`}
                target="_blank"
                rel="noreferrer"
                data-testid="discord-domain-test-link"
                className={`${ghostCls} h-8 px-3 text-[11px]`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Test /.well-known/discord
              </a>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground">Target verification endpoint</div>
              <div className="mt-1 truncate rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2 font-mono text-xs text-foreground/85">
                {wellKnownUrl}
              </div>
            </div>
            <Field label="Discord verification content (dh=...)">
              <input
                data-testid="discord-domain-code-input"
                className={`${inputCls} font-mono text-xs`}
                placeholder="dh=9dd96a71e0fa4e77ff0ba037275fa875cd1cf7e5"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {savedCode && (
              <button
                type="button"
                onClick={() => {
                  setCode('');
                  updateProfile({ 'integrations.discordDomain': { code: '', updatedAt: Date.now() } });
                  toast.success('Verification code removed');
                }}
                className={ghostCls}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              data-testid="discord-domain-save-button"
              className={`${btnCls} flex-1`}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {savedCode ? 'Update dh= token' : 'Save & activate'}
            </button>
          </div>
        </form>
      </div>
    </Panel>
  );
}

export default function Settings() {
  const { user } = useStore();
  const showFounderPanel = isApprovedFounder({ ...user, emailVerified: true });

  return (
    <div className="space-y-4" data-testid="settings-page">
      <PageTitle title="Settings" sub="Security, identity, Discord domain verification, and connected accounts." />
      {showFounderPanel && <FounderAndAccount />}
      <Identity />
      <VerifyOnDiscord />
      <Password />
      <Panel title={<span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Two-factor authentication</span>} desc="Firebase multi-factor authentication will be enabled before public accounts open." testid="settings-2fa">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Coming soon</span>
      </Panel>
      <Connections />
      <DeleteAccount />
    </div>
  );
}
