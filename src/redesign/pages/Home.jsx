import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Captions,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  Hash,
  Heart,
  Link2,
  Loader2,
  MousePointerClick,
  Music2,
  Palette,
  ShieldCheck,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { normalizeUsername } from '../../shared/username';
import { Avatar, BadgeIcon, BackgroundFx, FxText, isVideoMedia } from '../components/ProfileBits';
import { setGlobalSiteCursor } from '../components/SiteCursor';
import {
  CURSOR_PRESETS,
  FONT_OPTIONS,
  buildCursorCssValue,
  fontStyle,
  getCursorPreviewDataUrl,
} from '../lib/catalog';
import styles from './Home.module.css';

const previewImage = (media, width) =>
  media?.src && !isVideoMedia(media)
    ? `/api/media-preview?url=${encodeURIComponent(media.src)}&w=${width}`
    : '';

const handleTiltMove = (event) => {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const px = (x / rect.width) * 100;
  const py = (y / rect.height) * 100;
  const ry = ((x / rect.width) - 0.5) * 6;
  const rx = (0.5 - (y / rect.height)) * 6;
  el.style.setProperty('--mx', `${px.toFixed(1)}%`);
  el.style.setProperty('--my', `${py.toFixed(1)}%`);
  el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
  el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
};

const handleTiltLeave = (event) => {
  const el = event.currentTarget;
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
};

const revealProps = (reducedMotion, delay = 0) => ({
  initial: reducedMotion ? false : { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const TopProfile = ({ entry, slot }) => {
  const accent = entry.card?.accent || '#f472b6';
  const image =
    (entry.card?.layout === 'banner' ? previewImage(entry.banner, 520) : '') ||
    previewImage(entry.background, 520);
  const uidNum = entry.username === 'dome' || entry.username === 'lamp' ? 1 : slot + 1;
  return (
      <Link
      to={`/${entry.username}`}
      data-testid={`top-profile-${slot}`}
      aria-label={`View ${entry.displayName}'s profile`}
      className={styles.profileCard}
      onMouseMove={handleTiltMove}
      onMouseLeave={handleTiltLeave}
      style={{ '--profile-accent': accent, '--profile-bg': entry.card?.bgColor || '#0f0b1d' }}
    >
      <div className={styles.profileImage} aria-hidden="true">
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        )}
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileTopline}>
          <span>
            <Crown size={12} /> UID #{uidNum}
          </span>
          <ArrowUpRight size={15} className={styles.profileArrow} />
        </div>
        <div className={styles.profileAvatar}>
          <Avatar media={entry.avatar} name={entry.username} size={72} />
        </div>
        <h3>{entry.displayName}</h3>
        <p className={styles.profileHandle}>
          @{entry.username}
          {entry.alias && entry.alias !== entry.username ? ` · ${entry.alias}` : ''}
        </p>
        <div className={styles.profileBadges}>
          {(entry.badges || []).slice(0, 4).map((badge) => (
            <BadgeIcon key={badge} id={badge} size={11} />
          ))}
        </div>
        <p className={styles.profileBio}>
          {entry.bio || 'Interactive Bento profile crafted on user.pet.'}
        </p>
        <div className={styles.profileBottom}>
          <span>
            <Eye size={13} />
            {(entry.views || 0).toLocaleString()} views
          </span>
          <span>
            <Link2 size={13} />
            {entry.linkCount || 0} links
          </span>
        </div>
      </div>
    </Link>
  );
};

const SHADER_PRESETS = [
  ['aurora', 'Aurora'],
  ['iridescence', 'Iridescence'],
  ['silk', 'Silk'],
  ['hyperspeed', 'Hyperspeed'],
  ['waves', 'Waves'],
  ['dotgrid', 'Dot Grid'],
];

const HERO_CURSORS = [
  ['neon-arrow', 'Neon Arrow'],
  ['cyber-ring', 'Cyber Ring'],
  ['cat', 'Neko Paw'],
  ['star', 'Sparkle Star'],
];

