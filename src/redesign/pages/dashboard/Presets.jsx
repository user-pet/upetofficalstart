import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle, btnCls, ghostCls, inputCls } from '../../components/Controls';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { PreviewFrame } from './editor/EditorPreview';
import { BackgroundFx } from '../../components/ProfileBits';
import { defaultProfile, sanitizeRedesignProfile } from '../../lib/profileModel';
import { changeProfilePreset, listProfilePresets } from '../../lib/profilePresets';
import { useStore } from '../../lib/store';

const INITIAL_COMMUNITY_TEMPLATES = [
  {
    id: 'tpl-velvet-bento',
    name: 'Velvet Dusk Bento',
    creator: 'dome',
    category: 'Creator',
    tier: 'Free',
    favorites: 342,
    uses: 1840,
    layout: 'bento',
    entrance: 'trace',
    shader: 'galaxy',
    font: 'geist',
    accent: '#f472b6',
    cardColor: '#130e24',
    bgColor: '#0b0816',
  },
  {
    id: 'tpl-vrchat-prism',
    name: 'VRChat Prism Sanctuary',
    creator: 'nyx',
    category: 'VRChat',
    tier: 'Premium',
    favorites: 518,
    uses: 2690,
    layout: 'crest',
    entrance: 'circuit',
    shader: 'iridescence',
    font: 'syne',
    accent: '#c084fc',
    cardColor: '#170f2e',
    bgColor: '#0c081a',
  },
  {
    id: 'tpl-lrc-vinyl',
    name: 'Midnight LRC Studio',
    creator: 'lamp',
    category: 'Music',
    tier: 'Free',
    favorites: 429,
    uses: 2150,
    layout: 'stereo',
    entrance: 'sweep',
    shader: 'silk',
    font: 'editorial',
    accent: '#6cc4ff',
    cardColor: '#0f182b',
    bgColor: '#090e1a',
  },
  {
    id: 'tpl-apex-hud',
    name: 'Tactical FPS Blueprint',
    creator: 'vortex',
    category: 'Gaming',
    tier: 'Premium',
    favorites: 287,
    uses: 1420,
    layout: 'portrait',
    entrance: 'blueprint',
    shader: 'crtwarp',
    font: 'orbitron',
    accent: '#38bdf8',
    cardColor: '#0e1628',
    bgColor: '#080c18',
  },
  {
    id: 'tpl-sakura-cloud',
    name: 'Blush Cloud Dream',
    creator: 'sora',
    category: 'Anime',
    tier: 'Free',
    favorites: 612,
    uses: 3180,
    layout: 'banner',
    entrance: 'condense',
    shader: 'clouds',
    font: 'jakarta',
    accent: '#f9a8d4',
    cardColor: '#211224',
    bgColor: '#120916',
  },
  {
    id: 'tpl-ghost-minimal',
    name: 'Ghost Fiber Mono',
    creator: 'kuro',
    category: 'Minimal',
    tier: 'Free',
    favorites: 198,
    uses: 940,
    layout: 'minimal',
    entrance: 'origin',
    shader: 'ghostfibers',
    font: 'mono',
    accent: '#a78bfa',
    cardColor: '#120f22',
    bgColor: '#0a0814',
  },
];

const PRICING_FILTERS = ['All', 'Free', 'Premium', 'Popular'];
const CATEGORY_FILTERS = ['All', 'Gaming', 'Music', 'VRChat', 'Minimal', 'Anime', 'Creator'];

