import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Crown,
  Eye,
  Hash,
  Link2,
  MousePointerClick,
  Music2,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Type,
  Volume2,
  Wand2,
} from 'lucide-react';
import { useStore } from '../lib/store';
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
  const ry = ((x / rect.width) - 0.5) * 8;
  const rx = (0.5 - (y / rect.height)) * 8;
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

const TopProfile = ({ entry, slot }) => {
  const accent = entry.card?.accent || '#6cc4ff';
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
      style={{ '--profile-accent': accent, '--profile-bg': entry.card?.bgColor || '#070c16' }}
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
          {entry.bio || 'Interactive 60fps profile crafted on user.pet.'}
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

const ProfilePlaceholder = () => (
  <div className={styles.profilePlaceholder} aria-hidden="true">
    <span>Featured profile</span>
    <div className={styles.placeholderAvatar} />
    <div className={styles.placeholderLine} />
    <div className={styles.placeholderLineShort} />
    <div className={styles.placeholderButton} />
  </div>
);

const rotationDelay = () => 180000 + Math.floor(Math.random() * 120001);
const pickProfiles = (profiles) => {
  const pool = [...profiles];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[next]] = [pool[next], pool[index]];
  }
  return pool.slice(0, 3);
};

const SHADER_PRESETS = [
  ['aurora', 'Aurora WebGL'],
  ['hyperspeed', 'Hyperspeed'],
  ['iridescence', 'Iridescence'],
  ['silk', 'Silk Shader'],
  ['dotgrid', 'Dot Grid'],
  ['matrix', 'Matrix Rain'],
];