const BENEFIT_HOOKS = [
  {
    id: 'look',
    kicker: '01 · LOOK',
    title: 'Make it yours',
    desc: 'Find the colors, type, and details that feel right.',
    detail: 'Try a moving background, choose a font, and add a custom cursor—or bring in a font of your own.',
    icon: Palette,
  },
  {
    id: 'sound',
    kicker: '02 · SOUND',
    title: 'Bring the soundtrack',
    desc: 'Add a song and let the lyrics follow along.',
    detail: 'Share a track you love, with synced lyrics right on your page.',
    icon: Music2,
  },
  {
    id: 'presence',
    kicker: '03 · PRESENCE',
    title: 'Stay connected',
    desc: 'Let people find you where you already hang out.',
    detail: 'Show your Discord profile and connect a verified name.user.pet subdomain.',
    icon: ShieldCheck,
  },
];

const FOUNDER_TEAM_SHOWCASE = [
  {
    username: 'lamp',
    displayName: 'Lamp',
    roleTag: 'FOUNDER · THE STARTER',
    subdomain: 'lamp.user.pet',
    bio: 'The one who got it all started. Lamp is a general founder and a little bit of everything around here.',
    badges: ['founder', 'verified', 'staff', 'og'],
    accent: '#c084fc',
  },
  {
    username: 'dome',
    displayName: 'Dome',
    roleTag: 'MAIN FOUNDER · SOCIAL MEDIA',
    subdomain: 'dome.user.pet',
    bio: 'Main founder and social media manager, keeping the community connected and sharing what’s new.',
    badges: ['founder', 'verified', 'staff', 'og'],
    accent: '#f472b6',
  },
  {
    username: 'bee',
    displayName: 'Bee',
    roleTag: 'DEVELOPER · OWNER · FOUNDER',
    subdomain: 'bee.user.pet',
    bio: 'Developer, owner, and founder of user.pet—building the site and shaping what comes next.',
    badges: ['founder', 'verified', 'staff', 'og'],
    accent: '#6cc4ff',
  },
];

