import { useId, useState } from 'react';
import { Sparkles, Volume2, Lock } from 'lucide-react';
import { FxText } from './ProfileBits';
import { fontStyle } from '../lib/catalog';
import { verifyEntryPassword } from '../lib/entryPassword';

export default function EntryGate({ entry, accent = '#6cc4ff', cardFont = 'geist', customFontUrl = '', onEnter }) {
  const passwordId = useId();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [failures, setFailures] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const mode =
    entry?.mode === 'password' && entry.passwordHash && entry.passwordSalt
      ? 'password'
      : entry?.mode === 'anywhere'
      ? 'anywhere'
      : 'button';
  const title = entry?.title || 'click to enter';
  const resolvedFont = fontStyle(entry?.font || cardFont || 'geist', customFontUrl);

  const checkPassword = async (event) => {
    event.preventDefault();
    if (Date.now() < lockedUntil) {
      setError('Too many attempts. Please wait a few seconds and try again.');
      return;
    }
    setChecking(true);
    try {
      if (await verifyEntryPassword(password, entry)) {
        setFailures(0);
        onEnter();
      } else {
        const nextFailures = failures + 1;
        setFailures(nextFailures);
        if (nextFailures >= 5) setLockedUntil(Date.now() + 10_000);
        setError('That password is incorrect.');
        setPassword('');
      }
    } catch {
      setError('Could not check that password. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const directEntry = mode !== 'password';
  return (
    <div
      data-testid="profile-entry-screen"
      className={`group absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-[#050507]/75 px-6 text-center backdrop-blur-2xl transition-all duration-300 ${
        directEntry ? 'cursor-pointer hover:bg-[#050507]/65' : ''
      }`}
      style={{ fontFamily: resolvedFont }}
      onClick={directEntry ? onEnter : undefined}
      onKeyDown={
        directEntry
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onEnter();
              }
            }
          : undefined
      }
      role={directEntry ? 'button' : undefined}
      tabIndex={directEntry ? 0 : undefined}
      aria-label={directEntry ? 'Enter profile' : undefined}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl transition-transform duration-500 group-hover:scale-110"
        style={{ background: accent }}
      />
      <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-white/[0.09] bg-[#08080c]/85 px-8 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 group-hover:border-white/20">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300">
          {mode === 'password' ? (
            <Lock className="h-3 w-3" style={{ color: accent }} />
          ) : (
            <Volume2 className="h-3 w-3 animate-pulse" style={{ color: accent }} />
          )}
          <span>{mode === 'password' ? 'Protected Page' : 'Interactive Profile'}</span>
        </div>
        <div
          className="max-w-xl text-2xl font-bold tracking-tight text-white sm:text-4xl"
          style={{ textShadow: `0 0 32px ${accent}77` }}
        >
          <FxText fx={entry?.textEffect || 'none'} text={title} style={{ color: '#ffffff', '--fx-color': accent }} />
        </div>
        {entry?.subtitle && <p className="max-w-md text-sm leading-relaxed text-zinc-300">{entry.subtitle}</p>}
        {mode === 'password' ? (
          <form
            onSubmit={checkPassword}
            onClick={(event) => event.stopPropagation()}
            className="mt-2 flex w-full max-w-xs flex-col gap-3"
          >
            <label className="text-xs font-medium uppercase tracking-widest text-zinc-400" htmlFor={passwordId}>
              Password
            </label>
            <input
              id={passwordId}
              data-testid="profile-entry-password"
              type="password"
              autoComplete="off"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              className="rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-center text-white outline-none focus:border-white"
            />
            <button
              data-testid="profile-enter"
              disabled={checking}
              className="rounded-full bg-white px-5 py-3 text-xs font-bold text-[#050507] disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Enter profile'}
            </button>
            {error && (
              <p role="alert" className="text-sm text-red-300">
                {error}
              </p>
            )}
          </form>
        ) : (
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 font-mono text-[11px] font-medium text-zinc-200 transition-all group-hover:border-white/30 group-hover:bg-white/[0.12]">
            <Sparkles className="h-3 w-3" style={{ color: accent }} />
            <span data-testid="profile-enter">Click anywhere to enter</span>
          </div>
        )}
      </div>
    </div>
  );
}
