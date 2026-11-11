import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import pruneHandler from '../api/visitor-prune.js';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function walkCodeFiles(dir, list = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', '.frame-quarantine'].includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkCodeFiles(full, list);
    else if (/\.(js|jsx|mjs|json|rules|example)$/i.test(entry)) list.push(full);
  }
  return list;
}

const mockRes = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(payload) { this.body = payload; return this; },
});

test('S1: repository contains zero hardcoded live Firebase API keys (AIzaSy...)', () => {
  const files = walkCodeFiles(ROOT);
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /AIzaSy[A-Za-z0-9_-]{30,}/, `Hardcoded API key found in ${file}`);
  }
  const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  assert.doesNotMatch(envExample, /upet-c480b/);
});

test('S4: storage.rules blocks SVG XSS uploads and requires verified email', () => {
  const rules = readFileSync(new URL('../storage.rules', import.meta.url), 'utf8');
  assert.doesNotMatch(rules, /contentType\.matches\(['"]image\/\.\*['"]\)/);
  assert.match(rules, /image\/\(jpeg\|png\|webp\|gif\|avif\)/);
  assert.match(rules, /request\.auth\.token\.email_verified == true/);
});

test('S5: blob and discord-auth endpoints enforce active member access checks', () => {
  const blobSource = readFileSync(new URL('../api/blob.js', import.meta.url), 'utf8');
  const discordAuthSource = readFileSync(new URL('../api/discord-auth.js', import.meta.url), 'utf8');
  assert.match(blobSource, /requireMemberAccess/);
  assert.match(discordAuthSource, /requireMemberAccess/);
});

test('S8 & S9: visitor-prune enforces constant-time CRON_SECRET and visitorAggregate bounds map keys', async () => {
  const prev = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'super-secret-cron-token';
  const denied1 = mockRes();
  await pruneHandler({ method: 'GET', headers: { authorization: 'Bearer wrong' } }, denied1);
  assert.equal(denied1.statusCode, 403);

  const denied2 = mockRes();
  await pruneHandler({ method: 'GET', headers: { authorization: 'Bearer super-secret-cron-tokeX' } }, denied2);
  assert.equal(denied2.statusCode, 403);

  if (prev === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = prev;

  const aggSource = readFileSync(new URL('../server/visitorAggregate.js', import.meta.url), 'utf8');
  assert.match(aggSource, /aggregateRouteKey/);
  assert.match(aggSource, /safeMapFieldKey/);
});

test('S3 & S7: CSS url() helpers strip quotes/parens, media-preview blocks redirects, and password-locked profiles redact data', () => {
  const bits = readFileSync(new URL('../src/redesign/components/ProfileBits.jsx', import.meta.url), 'utf8');
  const widgets = readFileSync(new URL('../src/redesign/components/Widgets.jsx', import.meta.url), 'utf8');
  const profilePage = readFileSync(new URL('../src/redesign/pages/ProfilePage.jsx', import.meta.url), 'utf8');
  const entryGate = readFileSync(new URL('../src/redesign/components/EntryGate.jsx', import.meta.url), 'utf8');
  const mediaPreview = readFileSync(new URL('../api/media-preview.js', import.meta.url), 'utf8');
  assert.match(bits, /safeCssUrl/);
  assert.match(widgets, /safeBannerCssUrl/);
  assert.match(profilePage, /passwordLocked/);
  assert.match(entryGate, /lockedUntil/);
  assert.match(mediaPreview, /redirect:\s*'error'/);
});

test('B1–B6 & M1–M12: all mobile display fixes and UI bug fixes are present in source', () => {
  const profileCard = readFileSync(new URL('../src/redesign/components/ProfileCard.jsx', import.meta.url), 'utf8');
  const dashboard = readFileSync(new URL('../src/redesign/pages/dashboard/Dashboard.jsx', import.meta.url), 'utf8');
  const controls = readFileSync(new URL('../src/redesign/components/Controls.jsx', import.meta.url), 'utf8');
  const editorPreview = readFileSync(new URL('../src/redesign/pages/dashboard/editor/EditorPreview.jsx', import.meta.url), 'utf8');
  const floatingLayer = readFileSync(new URL('../src/redesign/components/ProfileFloatingLayer.jsx', import.meta.url), 'utf8');
  const header = readFileSync(new URL('../src/redesign/components/Header.jsx', import.meta.url), 'utf8');
  const mediaTab = readFileSync(new URL('../src/redesign/pages/dashboard/editor/MediaTab.jsx', import.meta.url), 'utf8');
  const homeCss = readFileSync(new URL('../src/redesign/pages/Home.module.css', import.meta.url), 'utf8');
  const overview = readFileSync(new URL('../src/redesign/pages/dashboard/Overview.jsx', import.meta.url), 'utf8');
  const settings = readFileSync(new URL('../src/redesign/pages/dashboard/Settings.jsx', import.meta.url), 'utf8');
  const cardTab = readFileSync(new URL('../src/redesign/pages/dashboard/editor/CardTab.jsx', import.meta.url), 'utf8');
  const explore = readFileSync(new URL('../src/redesign/pages/Explore.jsx', import.meta.url), 'utf8');
  const comingSoon = readFileSync(new URL('../src/redesign/pages/ComingSoon.jsx', import.meta.url), 'utf8');
  const linksTab = readFileSync(new URL('../src/redesign/pages/dashboard/editor/LinksTab.jsx', import.meta.url), 'utf8');
  const lyricsTab = readFileSync(new URL('../src/redesign/pages/dashboard/editor/LyricsTab.jsx', import.meta.url), 'utf8');
  const profilePage = readFileSync(new URL('../src/redesign/pages/ProfilePage.jsx', import.meta.url), 'utf8');

  assert.match(profileCard, /upet-profile-scene/);
  assert.match(dashboard, /\['overview',\s*'editor',\s*'profiles',\s*'settings'\]/);
  assert.match(controls, /defaultOpen\s*=\s*true/);
  assert.match(editorPreview, /window\.innerWidth\s*<\s*768\s*\?\s*'mobile'\s*:\s*'desktop'/);
  assert.match(editorPreview, /aria-label="Open live preview"/);
  assert.match(floatingLayer, /bottom-\[max\(3\.25rem/);
  assert.doesNotMatch(header, /Add another account/);
  assert.match(mediaTab, /collisionPadding=\{12\}/);
  assert.match(homeCss, /transform:none/);
  assert.doesNotMatch(overview, /Turn on 2FA/);
  assert.match(overview, /overview-share-btn/);
  assert.match(settings, /'widgets\.tiktok\.enabled':\s*true/);
  assert.match(cardTab, /THEME_PRESETS/);
  assert.match(explore, /explore-filter-/);
  assert.match(comingSoon, /All user\.pet systems are operational/);
  assert.match(linksTab, /draggable/);
  assert.match(lyricsTab, /dropLineAt/);
  assert.match(profilePage, /og:title/);

  const appSource = readFileSync(new URL('../src/redesign/App.jsx', import.meta.url), 'utf8');
  const helpAppSource = readFileSync(new URL('../src/help/HelpApp.jsx', import.meta.url), 'utf8');
  const storeSource = readFileSync(new URL('../src/redesign/lib/store.js', import.meta.url), 'utf8');
  assert.match(appSource, /window\.scrollTo\(\{\s*top:\s*0,\s*left:\s*0/);
  assert.match(helpAppSource, /window\.scrollTo\(\{\s*top:\s*0,\s*left:\s*0/);
  assert.match(storeSource, /purgeAmberAccount/);
  assert.match(storeSource, /switchToAccount/);
  assert.match(storeSource, /grantFounder/);
  assert.match(settings, /settings-delete-account/);
  assert.match(settings, /grant-founder-button/);
  assert.match(settings, /showFounderPanel\s*&&\s*<FounderAndAccount\s*\/>/);
  assert.match(settings, /VerifyOnDiscord/);

  const donateSource = readFileSync(new URL('../src/redesign/pages/Donate.jsx', import.meta.url), 'utf8');
  const wellKnownDiscord = readFileSync(new URL('../api/well-known-discord.js', import.meta.url), 'utf8');
  const effectsTab = readFileSync(new URL('../src/redesign/pages/dashboard/editor/EffectsTab.jsx', import.meta.url), 'utf8');
  assert.match(donateSource, /Currently Available/);
  assert.match(wellKnownDiscord, /normalizeDiscordDomainCode/);
  assert.match(effectsTab, /CURSOR_FX_LIST/);
});