export const HeroPreview = ({
  user,
  previewHandle = 'dome',
  activeShader = 'aurora',
  setActiveShader,
  activeFont = 'geist',
  setActiveFont,
  activeCursor = 'neon-arrow',
  onSelectCursor,
}) => {
  const [previewTab, setPreviewTab] = useState('profile');
  const profile = user?.profile;
  const links = profile?.links?.slice(0, 3) || [
    { id: '1', label: 'Discord Community', span: 'half' },
    { id: '2', label: 'Playlist & Tracks', span: 'half' },
    { id: '3', label: `Support @${previewHandle}`, span: 'full' },
  ];
  const accent = profile?.card?.accent || '#f472b6';
  const cursorCss = buildCursorCssValue(activeCursor, accent);

  return (
    <div
      className={styles.heroVisual}
      aria-label={profile ? `Preview of ${user.username}'s profile` : 'Live phone-frame profile preview'}
      data-testid="hero-profile-preview"
      style={{ '--preview-accent': accent, ...(cursorCss ? { cursor: cursorCss } : {}) }}
    >
      <div className={styles.phoneFrame}>
        {/* Phone Status & Notch Bar */}
        <div className={styles.phoneTopBar}>
          <span className={styles.phoneNotch} aria-hidden="true" />
          <div className={styles.phoneBarRow}>
            <span className={styles.previewAddress}>user.pet/{previewHandle}</span>
            <div className={styles.previewModeSwitch} role="group" aria-label="Preview mode">
              <button
                type="button"
                onClick={() => setPreviewTab('profile')}
                className={`${styles.previewModeBtn} ${previewTab === 'profile' ? styles.previewModeBtnActive : ''}`}
              >
                Bento Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('entry')}
                className={`${styles.previewModeBtn} ${previewTab === 'entry' ? styles.previewModeBtnActive : ''}`}
              >
                Start Gate
              </button>
            </div>
          </div>
        </div>

        {/* Single consolidated ReactBits WebGL-depth background (no overlapping canvases) */}
        <div className={styles.previewScene} style={{ fontFamily: fontStyle(activeFont) }}>
          <BackgroundFx
            kind={profile?.effects?.background && profile.effects.background !== 'none' ? profile.effects.background : activeShader}
            amount={72}
            color={accent}
            preview
          />

          {previewTab === 'entry' ? (
            <div
              className={styles.previewEntryGate}
              onClick={() => setPreviewTab('profile')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setPreviewTab('profile');
              }}
            >
              <div className={styles.previewEntryPill}>
                <Volume2 size={12} />
                <span>Interactive Start Gate</span>
              </div>
              <div className={styles.previewEntryTitle}>
                <FxText
                  fx={profile?.entry?.textEffect && profile.entry.textEffect !== 'none' ? profile.entry.textEffect : 'neon'}
                  text={profile?.entry?.title || 'click to enter'}
                  style={{ color: '#ffffff', '--fx-color': accent }}
                />
              </div>
              <p className={styles.previewEntrySub}>
                {profile?.entry?.subtitle || 'Tap anywhere to unlock synced lyrics, shaders & custom cursors'}
              </p>
              <span className={styles.previewEntryAction}>
                <Sparkles size={12} /> Enter profile
              </span>
            </div>
          ) : (
            <div className={styles.userPreviewCard}>
              {/* Bento Tile 1: Identity Header */}
              <div className={styles.bentoIdentityTile}>
                <div className={styles.bentoIdentityRow}>
                  <div className={styles.previewAvatarWrap}>
                    {profile?.media?.avatar?.src ? (
                      <Avatar
                        media={profile.media.avatar}
                        name={user.username}
                        size={52}
                        decoration={profile.effects?.decoration}
                        hue={profile.effects?.decoHue}
                      />
                    ) : (
                      <div className={styles.previewAvatar}>
                        {String(previewHandle || 'U').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.bentoIdentityText}>
                    <div className={styles.previewName}>
                      {profile?.displayName || previewHandle} <span className={styles.pinkSpark}>✦</span>
                    </div>
                    <div className={styles.userPreviewHandle}>
                      @{previewHandle} · <span className={styles.verifiedSubdomain}>{previewHandle}.user.pet</span>
                    </div>
                  </div>
                  <div className={styles.previewBadgeDock}>
                    {(profile?.shownBadges?.length ? profile.shownBadges : ['founder', 'verified', 'donor'])
                      .slice(0, 3)
                      .map((b) => (
                        <BadgeIcon key={b} id={b} size={11} />
                      ))}
                  </div>
                </div>
                <p className={styles.previewQuote}>
                  “{profile?.bio || 'Your links, your music, and the little things you want to share.'}”
                </p>
              </div>

              {/* Bento Tile 2: Auto / Half / Full Modular Links Grid */}
              <div className={styles.bentoLinksGrid}>
                {links.map((link, index) => {
                  const isFull = link.span === 'full' || (links.length % 2 === 1 && index === links.length - 1);
                  return (
                    <div
                      className={`${styles.previewLink} ${isFull ? styles.previewLinkFull : styles.previewLinkHalf}`}
                      key={link.id || link.url || index}
                    >
                      <Link2 size={13} />
                      <span>{link.label || link.platform || 'Link'}</span>
                      <ArrowUpRight size={13} />
                    </div>
                  );
                })}
              </div>

              {/* Bento Tile 3: Audio + Native Synced Lyrics Inside the Grid */}
              <div className={styles.bentoAudioLyricsTile}>
                <div className={styles.previewAudioMini}>
                  <Music2 size={13} />
                  <span>{profile?.audio?.title || 'Midnight Velvet — Synth Mix'}</span>
                  <span className={styles.previewEq}>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
                <div className={styles.bentoNativeLyrics}>
                  <div className={styles.bentoLyricsHeader}>
                    <Captions size={11} />
                    <span>SYNCED LYRICS · BENTO GRID</span>
                  </div>
                  <p className={styles.bentoLyricActive}>“Drifting through rose and violet light”</p>
                  <p className={styles.bentoLyricNext}>00:18 · Lyrics that keep time with your song</p>
                </div>
              </div>

              <div className={styles.previewFooterBar}>
                <span>
                  <Hash size={11} /> Bento Grid
                </span>
                <span>
                  <Eye size={11} /> {(profile?.views || 4280).toLocaleString()} views
                </span>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE CHIPS GROUPED DIRECTLY UNDER THE PHONE PREVIEW */}
        <div className={styles.previewToolbar} data-testid="hero-interactive-chips">
          <div className={styles.previewToolbarGroup}>
            <span className={styles.previewToolbarLabel}>Shader</span>
            <div className={styles.previewChipRow}>
              {SHADER_PRESETS.slice(0, 4).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  data-testid={`hero-chip-shader-${id}`}
                  onClick={() => setActiveShader?.(id)}
                  className={`${styles.previewChip} ${activeShader === id ? styles.previewChipActive : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.previewToolbarGroup}>
            <span className={styles.previewToolbarLabel}>Font</span>
            <div className={styles.previewChipRow}>
              {['geist', 'editorial', 'syne', 'pixel'].map((id) => {
                const label = FONT_OPTIONS.find(([fid]) => fid === id)?.[1]?.split(' ')[0] || id;
                return (
                  <button
                    key={id}
                    type="button"
                    data-testid={`hero-chip-font-${id}`}
                    onClick={() => setActiveFont?.(id)}
                    className={`${styles.previewChip} ${activeFont === id ? styles.previewChipActive : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.previewToolbarGroup}>
            <span className={styles.previewToolbarLabel}>Cursor</span>
            <div className={styles.previewChipRow}>
              {HERO_CURSORS.map(([cid, label]) => {
                const icon = getCursorPreviewDataUrl(cid, '#f472b6');
                return (
                  <button
                    key={cid}
                    type="button"
                    data-testid={`hero-chip-cursor-${cid}`}
                    onClick={() => onSelectCursor?.(cid)}
                    className={`${styles.previewChip} ${activeCursor === cid ? styles.previewChipActive : ''}`}
                  >
                    {icon && <img src={icon} alt="" className="h-3.5 w-3.5" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { user, isTaken } = useStore();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [topProfiles, setTopProfiles] = useState([]);
  const [copied, setCopied] = useState(false);
  const [claimInput, setClaimInput] = useState('');
  const [claimStatus, setClaimStatus] = useState({ state: 'idle', message: '' });
  const [activeShader, setActiveShader] = useState('aurora');
  const [activeFont, setActiveFont] = useState('geist');
  const [activeCursor, setActiveCursor] = useState(
    () => (typeof window !== 'undefined' && localStorage.getItem('upet_site_cursor')) || 'neon-arrow'
  );
  const [donateDemoAmount, setDonateDemoAmount] = useState(15);

  // Live availability checking for the above-the-fold Claim box
  useEffect(() => {
    const raw = claimInput.trim().toLowerCase();
    if (!raw) {
      setClaimStatus({ state: 'idle', message: 'Pick a handle to see if it’s available.' });
      return undefined;
    }
    let normalized = '';
    try {
      normalized = normalizeUsername(raw);
    } catch {
      setClaimStatus({
        state: 'invalid',
        message: 'Use 3–20 letters, numbers, dots, underscores, or hyphens.',
      });
      return undefined;
    }

    setClaimStatus({ state: 'checking', message: `Checking user.pet/${normalized}…` });
    let alive = true;
    const timer = window.setTimeout(async () => {
      try {
        const taken = await isTaken(normalized);
        if (!alive) return;
        if (taken) {
          setClaimStatus({ state: 'taken', message: `user.pet/${normalized} is taken. Try another?` });
        } else {
          setClaimStatus({ state: 'available', message: `Good news—user.pet/${normalized} is available!` });
        }
      } catch {
        if (alive) {
          setClaimStatus({ state: 'error', message: 'We couldn’t check right now. Give it another try.' });
        }
      }
    }, 240);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [claimInput, isTaken]);

  useEffect(() => {
    let active = true;
    fetch('/api/top-profiles')
      .then((res) => (res.ok ? res.json() : { profiles: [] }))
      .then((data) => {
        if (!active) return;
        const real = Array.isArray(data?.profiles)
          ? data.profiles.filter((p) => p && p.username)
          : [];
        setTopProfiles(real.slice(0, 6));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const copyPage = async () => {
    if (!user?.username) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${user.username}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleClaimSubmit = (event) => {
    event.preventDefault();
    const cleaned = claimInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (user) {
      navigate('/dashboard/links');
      return;
    }
    navigate(cleaned.length >= 3 ? `/login?claim=${encodeURIComponent(cleaned)}` : '/login');
  };

  const applySiteAndDemoCursor = (cursorId) => {
    setActiveCursor(cursorId);
    setGlobalSiteCursor(cursorId, '#f472b6');
  };

  const cleanedInput = claimInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const previewHandle = cleanedInput.length >= 3 ? cleanedInput : user?.username || 'velvet';
  const showCommunitySection = topProfiles.length >= 3;

  return (
    <div className={styles.home}>
      {/* SECTION 1: ALIGNED 2-COLUMN HERO (HEADLINE + ABOVE-THE-FOLD CLAIM + STICKY PHONE PREVIEW) */}
      <motion.section
        className={styles.heroStage}
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.heroCenterpiece}>
          {/* Left Column: Hero Card strictly aligned to top & bottom Y-axis of Phone Preview */}
          <div className={styles.heroCopyCard}>
            <div className={styles.heroCopyTop}>
              <div className={styles.heroBadgePill}>
                <span className={styles.liveDot} />
                <span>YOUR PAGE · YOUR MUSIC · YOUR PEOPLE</span>
              </div>

              <h1 data-testid="hero-title" className={styles.heroHeadline}>
                Your little corner of the internet,
                <br />
                <span className={styles.gradientHeadlineText}>made to feel like you.</span>
              </h1>

              <p className={styles.heroDescription}>
                Put your favorite things in one place: your links, your music, your style, and the details you want people to remember.
              </p>

              {/* THE "CLAIM" BOX — ABOVE THE FOLD, DIRECTLY UNDER THE HEADLINE */}
              <div className={styles.claimBoxWrap} data-testid="hero-claim-box">
                <form onSubmit={handleClaimSubmit} className={styles.claimBar}>
                  <span className={styles.claimPrefix}>user.pet/</span>
                  <input
                    type="text"
                    data-testid="hero-claim-input"
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    placeholder={user?.username || 'yourname'}
                    maxLength={20}
                    aria-label="Claim your user.pet handle"
                    className={styles.claimInput}
                  />
                  {claimStatus.state === 'available' && (
                    <span
                      data-testid="claim-available-badge"
                      className={styles.claimStatusIconAvailable}
                      title={claimStatus.message}
                    >
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                  {claimStatus.state === 'checking' && (
                    <span className={styles.claimStatusIconChecking}>
                      <Loader2 size={15} className="animate-spin" />
                    </span>
                  )}
                  {claimStatus.state === 'taken' && (
                    <span className={styles.claimStatusIconTaken} title={claimStatus.message}>
                      <XCircle size={16} />
                    </span>
                  )}
                  <button
                    type="submit"
                    data-testid="hero-claim-submit"
                    disabled={claimStatus.state === 'taken'}
                    className={styles.claimSubmit}
                  >
                    <span>Claim</span>
                    <span className={styles.claimSubmitCircle}>
                      <ArrowRight size={13} />
                    </span>
                  </button>
                </form>

                <div
                  className={`${styles.claimAvailabilityRow} ${
                    claimStatus.state === 'available'
                      ? styles.claimAvailabilitySuccess
                      : claimStatus.state === 'taken' || claimStatus.state === 'invalid' || claimStatus.state === 'error'
                      ? styles.claimAvailabilityWarn
                      : ''
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {claimStatus.state === 'available' && <Check size={13} />}
                  <span>{claimStatus.message}</span>
                </div>
              </div>
            </div>

            {/* Bottom of Left Hero Card: Quick Hooks & Secondary CTA */}
            <div className={styles.heroCopyBottom}>
              <div className={styles.heroMiniHooks}>
                <div className={styles.heroMiniHookItem}>
                  <strong>Style</strong>
                  <span>Colors, fonts &amp; effects</span>
                </div>
                <div className={styles.heroMiniHookItem}>
                  <strong>Music</strong>
                  <span>Share a song you love</span>
                </div>
                <div className={styles.heroMiniHookItem}>
                  <strong>Your people</strong>
                  <span>Connect your Discord</span>
                </div>
              </div>

              <div className={styles.heroActions}>
                {user ? (
                  <>
                    <Link to="/dashboard/links" data-testid="hero-cta" className={styles.primaryGradientBtn}>
                      <span>Open dashboard</span>
                      <span className={styles.primaryBtnCircle}>
                        <ArrowRight size={13} />
                      </span>
                    </Link>
                    <Link to={`/${user.username}`} data-testid="hero-explore" className={styles.darkPillBtn}>
                      <span>View your page</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/explore" data-testid="hero-cta" className={styles.darkPillBtn}>
                      <span>Explore profiles</span>
                      <ArrowRight size={14} />
                    </Link>
                    <a
                      href="https://discord.gg/upet"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.darkPillBtn}
                    >
                      <span>Join Discord</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Interactive Phone-Frame Preview + Chips */}
          <HeroPreview
            user={user}
            previewHandle={previewHandle}
            activeShader={activeShader}
            setActiveShader={setActiveShader}
            activeFont={activeFont}
            setActiveFont={setActiveFont}
            activeCursor={activeCursor}
            onSelectCursor={applySiteAndDemoCursor}
          />
        </div>
      </motion.section>

      {/* SECTION 2: SIMPLIFIED BENEFITS — THREE CLEAN HOOKS (LOOK, SOUND, PRESENCE) */}
      <motion.section className={styles.benefitsSection} aria-labelledby="features-title" {...revealProps(reducedMotion)}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>Your page, your way</p>
            <h2 id="features-title" className={styles.sectionTitle}>
              A page that feels like yours.
            </h2>
            <p className={styles.sectionLead}>
              Pick the pieces you like and make a space that feels right to you.
            </p>
          </div>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFIT_HOOKS.map((hook, idx) => {
            const Icon = hook.icon;
            return (
              <motion.div key={hook.id} {...revealProps(reducedMotion, idx * 0.08)}>
                <article
                  data-testid={`feature-${idx}`}
                  className={styles.benefitCard}
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                >
                  <div className={styles.benefitCardTop}>
                    <span className={styles.benefitKicker}>{hook.kicker}</span>
                    <span className={styles.benefitIconBox}>
                      <Icon size={18} />
                    </span>
                  </div>
                  <h3 className={styles.benefitTitle}>{hook.title}</h3>
                  <p className={styles.benefitHookLine}>{hook.desc}</p>
                  <p className={styles.benefitDetail}>{hook.detail}</p>
                </article>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* SECTION 3: "GET PAID" — MOCK user.pet/name/donate SHOWCASE */}
      <motion.section
        className={styles.getPaidSection}
        aria-labelledby={showCommunitySection ? 'get-paid-title' : 'discovery-title'}
        data-testid="get-paid-section"
        {...revealProps(reducedMotion)}
      >
        <div className={styles.getPaidGrid}>
          <div className={styles.getPaidCopy}>
            <p className={styles.sectionKicker}>A little support goes a long way</p>
            <h2
              id={showCommunitySection ? 'get-paid-title' : 'discovery-title'}
              className={styles.sectionTitle}
            >
              Let people support you at
              <br />
              <span className={styles.gradientHeadlineText}>user.pet/{previewHandle}/donate</span>
            </h2>
            <p className={styles.sectionLead}>
              Give your supporters a simple way to say thanks, right from your profile. No extra storefront to set up—just your own tipping link.
            </p>

            <div className={styles.getPaidPills}>
              <span>
                <Check size={14} /> Your own <code>/{previewHandle}/donate</code> page
              </span>
              <span>
                <Check size={14} /> A few ways for people to chip in
              </span>
              <span>
                <Check size={14} /> A Donor Heart badge for supporters
              </span>
            </div>

            <div className={styles.getPaidActions}>
              <Link to="/donate" className={styles.primaryGradientBtn}>
                <span>Preview Donate Page</span>
                <span className={styles.primaryBtnCircle}>
                  <ArrowRight size={13} />
                </span>
              </Link>
            </div>
          </div>

          {/* Mock user.pet/name/donate Card */}
          <div className={styles.donateMockCard} data-testid="mock-donate-card">
            <div className={styles.donateMockTopbar}>
              <span className={styles.previewDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className={styles.donateMockUrl}>user.pet/{previewHandle}/donate</span>
              <span className={styles.donateLowFeeBadge}>0% Monthly Fee</span>
            </div>

            <div className={styles.donateMockBody}>
              <div className={styles.donateMockHeader}>
                <div className={styles.donateMockAvatar}>
                  {String(previewHandle || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className={styles.donateMockTitle}>Support @{previewHandle}</div>
                  <div className={styles.donateMockSub}>Direct creator tip · unlocks Donor badge</div>
                </div>
              </div>

              <div className={styles.donateTierRow} role="group" aria-label="Sample tip amounts">
                {[5, 15, 35].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonateDemoAmount(amt)}
                    className={`${styles.donateTierPill} ${
                      donateDemoAmount === amt ? styles.donateTierPillActive : ''
                    }`}
                  >
                    <span>${amt}</span>
                    <small>{amt === 5 ? 'Coffee' : amt === 15 ? 'Supporter' : 'Patron'}</small>
                  </button>
                ))}
              </div>

              <div className={styles.donateMockNote}>
                “Keep creating! Here’s ${donateDemoAmount} for your next project.”
              </div>

              <Link to="/donate" className={styles.donateMockSubmit}>
                <Heart size={15} className="fill-current" />
                <span>Send ${donateDemoAmount} to @{previewHandle}</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3.5: FOUNDERS & CORE TEAM SHOWCASE */}
      <motion.section
        className={styles.founderSection}
        aria-labelledby="founders-title"
        data-testid="founder-showcase-section"
        {...revealProps(reducedMotion)}
      >
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>The people behind user.pet</p>
            <h2 id="founders-title" className={styles.sectionTitle}>
              Meet the{' '}
              <span className={styles.gradientHeadlineText}>founders.</span>
            </h2>
            <p className={styles.sectionLead}>
              Three people with different roles, all helping make user.pet what it is.
            </p>
          </div>
          <Link to="/donate" className={styles.darkPillBtn}>
            <Crown size={14} className="text-amber-400" />
            <span>Support the team</span>
          </Link>
        </div>

        <div className={styles.founderGrid}>
          {FOUNDER_TEAM_SHOWCASE.map((member, idx) => (
            <motion.div key={member.username} {...revealProps(reducedMotion, idx * 0.08)}>
              <Link
              to={`/${member.username}`}
              data-testid={`founder-card-${member.username}`}
              className={styles.founderCard}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
              style={{ '--founder-accent': member.accent }}
            >
              <div className={styles.founderCardTop}>
                <span className={styles.founderRolePill}>
                  <Crown size={12} />
                  <span>{member.roleTag}</span>
                </span>
                <span className={styles.founderUidTag}>TEAM</span>
              </div>

              <div className={styles.founderIdentityRow}>
                <div className={styles.founderAvatarOrb}>
                  {member.displayName.slice(0, 1)}
                </div>
                <div className={styles.founderIdentityMeta}>
                  <div className={styles.founderNameRow}>
                    <h3>{member.displayName}</h3>
                    <div className={styles.founderBadges}>
                      {member.badges.map((b) => (
                        <BadgeIcon key={b} id={b} size={12} />
                      ))}
                    </div>
                  </div>
                  <p className={styles.founderHandleLine}>
                    @{member.username} · <span>{member.subdomain}</span>
                  </p>
                </div>
              </div>

              <p className={styles.founderBio}>{member.bio}</p>

              <div className={styles.founderCardFooter}>
                <span className={styles.founderVerifiedChip}>
                  <CheckCircle2 size={12} /> Founder
                </span>
                <span className={styles.founderViewProfile}>
                  Meet {member.displayName} <ArrowUpRight size={13} />
                </span>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 4: COMMUNITY SHOWCASE (HIDDEN UNTIL 3 REAL FEATURED PROFILES EXIST) */}
      {showCommunitySection && (
        <motion.section className={styles.showcase} aria-labelledby="discovery-title" data-testid="community-section" {...revealProps(reducedMotion)}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>Community Directory</p>
              <h2 id="discovery-title" className={styles.sectionTitle}>
                Made by the community.
              </h2>
              <p className={styles.sectionLead}>
                Take a look at the pages people have made, and find a little inspiration for your own.
              </p>
            </div>
            <Link to="/explore" className={styles.darkPillBtn}>
              <span>Browse all profiles</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className={styles.profileGrid}>
            {topProfiles.slice(0, 3).map((entry, index) => (
              <div key={entry.username}>
                <TopProfile entry={entry} slot={index + 1} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* SECTION 5: FINAL CTA */}
      <motion.section className={styles.finalSection} data-testid="the-end-section" {...revealProps(reducedMotion)}>
        <p className={styles.sectionKicker}>Whenever you’re ready</p>
        <h2>{user ? 'Your next edit is waiting.' : 'Make a page that feels like you.'}</h2>
        <p>
          {user
            ? 'Add a link, change the look, or put a new song on your page.'
            : 'Choose a handle, add the things you love, and make the page your own.'}
        </p>
        <div className={styles.finalActions}>
          {user ? (
            <>
              <Link to="/dashboard/links" data-testid="end-cta" className={styles.primaryGradientBtn}>
                <span>Open dashboard</span>
                <span className={styles.primaryBtnCircle}>
                  <ArrowRight size={13} />
                </span>
              </Link>
              <button type="button" onClick={copyPage} className={styles.darkPillBtn}>
                {copied ? (
                  <>
                    <Check size={15} /> Link copied
                  </>
                ) : (
                  <>
                    <Copy size={15} /> Copy your link
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Link to="/explore" data-testid="end-cta" className={styles.primaryGradientBtn}>
                <span>Explore pages</span>
                <span className={styles.primaryBtnCircle}>
                  <ArrowRight size={13} />
                </span>
              </Link>
              <Link to="/login" className={styles.darkPillBtn}>
                <span>Sign in / Claim handle</span>
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
}