export const HeroPreview = ({ user }) => {
  const [previewTab, setPreviewTab] = useState('profile');
  const [activeShader, setActiveShader] = useState('aurora');
  const [activeFont, setActiveFont] = useState('geist');

  const profile = user?.profile;
  const banner =
    (profile?.card?.layout === 'banner' ? previewImage(profile?.media?.banner, 640) : '') ||
    previewImage(profile?.media?.background, 640);
  const links = profile?.links?.slice(0, 3) || [];
  const accent = profile?.card?.accent || '#6cc4ff';

  return (
    <div
      className={styles.heroVisual}
      aria-label={profile ? `Preview of ${user.username}'s profile` : 'Illustrative user.pet profile preview'}
      data-testid="hero-profile-preview"
      onMouseMove={handleTiltMove}
      onMouseLeave={handleTiltLeave}
      style={{ '--preview-accent': accent }}
    >
      <div className={styles.previewWindow}>
        <div className={styles.previewBar}>
          <span className={styles.previewDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.previewAddress}>user.pet/{profile ? user.username : 'dome'}</span>
          <div className={styles.previewModeSwitch} role="group" aria-label="Preview mode">
            <button
              type="button"
              onClick={() => setPreviewTab('profile')}
              className={`${styles.previewModeBtn} ${previewTab === 'profile' ? styles.previewModeBtnActive : ''}`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('entry')}
              className={`${styles.previewModeBtn} ${previewTab === 'entry' ? styles.previewModeBtnActive : ''}`}
            >
              Start Screen
            </button>
          </div>
        </div>

        <div className={styles.previewScene} style={{ fontFamily: fontStyle(activeFont) }}>
          <BackgroundFx
            kind={profile?.effects?.background && profile.effects.background !== 'none' ? profile.effects.background : activeShader}
            amount={68}
            color={accent}
            preview
          />
          <BackgroundFx kind="stars" amount={45} color="#7dd3fc" preview />

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
                <span>Interactive Start Gate · 60fps ReactBits</span>
              </div>
              <div className={styles.previewEntryTitle}>
                <FxText
                  fx={profile?.entry?.textEffect && profile.entry.textEffect !== 'none' ? profile.entry.textEffect : 'neon'}
                  text={profile?.entry?.title || 'click to enter'}
                  style={{ color: '#ffffff', '--fx-color': accent }}
                />
              </div>
              <p className={styles.previewEntrySub}>
                {profile?.entry?.subtitle || 'Tap anywhere to unlock synced LRC audio, shaders & custom cursors'}
              </p>
              <span className={styles.previewEntryAction}>
                <Sparkles size={12} /> Enter page
              </span>
            </div>
          ) : (
            <div className={styles.userPreviewCard}>
              <div className={styles.previewTopVolume}>
                <Volume2 size={12} />
                <span className={styles.previewVolumeTrack}>
                  <i />
                </span>
              </div>

              <div className={styles.previewBanner}>
                {banner && (
                  <img
                    src={banner}
                    alt=""
                    decoding="async"
                    fetchPriority="low"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}
                <div className={styles.previewBadgeDock}>
                  {(profile?.shownBadges?.length ? profile.shownBadges : ['founder', 'verified', 'staff', 'og'])
                    .slice(0, 4)
                    .map((b) => (
                      <BadgeIcon key={b} id={b} size={11} />
                    ))}
                </div>
              </div>

              <div className={styles.previewBody}>
                <div className={styles.previewAvatarWrap}>
                  {profile?.media?.avatar?.src ? (
                    <Avatar
                      media={profile.media.avatar}
                      name={user.username}
                      size={68}
                      decoration={profile.effects?.decoration}
                      hue={profile.effects?.decoHue}
                    />
                  ) : (
                    <div className={styles.previewAvatar}>D</div>
                  )}
                </div>

                <div className={styles.previewName}>
                  {profile?.displayName || 'dome'} <span className={styles.aquaSpark}>✦</span>
                </div>
                <div className={styles.userPreviewHandle}>@{user?.username || 'dome'} · UID #1</div>

                <div className={styles.previewMetaList}>
                  <div>
                    <span>Joined</span>
                    <strong>Day One</strong>
                  </div>
                  <div>
                    <span>Shader</span>
                    <strong>{SHADER_PRESETS.find(([id]) => id === activeShader)?.[1] || 'Aurora'}</strong>
                  </div>
                </div>

                <div className={styles.previewQuote}>
                  “{profile?.bio || 'Aqua 60fps shaders, custom fonts, synced LRC lyrics & custom cursors.'}”
                </div>

                <div className={styles.previewAudioMini}>
                  <Music2 size={13} />
                  <span>{profile?.audio?.title || 'After Dark — Aqua Synth Mix'}</span>
                  <span className={styles.previewEq}>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>

                <div className={styles.userPreviewRows}>
                  {(links.length
                    ? links
                    : [
                        { id: '1', label: 'Discord Community & Live Presence' },
                        { id: '2', label: 'Spotify & Time-Synced LRC Lyrics' },
                      ]
                  ).map((link) => (
                    <div className={styles.previewLink} key={link.id || link.url}>
                      <Link2 size={13} />
                      <span>{link.label || link.platform || 'Link'}</span>
                      <ArrowUpRight size={13} />
                    </div>
                  ))}
                </div>

                <div className={styles.previewFooterBar}>
                  <span>
                    <Hash size={10} /> UID 1
                  </span>
                  <span>
                    <Eye size={10} /> {(profile?.views || 14820).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.previewToolbar}>
          <div className={styles.previewToolbarGroup}>
            <span className={styles.previewToolbarLabel}>Shader</span>
            {SHADER_PRESETS.slice(0, 4).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveShader(id)}
                className={`${styles.previewChip} ${activeShader === id ? styles.previewChipActive : ''}`}
              >
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className={styles.previewToolbarGroup}>
            <span className={styles.previewToolbarLabel}>Font</span>
            {['geist', 'editorial', 'syne', 'pixel'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveFont(id)}
                className={`${styles.previewChip} ${activeFont === id ? styles.previewChipActive : ''}`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CONTROL_TABS = [
  {
    id: 'fonts',
    num: '01',
    title: 'Fonts & Typography',
    sub: '16 curated creator & gamer fonts + custom .woff2/.ttf upload',
    icon: Type,
  },
  {
    id: 'shaders',
    num: '02',
    title: 'Start Gate & Shaders',
    sub: 'Interactive Click-to-Enter screen + 60fps ReactBits WebGL shaders',
    icon: Wand2,
  },
  {
    id: 'cursors',
    num: '03',
    title: 'Site & Profile Cursors',
    sub: '12 SVG pointers + 6 particle hover trails across the site & your page',
    icon: MousePointerClick,
  },
  {
    id: 'audio',
    num: '04',
    title: 'Synced Lyrics & Discord',
    sub: 'Time-synced LRC karaoke lyrics + /.well-known/discord verification',
    icon: Music2,
  },
];

const FEATURE_WALL = [
  '1-Char Usernames',
  'Sequential UIDs',
  '16 Built-in Fonts',
  'Custom Font Upload (.woff2/.ttf)',
  '22 Animated Text Effects',
  'Interactive Start Screen',
  'Password-Protected Gate',
  '60fps ReactBits Shaders',
  'Aurora & Hyperspeed WebGL',
  'Iridescence & Silk Shaders',
  '12 Custom SVG Cursors',
  '6 Cursor Particle Trails',
  'Time-Synced LRC Lyrics',
  'Side-Stage Karaoke Lyrics',
  'Vinyl & Glass Audio Players',
  'Discord Presence Card',
  'Subdomain Discord Verify',
  'Avatar Frame Decorations',
  'Holographic Profile Tilt',
  'Real-Time View Analytics',
];

const RARITY_TIERS = [
  { len: '1 character', sample: 'k', badge: 'MYTHIC TIER', sub: 'Only 36 handles possible worldwide' },
  { len: '2 characters', sample: 'xo', badge: 'LEGENDARY TIER', sub: '1,327 ultra-short combinations' },
  { len: '3 characters', sample: 'sky', badge: 'EARLY ADOPTER', sub: '50,497 clean 3-letter handles' },
];

export default function Home() {
  const { user, db } = useStore();
  const navigate = useNavigate();
  const [topProfiles, setTopProfiles] = useState(null);
  const [copied, setCopied] = useState(false);
  const [claimInput, setClaimInput] = useState('');
  const [controlTab, setControlTab] = useState('fonts');
  const [demoFont, setDemoFont] = useState('editorial');
  const [demoShader, setDemoShader] = useState('aurora');
  const [demoCursor, setDemoCursor] = useState(
    () => (typeof window !== 'undefined' && localStorage.getItem('upet_site_cursor')) || 'neon-arrow'
  );
  const [demoEntryFx, setDemoEntryFx] = useState('neon');

  const fallbackPool = Object.values(db?.users || {})
    .filter((u) => !u.banned && u.profile)
    .map((u) => ({
      username: u.username,
      displayName: u.profile.displayName || u.username,
      alias: u.profile.alias || '',
      bio: u.profile.bio || '',
      views: u.profile.views || 0,
      linkCount: (u.profile.links || []).length,
      badges: u.profile.shownBadges || u.profile.badges || [],
      avatar: u.profile.media?.avatar || { src: '' },
      banner: u.profile.media?.banner || { src: '' },
      background: u.profile.media?.background || { src: '' },
      card: u.profile.card || { accent: '#6cc4ff', bgColor: '#07111f', layout: 'minimal' },
    }));

  useEffect(() => {
    let active = true;
    let timer;
    let pool = [];
    const refresh = async () => {
      try {
        const response = await fetch('/api/top-profiles');
        if (!response.ok) throw new Error('Top profiles unavailable');
        const data = await response.json();
        if (Array.isArray(data.profiles)) pool = data.profiles.slice(0, 100);
      } catch {
        /* Keep previous ranking when refresh fails */
      }
      if (!active) return;
      if (pool.length) {
        setTopProfiles((current) => {
          let next = pickProfiles(pool);
          const previous = new Set((current || []).map((profile) => profile.username));
          if (pool.length > 3 && next.every((profile) => previous.has(profile.username))) {
            next = pickProfiles(pool);
          }
          return next;
        });
      }
      timer = window.setTimeout(refresh, rotationDelay());
    };
    refresh();
    return () => {
      active = false;
      clearTimeout(timer);
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
      navigate('/dashboard/editor');
      return;
    }
    navigate(cleaned ? `/login?claim=${encodeURIComponent(cleaned)}` : '/login');
  };

  const applySiteAndDemoCursor = (cursorId) => {
    setDemoCursor(cursorId);
    setGlobalSiteCursor(cursorId, '#6cc4ff');
  };

  const slots = topProfiles && topProfiles.length ? topProfiles : fallbackPool.slice(0, 3);
  while (slots.length < 3) slots.push(null);

  const previewHandle = claimInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || user?.username || 'k';

  return (
    <div className={styles.home}>
      {/* SECTION 1: BIG AQUA USER.PET STAGE HERO */}
      <section className={styles.heroStage}>
        <div className={styles.heroTopRow}>
          <div className={styles.heroBadgePill}>
            <span className={styles.liveDot} />
            <span>USER.PET // AQUA 60FPS ENGINE</span>
          </div>

          <div className={styles.quickCursorBar} aria-label="Try live website cursors">
            <span className={styles.quickCursorLabel}>
              <MousePointerClick size={12} /> Try Website Cursor:
            </span>
            {['neon-arrow', 'cyber-ring', 'cat', 'pixel-sword', 'star'].map((cid) => {
              const label = CURSOR_PRESETS.find(([id]) => id === cid)?.[1] || cid;
              const icon = getCursorPreviewDataUrl(cid, '#6cc4ff');
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => applySiteAndDemoCursor(cid)}
                  className={`${styles.quickCursorChip} ${demoCursor === cid ? styles.quickCursorChipActive : ''}`}
                >
                  {icon && <img src={icon} alt="" className="h-3.5 w-3.5" />}
                  <span>{label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.heroCenterpiece}>
          <div
            className={styles.chromeEmblemColumn}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
          >
            <div className={styles.chromeEmblemWrap} aria-hidden="true">
              <div className={styles.chromeGlow} />
              <div className={styles.chromeMonogram}>
                <div className={styles.bigAquaIcon}>
                  <span>U</span>
                  <PawPrint className={styles.bigAquaPaw} fill="currentColor" />
                </div>
                <span className={styles.chromeWord}>
                  user<span className={styles.chromeWordDot}>.pet</span>
                </span>
                <span className={styles.chromeSub}>SHADERS · START SCREENS · CUSTOM FONTS · CURSORS</span>
              </div>
            </div>
            <div className={styles.chromeFeaturePills}>
              <span>16 Fonts + Custom Upload</span>
              <span>12 Aqua &amp; Custom Cursors</span>
              <span>Interactive Start Gate</span>
              <span>Discord Subdomain Verify</span>
            </div>
          </div>

          <HeroPreview user={user} />
        </div>

        {/* 3-COLUMN BOTTOM HERO BAR */}
        <div className={styles.heroBottomBar}>
          <div className={styles.heroColTitle}>
            <h1 data-testid="hero-title">
              Your digital home,
              <br />
              <span className={styles.aquaHeadlineText}>alive in 60fps.</span>
            </h1>
          </div>

          <div className={styles.heroColDesc}>
            <p className={styles.heroDescription}>
              Build a profile that feels like an interactive world. Claim a rare 1-character handle, pair 60fps ReactBits shaders with time-synced LRC music, and customize every font and cursor.
            </p>
            <div className={styles.heroActions}>
              {user ? (
                <>
                  <Link to="/dashboard" data-testid="hero-cta" className={styles.aquaPillBtn}>
                    <span>Open dashboard</span>
                    <span className={styles.aquaPillCircle}>
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
                  <a
                    href="https://discord.gg/upet"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.darkPillBtn}
                  >
                    <span>Join our Discord</span>
                    <ArrowUpRight size={14} />
                  </a>
                  <Link to="/explore" data-testid="hero-cta" className={styles.darkPillBtn}>
                    <span>Explore community</span>
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className={styles.heroColClaim}>
            <form onSubmit={handleClaimSubmit} className={styles.claimBar}>
              <span className={styles.claimPrefix}>user.pet/</span>
              <input
                type="text"
                value={claimInput}
                onChange={(e) => setClaimInput(e.target.value)}
                placeholder={user?.username || 'yourname'}
                aria-label="Claim your user.pet handle"
                className={styles.claimInput}
              />
              <button type="submit" className={styles.claimSubmit}>
                <span>{user ? 'Customize' : 'Claim page'}</span>
                <span className={styles.claimSubmitCircle}>
                  <ArrowRight size={13} />
                </span>
              </button>
            </form>
            <div className={styles.claimFootnote}>
              <span className={styles.claimDot} />
              <span>1-CHAR HANDLES OPEN · </span>
              <Link to="/donate" className={styles.claimDonateLink}>
                SUPPORTER PERKS AVAILABLE →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: RARE HANDLES & HOLOGRAPHIC AQUA PASSPORT */}
      <section className={styles.trophiesSection} aria-labelledby="trophies-title">
        <div className={styles.trophiesLeft}>
          <p className={styles.sectionKicker}>Handles, UIDs &amp; Badges</p>
          <h2 id="trophies-title" className={styles.sectionTitle}>
            Rare handles &amp;
            <br />
            Day-One Passports.
          </h2>
          <p className={styles.sectionLead}>
            Claim a 1, 2, or 3-character handle and lock in your permanent sequential UID. Click any tier below to preview it live on the Aqua Holographic Passport.
          </p>

          <div className={styles.scarcityTable}>
            {RARITY_TIERS.map((tier) => (
              <button
                key={tier.len}
                type="button"
                onClick={() => setClaimInput(tier.sample)}
                className={`${styles.scarcityRow} ${previewHandle === tier.sample ? styles.scarcityRowActive : ''}`}
              >
                <div>
                  <span className={styles.scarcityLabel}>{tier.len}</span>
                  <span className={styles.scarcitySub}>{tier.sub}</span>
                </div>
                <span className={styles.scarcityBadge}>
                  {tier.badge} · /{tier.sample}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.idCardWrap}>
          <div
            className={styles.idCard}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
          >
            <PawPrint className={styles.idCardWatermark} />
            <div className={styles.idCardHeader}>
              <span className={styles.idCardBrand}>
                <PawPrint size={13} /> USER.PET PASSPORT
              </span>
              <span className={styles.idCardUidBadge}>UID #0001</span>
            </div>

            <div className={styles.idCardUrl}>
              <span className={styles.idCardUrlMuted}>user.pet/</span>
              <span className={styles.idCardUrlStrong}>{previewHandle}</span>
            </div>

            <div className={styles.idCardCaption}>
              {previewHandle.length === 1
                ? 'Mythic 1-character handle · 1 of 36 worldwide'
                : `${previewHandle.length}-character handle · Permanent sequential UID`}
            </div>

            <div className={styles.idCardBadges}>
              <span>FOUNDER</span>
              <span>EARLY SUPPORTER</span>
              <span>DISCORD VERIFIED</span>
              <span>OG</span>
            </div>

            <div className={styles.idCardFooter}>
              <div>
                <div className={styles.idCardMetaLabel}>EDITION</div>
                <div className={styles.idCardMetaValue}>AQUA GENESIS · DAY ONE</div>
              </div>
              <div className={styles.idCardBarcode} aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE CREATIVE STUDIO */}
      <section className={styles.controlRoomSection} aria-labelledby="features-title">
        <div className={styles.controlRoomGrid}>
          <div className={styles.controlRoomLeft}>
            <p className={styles.sectionKicker}>Interactive Studio</p>
            <h2 id="features-title" className={styles.sectionTitle}>
              Built like a
              <br />
              creative engine.
            </h2>
            <p className={styles.sectionLead}>
              Test-drive our live customization engine right here. Switch between 16 curated fonts, trigger 60fps ReactBits shaders, change the website&apos;s cursor, or preview time-synced LRC lyrics.
            </p>

            <div className={styles.controlTabsList}>
              {CONTROL_TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const active = controlTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`feature-${idx}`}
                    onClick={() => setControlTab(tab.id)}
                    className={`${styles.controlTabBtn} ${active ? styles.controlTabBtnActive : ''}`}
                  >
                    <span className={styles.controlTabNum}>{tab.num}</span>
                    <span className={styles.controlTabCopy}>
                      <strong>{tab.title}</strong>
                      <small>{tab.sub}</small>
                    </span>
                    <Icon size={16} className={styles.controlTabIcon} />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={styles.controlRoomStage}
            style={{ cursor: buildCursorCssValue(demoCursor, '#6cc4ff') || 'auto' }}
          >
            <div className={styles.controlStageTopbar}>
              <div className={styles.controlStageTitle}>
                <strong>Live Studio Sandbox</strong>
                <span>Click any option below to preview it in real time</span>
              </div>
              <Link to={user ? '/dashboard/editor' : '/login'} className={styles.aquaPillSmall}>
                Open Full Editor <ArrowRight size={12} />
              </Link>
            </div>

            <div className={styles.controlStagePills}>
              {CONTROL_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setControlTab(t.id)}
                  className={`${styles.stagePill} ${controlTab === t.id ? styles.stagePillActive : ''}`}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div className={styles.controlStageBody}>
              <div className={styles.controlStageControls}>
                {controlTab === 'fonts' && (
                  <div className={styles.stagePanel}>
                    <div className={styles.stagePanelLabel}>CHOOSE FROM 16 CURATED FONTS + CUSTOM UPLOAD</div>
                    <div className={styles.fontDemoGrid}>
                      {FONT_OPTIONS.filter(([id]) => id !== 'custom')
                        .slice(0, 9)
                        .map(([id, label, css, tag]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setDemoFont(id)}
                            className={`${styles.fontDemoCard} ${demoFont === id ? styles.fontDemoCardActive : ''}`}
                            style={{ fontFamily: css }}
                          >
                            <span className={styles.fontDemoAa}>Aa</span>
                            <span className={styles.fontDemoName}>{label}</span>
                            <span className={styles.fontDemoTag}>{tag}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {controlTab === 'shaders' && (
                  <div className={styles.stagePanel}>
                    <div className={styles.stagePanelLabel}>60FPS REACTBITS SHADERS &amp; START GATE</div>
                    <div className={styles.shaderDemoGrid}>
                      {SHADER_PRESETS.map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDemoShader(id)}
                          className={`${styles.shaderDemoBtn} ${demoShader === id ? styles.shaderDemoBtnActive : ''}`}
                        >
                          <span>{label}</span>
                          <Sparkles size={13} />
                        </button>
                      ))}
                    </div>
                    <div className={styles.stagePanelLabel} style={{ marginTop: '14px' }}>
                      START SCREEN TITLE EFFECT
                    </div>
                    <div className={styles.shaderDemoGrid}>
                      {['neon', 'glitch', 'rainbow', 'typewriter', 'fire', 'chroma'].map((fx) => (
                        <button
                          key={fx}
                          type="button"
                          onClick={() => setDemoEntryFx(fx)}
                          className={`${styles.shaderDemoBtn} ${demoEntryFx === fx ? styles.shaderDemoBtnActive : ''}`}
                        >
                          <span className="capitalize">{fx}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {controlTab === 'cursors' && (
                  <div className={styles.stagePanel}>
                    <div className={styles.stagePanelLabel}>CLICK ANY CURSOR TO APPLY IT TO THE ENTIRE WEBSITE</div>
                    <div className={styles.cursorDemoGrid}>
                      {CURSOR_PRESETS.slice(0, 9).map(([id, label, desc]) => {
                        const previewUrl = getCursorPreviewDataUrl(id, '#6cc4ff');
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => applySiteAndDemoCursor(id)}
                            style={{ cursor: buildCursorCssValue(id, '#6cc4ff') || 'pointer' }}
                            className={`${styles.cursorDemoCard} ${demoCursor === id ? styles.cursorDemoCardActive : ''}`}
                          >
                            <div className={styles.cursorDemoIcon}>
                              {previewUrl ? (
                                <img src={previewUrl} alt={label} className="h-5 w-5" />
                              ) : (
                                <MousePointerClick size={15} />
                              )}
                            </div>
                            <div className={styles.cursorDemoMeta}>
                              <strong>{label}</strong>
                              <span>{desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {controlTab === 'audio' && (
                  <div className={styles.stagePanel}>
                    <div className={styles.stagePanelLabel}>SYNCED LRC LYRICS &amp; DISCORD SUBDOMAIN VERIFY</div>
                    <div className={styles.audioDemoBox}>
                      <div className={styles.audioDemoTrack}>
                        <Music2 size={16} className="text-sky-400" />
                        <div>
                  <strong>Resonance — Aqua Synthwave Mix</strong>
                          <span>Time-synced LRC karaoke + Vinyl/Glass player</span>
                        </div>
                      </div>
                      <div className={styles.lyricDemoLines}>
                        <span>00:12 · Drifting through the midnight tide</span>
                        <strong className={styles.lyricDemoActive}>00:16 · Your digital home, alive in 60fps ✦</strong>
                        <span>00:21 · Aqua shaders glowing behind one link</span>
                      </div>
                      <div className={styles.discordVerifyBox}>
                        <ShieldCheck size={15} />
                        <span>
                          Verify <strong>{previewHandle}.user.pet</strong> on Discord via <code>/.well-known/discord</code>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.controlStagePreview} style={{ fontFamily: fontStyle(demoFont) }}>
                <BackgroundFx kind={demoShader} amount={65} color="#6cc4ff" preview />
                <div className={styles.miniCard}>
                  <span className={styles.miniCardTag}>LIVE AQUA PREVIEW</span>
                  <div className={styles.miniCardAvatar}>U</div>
                  <div className={styles.miniCardName}>
                    <FxText fx={demoEntryFx} text={`@${previewHandle}`} style={{ color: '#ffffff', '--fx-color': '#6cc4ff' }} />
                  </div>
                  <p className={styles.miniCardBio}>
                    Font: <strong>{demoFont}</strong> · Shader: <strong>{demoShader}</strong> · Cursor: <strong>{demoCursor}</strong>
                  </p>
                  <div className={styles.miniCardPill}>click to enter · user.pet/{previewHandle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMMUNITY SHOWCASE + FEATURE WALL */}
      <section className={styles.showcase} aria-labelledby="discovery-title">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionKicker}>Community Directory</p>
            <h2 id="discovery-title" className={styles.sectionTitle}>
              Crafted on user.pet.
            </h2>
            <p className={styles.sectionLead}>
              Explore live pages built by creators combining custom typography, interactive start gates, 60fps shaders, and synced music.
            </p>
          </div>
          <Link to="/explore" className={styles.darkPillBtn}>
            <span>Browse all profiles</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className={styles.profileGrid}>
          {slots.map((entry, index) => (
            <div key={entry?.username || `empty-${index}`}>
              {entry ? <TopProfile entry={entry} slot={index + 1} /> : <ProfilePlaceholder />}
            </div>
          ))}
        </div>

        <div className={styles.featureWallWrap}>
          <div className={styles.featureWallHeader}>
            <span className={styles.sectionKicker}>Everything unlocked</span>
            <h3>Every tool you need to make your corner of the internet unforgettable.</h3>
          </div>
          <div className={styles.featureWallPills}>
            {FEATURE_WALL.map((item) => (
              <span key={item} className={styles.featureWallPill}>
                <Check size={12} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className={styles.finalSection} data-testid="the-end-section">
        <p className={styles.sectionKicker}>Ready when you are</p>
              <h2>{user ? 'Your Aqua studio is ready.' : 'Claim your user.pet handle today.'}</h2>
        <p>
          {user
            ? 'Open the Profile Editor to customize your fonts, start screen, 60fps ReactBits shaders, custom cursor, and synced audio.'
            : 'Pick your handle, customize your start gate, fonts, 60fps shaders, and custom cursor in under a minute.'}
        </p>
        <div className={styles.finalActions}>
          {user ? (
            <>
              <Link to="/dashboard" data-testid="end-cta" className={styles.aquaPillBtn}>
                <span>Open dashboard</span>
                <span className={styles.aquaPillCircle}>
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
              <Link to="/explore" data-testid="end-cta" className={styles.aquaPillBtn}>
                <span>Explore pages</span>
                <span className={styles.aquaPillCircle}>
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
      </section>
    </div>
  );
}
