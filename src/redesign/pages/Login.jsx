import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';

export default function Login() {
  const { login, loginWithGoogle, register, resetPassword } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const claimHandle = params.get('claim') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [domainHint, setDomainHint] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const result = creating ? await register(email, password) : await login(email, password);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (creating) {
      toast.success('Your account is ready. You can now log in.');
      setCreating(false);
      setPassword('');
      return;
    }
    toast.success('Welcome back');
    const requested = params.get('next');
    navigate(
      result.needsClaim
        ? `/claim${claimHandle ? `?username=${encodeURIComponent(claimHandle)}` : ''}`
        : requested || '/dashboard'
    );
  };

  const forgot = async () => {
    const result = await resetPassword(email.trim());
    result.ok ? toast.success('Password reset email sent') : toast.error(result.error);
  };

  const googleLogin = async () => {
    setBusy(true);
    setDomainHint(false);
    const result = await loginWithGoogle();
    setBusy(false);
    if (!result.ok) {
      if (result.code === 'auth/unauthorized-domain') setDomainHint(true);
      toast.error(result.error);
      return;
    }
    toast.success('Welcome back');
    navigate(
      result.needsClaim
        ? `/claim${claimHandle ? `?username=${encodeURIComponent(claimHandle)}` : ''}`
        : params.get('next') || '/dashboard'
    );
  };

  const discordLogin = () => {
    toast.info('Sign in with Google or Email first, then link your Discord in Settings → Connections.');
  };

  return (
    <section className="relative flex min-h-[82vh] items-center justify-center px-4 pb-16 pt-28">
      <div
        className="relative w-full max-w-[430px] overflow-hidden rounded-[24px] border border-sky-400/20 bg-[#080d17]/95 p-7 shadow-[0_32px_90px_-24px_rgba(2,8,23,0.95),0_0_50px_-20px_rgba(56,189,248,0.28)] backdrop-blur-xl sm:p-8"
        data-testid="login-box"
      >
        {claimHandle && (
          <div className="mb-4 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 font-mono text-xs text-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>
                Claiming <strong>user.pet/{claimHandle}</strong>
              </span>
            </div>
          </div>
        )}

        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Welcome to user<span className="text-sky-400">.pet</span>
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400">
            Sign in or claim your interactive 60fps profile page
          </p>
        </div>

        {/* Segmented Sign Up / Sign In Switcher */}
        <div className="mt-6 grid grid-cols-2 rounded-full border border-sky-400/15 bg-[#050810] p-1">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={`rounded-full py-2 text-xs font-bold transition-all duration-200 ${
              creating
                ? 'bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 text-slate-950 shadow-[0_4px_14px_rgba(56,189,248,0.45)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className={`rounded-full py-2 text-xs font-bold transition-all duration-200 ${
              !creating
                ? 'bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 text-slate-950 shadow-[0_4px_14px_rgba(56,189,248,0.45)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            data-testid="google-login-button"
            disabled={busy}
            onClick={googleLogin}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-white px-4 text-xs font-semibold text-[#050507] transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.8z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.4 7.4 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={discordLogin}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-[#5865F2] px-4 text-xs font-semibold text-white transition-all hover:bg-[#4752C4] disabled:opacity-50"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Continue with Discord</span>
          </button>
        </div>

        {domainHint && (
          <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
            <strong>Why Google closed the popup:</strong> Add <code>localhost</code> in Firebase Console → Authentication → Authorized domains, or sign in with your Email &amp; Password below.
          </div>
        )}

        {/* OR Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="rounded-full border border-white/[0.08] bg-[#060609] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            OR
          </span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                data-testid="login-email-input"
                type="email"
                className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#060609] pl-10 pr-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-white/35"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">Password</label>
              <button
                type="button"
                onClick={forgot}
                className="text-[11px] text-zinc-400 transition-colors hover:text-white"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                data-testid="login-password-input"
                type={showPassword ? 'text' : 'password'}
                className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#060609] pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-white/35"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            data-testid="login-submit-button"
            disabled={busy}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-400 px-5 text-xs font-bold text-slate-950 shadow-[0_8px_24px_-6px_rgba(56,189,248,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-4px_rgba(56,189,248,0.9)] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{creating ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => setCreating(!creating)}
            className="font-medium text-zinc-300 transition-colors hover:text-white"
          >
            {creating ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          <Link to="/explore" className="transition-colors hover:text-white">
            Explore →
          </Link>
        </div>
      </div>
    </section>
  );
}
