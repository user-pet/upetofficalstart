import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Eye, Hash, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { subscribePublicRedesign } from '../lib/firebaseStore';
import { ProfileScene, ProfileCard } from '../components/ProfileCard';
import EntryGate from '../components/EntryGate';
import { Logo } from '../components/Logo';
import { buildCursorCssValue } from '../lib/catalog';

export default function ProfilePage() {
  const { username = '' } = useParams();
  const normalized = username.toLowerCase();
  const { db, recordView } = useStore();
  const [profile, setProfile] = useState(() => db.users[normalized]?.profile || null);
  const [views, setViews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const viewRecorded = useRef('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setEntered(false);
    setViews(null);
    let viewsLoaded = false;
    const loadViews = async () => {
      if (viewsLoaded) return;
      viewsLoaded = true;
      try {
        const response = await fetch(`/api/profile-views?username=${encodeURIComponent(normalized)}`);
        const result = await response.json();
        if (active && response.ok) setViews(Number(result.views) || 0);
      } catch { /* The profile remains usable if its counter cannot load. */ }
    };
    const unsubscribe = subscribePublicRedesign(normalized, (result) => {
      setProfile(result);
      setLoading(false);
      if (result && viewRecorded.current !== normalized) {
        viewRecorded.current = normalized;
        Promise.resolve(recordView(normalized)).finally(loadViews);
      }
    }, () => {
      setProfile(null);
      setLoading(false);
    });
    return () => { active = false; unsubscribe(); };
  }, [normalized, recordView]);

  useEffect(() => {
    if (!profile) return undefined;
    const locked = !entered && profile.entry?.mode === 'password' && Boolean(profile.entry?.passwordHash && profile.entry?.passwordSalt);
    const title = locked
      ? `@${profile.username} · user.pet`
      : `${profile.displayName || profile.username} (@${profile.username}) · user.pet`;
    const desc = locked
      ? `Protected profile for @${profile.username} on user.pet.`
      : (profile.bio || `Check out ${profile.displayName || `@${profile.username}`}'s links, music, and profile on user.pet.`);
    document.title = title;
    const setMeta = (attr, key, content) => {
      let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('name', 'theme-color', profile.card?.accent || '#07111f');
    return undefined;
  }, [profile, entered]);

  const cursorCss = buildCursorCssValue(
    profile?.effects?.cursorPreset,
    profile?.effects?.cursorColor || profile?.card?.accent,
    profile?.media.cursor?.src
  );

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  if (!profile) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" data-testid="profile-not-found">
      <h1 className="font-display text-4xl font-black"><span className="text-3d inline-block">user.pet/{username}</span></h1>
      <p className="text-muted-foreground">This username is unclaimed.</p>
      <Link to="/" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Go home</Link>
    </div>
  );

  const onMove = (event) => {
    if (!profile.card.tilt || window.matchMedia?.('(hover: none)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientY - rect.top) / rect.height - 0.5) * -8, y: ((event.clientX - rect.left) / rect.width - 0.5) * 8 });
  };

  const passwordLocked = !entered && profile.entry?.mode === 'password' && Boolean(profile.entry?.passwordHash && profile.entry?.passwordSalt);
  const sceneProfile = passwordLocked
    ? {
        ...profile,
        bio: '',
        links: [],
        badges: [],
        shownBadges: [],
        audio: { ...profile.audio, src: '', embedUrl: '', autoplay: false, lyrics: { ...profile.audio?.lyrics, enabled: false, lines: [] } },
        media: {
          ...profile.media,
          avatar: { ...profile.media?.avatar, src: '' },
          banner: { ...profile.media?.banner, src: '' },
          background: { ...profile.media?.background, src: '' },
        },
        widgets: {
          ...profile.widgets,
          discord: { ...profile.widgets?.discord, enabled: false },
          tiktok: { ...profile.widgets?.tiktok, enabled: false },
        },
      }
    : profile;

  return (
    <div className={`fixed inset-x-0 top-0 z-0 h-[100dvh] ${cursorCss ? 'upet-custom-cursor' : ''}`} data-testid="profile-page" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={cursorCss ? { '--upet-custom-cursor': cursorCss } : undefined}>
      {entered && profile.card.layout === 'slideshow' ? <ProfileScene p={profile} fitDesktop className="h-full w-full" /> : <ProfileScene p={sceneProfile} scrollable={entered} fitDesktop={entered} className="h-full w-full">
        {!entered ? (
          <EntryGate key={normalized} entry={profile.entry} accent={profile.card.accent} cardFont={profile.card.font} customFontUrl={profile.card.customFontUrl} onEnter={() => setEntered(true)} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }} className="w-full" style={{ perspective: 1000 }}>
            <div style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform .15s ease-out' }}>
              <ProfileCard p={profile} />
            </div>
          </motion.div>
        )}
      </ProfileScene>}
      <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success('Profile link copied');
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#08080c]/75 text-white/80 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
          title="Share profile link"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#08080c]/75 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md">
          <Hash className="h-3 w-3 text-white/55" />
          <span>UID 1</span>
          <span className="text-white/25">·</span>
          <Eye className="h-3.5 w-3.5 text-white/60" />
          <span>{(views ?? db.users[normalized]?.profile.views ?? 0).toLocaleString()}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/60">@{profile.username}</span>
        </div>
      </div>
      <Link to="/" className="absolute bottom-[max(.75rem,env(safe-area-inset-bottom))] right-4 z-20 rounded-full border border-white/10 bg-[#08080c]/75 px-2.5 py-1 text-white/75 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"><Logo className="scale-75" /></Link>
    </div>
  );
}