const TemplateSkeletonPreview = ({ tpl }) => {
  return (
    <div
      className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 p-4"
      style={{ background: tpl.bgColor || '#0b0816' }}
    >
      <BackgroundFx kind={tpl.shader || 'galaxy'} amount={68} color={tpl.accent || '#f472b6'} preview />
      <div
        className="relative z-10 flex w-full max-w-[210px] flex-col gap-2 rounded-xl border p-3 shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-[1.03]"
        style={{
          background: `${tpl.cardColor || '#130e24'}d9`,
          borderColor: `${tpl.accent || '#f472b6'}55`,
        }}
      >
        {tpl.layout === 'banner' && (
          <div
            className="-mx-3 -mt-3 mb-1 h-7 rounded-t-xl"
            style={{
              background: `linear-gradient(90deg, ${tpl.accent}88, #6cc4ff66)`,
            }}
          />
        )}
        <div className="flex items-center gap-2">
          <span
            className="h-6 w-6 shrink-0 rounded-full border border-white/30"
            style={{
              background: `linear-gradient(135deg, ${tpl.accent}, #6cc4ff)`,
            }}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="h-2 w-16 rounded-full bg-white/85" />
            <div className="h-1.5 w-10 rounded-full bg-white/40" />
          </div>
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-white/75">
            {tpl.layout}
          </span>
        </div>

        {tpl.layout === 'bento' ? (
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <div className="h-5 rounded-md border border-white/10 bg-white/10" />
            <div className="h-5 rounded-md border border-white/10 bg-white/10" />
            <div
              className="col-span-2 h-5 rounded-md border"
              style={{ borderColor: `${tpl.accent}44`, background: `${tpl.accent}22` }}
            />
          </div>
        ) : tpl.layout === 'stereo' || tpl.layout === 'portrait' ? (
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-1.5 pt-0.5">
            <div className="h-10 rounded-md bg-white/10" />
            <div className="space-y-1">
              <div className="h-4 rounded-md bg-white/15" />
              <div className="h-4 rounded-md bg-white/10" />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pt-0.5">
            <div className="h-4 w-full rounded-md bg-white/15" />
            <div
              className="h-4 w-4/5 rounded-md"
              style={{ background: `${tpl.accent}33` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PresetPreview = ({ profile, tall = false }) => (
  <div className="pointer-events-none relative overflow-hidden rounded-2xl bg-[#0c0918]">
    <PreviewFrame profile={profile} view="profile" className={tall ? 'h-full min-h-[520px] w-full' : 'h-72 w-full'} />
    {!tall && <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0c0918]/90 to-transparent" />}
  </div>
);

export default function Presets() {
  const { user, saveState, replaceProfile, updateProfile } = useStore();
  const navigate = useNavigate();
  const [hubTab, setHubTab] = useState('all'); // 'all' | 'favorites' | 'mine'
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareName, setShareName] = useState('');
  const [shareCategory, setShareCategory] = useState('Creator');
  const [shareTier, setShareTier] = useState('Free');

  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const raw = localStorage.getItem('upet_shared_templates_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem('upet_favorite_templates_v1');
      return raw ? JSON.parse(raw) : ['tpl-velvet-bento'];
    } catch {
      return ['tpl-velvet-bento'];
    }
  });

  const [data, setData] = useState({ items: [], activePresetId: '', max: 5 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [name, setName] = useState('');
  const [previewId, setPreviewId] = useState('');
  const [renaming, setRenaming] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [createNextOpen, setCreateNextOpen] = useState(false);

  const load = async () => {
    try {
      setData(await listProfilePresets());
    } catch (error) {
      toast.error(error?.message || 'Profile presets could not be loaded');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const allTemplates = useMemo(
    () => [...customTemplates, ...INITIAL_COMMUNITY_TEMPLATES],
    [customTemplates]
  );

  const filteredTemplates = useMemo(() => {
    let rows = allTemplates.filter((tpl) => {
      if (hubTab === 'favorites' && !favoriteIds.includes(tpl.id)) return false;
      if (hubTab === 'mine' && tpl.creator !== user.username) return false;
      if (pricingFilter === 'Free' && tpl.tier !== 'Free') return false;
      if (pricingFilter === 'Premium' && tpl.tier !== 'Premium') return false;
      if (categoryFilter !== 'All' && tpl.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${tpl.name} @${tpl.creator} ${tpl.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (pricingFilter === 'Popular') {
      rows = [...rows].sort((a, b) => b.uses - a.uses);
    }
    return rows;
  }, [allTemplates, hubTab, favoriteIds, user.username, pricingFilter, categoryFilter, searchQuery]);

  const toggleFavorite = (id) => {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        localStorage.setItem('upet_favorite_templates_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const applyCommunityTemplate = (tpl) => {
    updateProfile({
      'card.layout': tpl.layout,
      'card.entrance': tpl.entrance || 'none',
      'card.font': tpl.font || 'geist',
      'card.accent': tpl.accent || '#f472b6',
      'card.cardColor': tpl.cardColor || '#130e24',
      'card.bgColor': tpl.bgColor || '#0b0816',
      'effects.background': tpl.shader || 'galaxy',
      'effects.backgroundColor': tpl.accent || '#f472b6',
    });
    toast.success(`Applied "${tpl.name}" by @${tpl.creator}`);
  };

  const handleShareLook = (event) => {
    event.preventDefault();
    const clean = shareName.trim() || `${user.profile.displayName || user.username}'s Look`;
    const newTpl = {
      id: `tpl-user-${Date.now().toString(36)}`,
      name: clean,
      creator: user.username,
      category: shareCategory,
      tier: shareTier,
      favorites: 1,
      uses: 1,
      layout: user.profile.card?.layout || 'bento',
      entrance: user.profile.card?.entrance || 'none',
      shader: user.profile.effects?.background || 'galaxy',
      font: user.profile.card?.font || 'geist',
      accent: user.profile.card?.accent || '#f472b6',
      cardColor: user.profile.card?.cardColor || '#130e24',
      bgColor: user.profile.card?.bgColor || '#0b0816',
    };
    const next = [newTpl, ...customTemplates];
    setCustomTemplates(next);
    try {
      localStorage.setItem('upet_shared_templates_v1', JSON.stringify(next));
    } catch {}
    setShareName('');
    setShareOpen(false);
    toast.success(`Shared "${clean}" to the Community Templates Hub!`);
  };

  const profiles = useMemo(
    () => data.items.map((item) => ({ ...item, profile: sanitizeRedesignProfile(item.preview, user.username) })),
    [data.items, user.username]
  );
  const selected = profiles.find((item) => item.id === previewId);
  const working = saveState === 'saving';

  const run = async (key, action, values, success) => {
    if (working) {
      toast.message('Finishing your latest profile save…');
      return false;
    }
    setBusy(key);
    try {
      const res = await changeProfilePreset(action, values);
      if (res?.activatedProfile) replaceProfile(res.activatedProfile);
      await load();
      if (success) toast.success(success);
      return true;
    } catch (error) {
      toast.error(error?.message || 'Profile preset could not be changed');
      return false;
    } finally {
      setBusy('');
    }
  };

  const create = async (event) => {
    event.preventDefault();
    const value = name.trim();
    if (!value) return toast.error('Give this profile preset a name');
    const saved = await run('create', 'create', { name: value }, 'Profile preset saved');
    if (saved) {
      setName('');
      setCreateNextOpen(true);
    }
  };

  const createNewProfile = async () => {
    setBusy('new-profile');
    try {
      await changeProfilePreset('clearActive');
      replaceProfile(defaultProfile(user.username));
      setCreateNextOpen(false);
      toast.success('New profile started');
      navigate('/dashboard/editor');
    } catch (error) {
      toast.error(error?.message || 'A new profile could not be started');
    } finally {
      setBusy('');
    }
  };

  const rename = async (id) => {
    if (!renameValue.trim()) return toast.error('Give this profile preset a name');
    await run(`rename-${id}`, 'rename', { id, name: renameValue }, 'Preset renamed');
    setRenaming('');
  };

  return (
    <div data-testid="profile-presets-page" className="space-y-6">
      {/* Top Header with "Share my look" CTA */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          title="Community Templates Hub"
          sub="Explore community-crafted Bento layouts, ReactBits shaders, and typography presets — or share your own look."
        />
        <button
          type="button"
          data-testid="share-my-look-btn"
          onClick={() => setShareOpen(true)}
          className={btnCls}
        >
          <Share2 className="h-4 w-4" />
          Share my look
        </button>
      </div>

      {/* Primary Tabs: All templates, Favorites, Mine */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-2xl border border-pink-400/20 bg-[#0e0a1c] p-1.5"
          role="tablist"
          aria-label="Template views"
        >
          {[
            ['all', 'All templates'],
            ['favorites', `Favorites (${favoriteIds.length})`],
            ['mine', 'Mine'],
          ].map(([id, label]) => {
            const active = hubTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`templates-tab-${id}`}
                onClick={() => setHubTab(id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-pink-400 via-violet-400 to-sky-400 text-slate-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar + Dual Filter Rows */}
      <section className="glass space-y-3.5 rounded-2xl border border-pink-400/20 p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            data-testid="templates-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or creator"
            className={`${inputCls} pl-10`}
          />
        </div>

        {/* Filter Row 1: Pricing / Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
            Filter:
          </span>
          {PRICING_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              data-testid={`templates-pricing-${f.toLowerCase()}`}
              onClick={() => setPricingFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                pricingFilter === f
                  ? 'bg-gradient-to-r from-pink-400 to-sky-400 text-slate-950'
                  : 'border border-white/10 bg-[#0e0a1c] text-zinc-300 hover:border-pink-400/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Filter Row 2: Thematic Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[13px] font-semibold uppercase tracking-wider text-zinc-400">
            Category:
          </span>
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              data-testid={`templates-category-${cat.toLowerCase()}`}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'border border-pink-400 bg-pink-400/20 text-pink-200'
                  : 'border border-white/10 bg-[#0e0a1c] text-zinc-300 hover:border-pink-400/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Template Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="templates-grid">
        {filteredTemplates.map((tpl) => {
          const isFav = favoriteIds.includes(tpl.id);
          const favCount = tpl.favorites + (isFav && !INITIAL_COMMUNITY_TEMPLATES.some((i) => i.id === tpl.id && i.id === 'tpl-velvet-bento') ? 1 : 0);
          return (
            <article
              key={tpl.id}
              data-testid={`template-card-${tpl.id}`}
              className="group glass flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-pink-400/40"
            >
              <div>
                <div className="relative">
                  <TemplateSkeletonPreview tpl={tpl} />
                  <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-[#0e0a1c]/85 px-2.5 py-0.5 font-mono text-[11px] font-bold text-pink-200 backdrop-blur-md">
                    {tpl.tier} · {tpl.category}
                  </span>
                  <button
                    type="button"
                    data-testid={`template-fav-${tpl.id}`}
                    onClick={() => toggleFavorite(tpl.id)}
                    aria-label={`Favorite ${tpl.name}`}
                    className={`absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur-md transition-colors ${
                      isFav
                        ? 'border-amber-400/50 bg-amber-400/20 text-amber-200'
                        : 'border-white/15 bg-[#0e0a1c]/80 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-amber-300 text-amber-300' : ''}`} />
                    <span>{favCount}</span>
                  </button>
                </div>

                <div className="mt-3 flex items-start justify-between gap-2 px-1">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-white">{tpl.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-zinc-400">by @{tpl.creator}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-zinc-300">
                    <Users className="h-3 w-3 text-pink-300" />
                    {tpl.uses.toLocaleString()} uses
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  type="button"
                  data-testid={`use-template-${tpl.id}`}
                  onClick={() => applyCommunityTemplate(tpl)}
                  className={`${btnCls} w-full`}
                >
                  <Sparkles className="h-4 w-4" />
                  Use template
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Saved Personal Profile Presets Section */}
      <section className="glass overflow-hidden rounded-2xl border border-primary/20 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold">Saved Personal Snapshots ({data.items.length}/{data.max})</h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Save up to five personal versions of your page and switch which one is live at any time.
            </p>
          </div>
          <form onSubmit={create} className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
            <input
              data-testid="preset-name"
              className={inputCls}
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Preset name, e.g. Velvet night"
              disabled={data.items.length >= data.max}
            />
            <button
              data-testid="preset-create"
              disabled={busy || working || data.items.length >= data.max}
              className={`${btnCls} shrink-0`}
            >
              <Plus className="h-4 w-4" />
              Save profile
            </button>
          </form>
        </div>

        {loading ? (
          <div className="mt-4 grid min-h-32 place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          profiles.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((item) => {
                const active = item.id === data.activePresetId;
                return (
                  <article
                    key={item.id}
                    className={`glass overflow-hidden rounded-2xl border p-3 transition-colors ${
                      active ? 'border-primary ring-2 ring-primary/20' : 'border-white/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewId(item.id)}
                      className="relative block w-full text-left"
                      aria-label={`Preview ${item.name}`}
                    >
                      <PresetPreview profile={item.profile} />
                      <span className="absolute left-3 top-3 rounded-full bg-[#0e0a1c]/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {active ? 'Live now' : 'Saved profile'}
                      </span>
                      <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-[#0e0a1c]/85 text-white backdrop-blur-md">
                        <Eye className="h-4 w-4" />
                      </span>
                    </button>
                    <div className="px-1 pb-1 pt-3">
                      {renaming === item.id ? (
                        <div className="flex gap-2">
                          <input
                            autoFocus
                            className={`${inputCls} py-2`}
                            maxLength={40}
                            value={renameValue}
                            onChange={(event) => setRenameValue(event.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => rename(item.id)}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="min-w-0 flex-1 truncate font-display font-bold">{item.name}</h3>
                          <button
                            type="button"
                            aria-label={`Rename ${item.name}`}
                            onClick={() => {
                              setRenaming(item.id);
                              setRenameValue(item.name);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        @{item.profile.alias || user.username} · {item.profile.links.length} links
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy || active}
                          onClick={() =>
                            run(`activate-${item.id}`, 'activate', { id: item.id }, `${item.name} is now live`)
                          }
                          className={`${btnCls} px-3`}
                        >
                          {busy === `activate-${item.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : active ? (
                            <Check className="h-4 w-4" />
                          ) : null}
                          {active ? 'Live' : 'Use profile'}
                        </button>
                        <button
                          type="button"
                          disabled={busy || working}
                          onClick={() =>
                            run(`update-${item.id}`, 'update', { id: item.id }, `${item.name} updated`)
                          }
                          className={`${ghostCls} px-3`}
                        >
                          <Save className="h-4 w-4" />
                          Update
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(`delete-${item.id}`, 'delete', { id: item.id }, 'Profile preset deleted')}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete preset
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        )}
      </section>

      {/* Share My Look Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-pink-400/25 bg-[#0e0a1c] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Share my look</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleShareLook} className="mt-2 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Template name</label>
              <input
                data-testid="share-look-name"
                className={inputCls}
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                placeholder={`${user.profile.displayName || user.username}'s Bento Look`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Category</label>
                <select
                  value={shareCategory}
                  onChange={(e) => setShareCategory(e.target.value)}
                  className={inputCls}
                >
                  {CATEGORY_FILTERS.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Access tier</label>
                <select
                  value={shareTier}
                  onChange={(e) => setShareTier(e.target.value)}
                  className={inputCls}
                >
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`${btnCls} w-full`}>
              <Share2 className="h-4 w-4" />
              Publish template as @{user.username}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setPreviewId('')}>
        <DialogContent className="grid h-[calc(100dvh-1rem)] max-h-[900px] w-[calc(100vw-1rem)] max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl p-3 sm:h-[92dvh] sm:p-5">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="font-display">{selected?.name || 'Profile preview'}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 overflow-hidden rounded-2xl bg-[#0c0918]/60 p-1 sm:p-3">
            {selected && <PresetPreview profile={selected.profile} tall />}
          </div>
          {selected && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">This is how the saved version looks.</span>
              <button
                type="button"
                disabled={busy || selected.id === data.activePresetId}
                onClick={() =>
                  run(`activate-${selected.id}`, 'activate', { id: selected.id }, `${selected.name} is now live`)
                }
                className={btnCls}
              >
                {selected.id === data.activePresetId ? 'Currently live' : 'Use this profile'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createNextOpen} onOpenChange={setCreateNextOpen}>
        <DialogContent className="glass max-w-md rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Create a new profile?</DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl border border-primary/20 bg-primary/[.06] p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your profile was saved safely as a preset. You can keep editing it, or start a clean profile and build another look.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setCreateNextOpen(false)} className={ghostCls}>
              Keep editing
            </button>
            <button
              type="button"
              disabled={busy === 'new-profile'}
              onClick={createNewProfile}
              className={btnCls}
            >
              {busy === 'new-profile' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create new profile
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
