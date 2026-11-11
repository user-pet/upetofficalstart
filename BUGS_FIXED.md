# Complete Guide to Bugs Fixed (`user.pet`)

This document catalogs every bug fixed across the `user.pet` codebase, organized by category. Every entry includes:
1. **Where it was** — the exact file(s) and function/component.
2. **How it looked** — the user-visible symptom and the original buggy code.
3. **What it means** — the underlying root cause.
4. **How to fix it** — step-by-step explanation of the fix.
5. **New code** — the updated production code.

---

## Table of Contents

### Part 1 — Authentication, Login, Founder Access & Account Management
1. [Bug 1: "Firebase is not configured" Error on Local Startup](#bug-1-firebase-is-not-configured-error-on-local-startup)
2. [Bug 2: Real Accounts Rejected on Sign-In ("Access Restricted / Founder Only")](#bug-2-real-accounts-rejected-on-sign-in-access-restricted--founder-only)
3. [Bug 3: Firestore "Missing or Insufficient Permissions" Blocking Account & Editor Load](#bug-3-firestore-missing-or-insufficient-permissions-blocking-account--editor-load)
4. [Bug 4: Google OAuth Popup Immediately Closing on `localhost` & Unwanted Auto-Login to Fake "amber" Account](#bug-4-google-oauth-popup-immediately-closing-on-localhost--unwanted-auto-login-to-fake-amber-account)
5. [Bug 5: Missing "Delete Account" & "Grant Founder Status" Controls in Dashboard Settings](#bug-5-missing-delete-account--grant-founder-status-controls-in-dashboard-settings)
6. [Bug 6: Modview Link Hidden in Dashboard Sidebar for Founder Accounts](#bug-6-modview-link-hidden-in-dashboard-sidebar-for-founder-accounts)

### Part 2 — Navigation & Scroll Position
7. [Bug 7: Clicking Links at the Bottom of a Page Opens the New Page Scrolled to the Bottom](#bug-7-clicking-links-at-the-bottom-of-a-page-opens-the-new-page-scrolled-to-the-bottom)

### Part 3 — Mobile Display & Responsive Layout (B1–B6)
8. [Bug 8 (B1): Mobile Profile Scene Horizontal Overflow](#bug-8-b1-mobile-profile-scene-horizontal-overflow)
9. [Bug 9 (B2): Missing Mobile Bottom Navigation Bar in Dashboard](#bug-9-b2-missing-mobile-bottom-navigation-bar-in-dashboard)
10. [Bug 10 (B3): Non-Collapsible Settings & Editor Panels on Mobile](#bug-10-b3-non-collapsible-settings--editor-panels-on-mobile)
11. [Bug 11 (B4): Editor Live Preview Stuck in Desktop Frame & Inaccessible on Mobile](#bug-11-b4-editor-live-preview-stuck-in-desktop-frame--inaccessible-on-mobile)
12. [Bug 12 (B5): Floating Audio Player Overlapping Mobile Navigation Bar](#bug-12-b5-floating-audio-player-overlapping-mobile-navigation-bar)
13. [Bug 13 (B6): Homepage 3D Card Transform Causing Horizontal Overflow on Mobile](#bug-13-b6-homepage-3d-card-transform-causing-horizontal-overflow-on-mobile)

### Part 4 — Dashboard, Editor & Public Profile Features (M1–M10)
14. [Bug 14 (M1): Broken "Add another account" Button in Header Dropdown](#bug-14-m1-broken-add-another-account-button-in-header-dropdown)
15. [Bug 15 (M2): Media Picker Popover Clipping Against Viewport Edges](#bug-15-m2-media-picker-popover-clipping-against-viewport-edges)
16. [Bug 16 (M3): Non-Functional "Turn on 2FA" Prompt on Dashboard Overview](#bug-16-m3-non-functional-turn-on-2fa-prompt-on-dashboard-overview)
17. [Bug 17 (M4): Connecting TikTok in Settings Did Not Enable the TikTok Widget](#bug-17-m4-connecting-tiktok-in-settings-did-not-enable-the-tiktok-widget)
18. [Bug 18 (M5): Missing One-Click Theme Presets in Card Editor](#bug-18-m5-missing-one-click-theme-presets-in-card-editor)
19. [Bug 19 (M6): Missing Category Filter Pills on Explore Directory Page](#bug-19-m6-missing-category-filter-pills-on-explore-directory-page)
20. [Bug 20 (M7): Placeholder Text on `/status` and `/changelog` Pages](#bug-20-m7-placeholder-text-on-status-and-changelog-pages)
21. [Bug 21 (M8): No Drag-and-Drop Reordering for Profile Links](#bug-21-m8-no-drag-and-drop-reordering-for-profile-links)
22. [Bug 22 (M9): No Drag-and-Drop Reordering for Lyric Lines](#bug-22-m9-no-drag-and-drop-reordering-for-lyric-lines)
23. [Bug 23 (M10): Static Document Title & OpenGraph Meta Tags on Public Profiles](#bug-23-m10-static-document-title--opengraph-meta-tags-on-public-profiles)

### Part 5 — Security Hardening (S1–S9)
24. [Bug 24 (S1): Hardcoded Firebase Config Keys in Source Code](#bug-24-s1-hardcoded-firebase-config-keys-in-source-code)
25. [Bug 25 (S3): CSS `url()` Injection & Leaked Fields on Password-Locked Profiles](#bug-25-s3-css-url-injection--leaked-fields-on-password-locked-profiles)
26. [Bug 26 (S4): SVG XSS Uploads & Unverified User Uploads in Firebase Storage Rules](#bug-26-s4-svg-xss-uploads--unverified-user-uploads-in-firebase-storage-rules)
27. [Bug 27 (S5): Unchecked Site Access on Blob Upload & Discord OAuth Endpoints](#bug-27-s5-unchecked-site-access-on-blob-upload--discord-oauth-endpoints)
28. [Bug 28 (S7): SSRF via Open Redirects in Media Preview Endpoint](#bug-28-s7-ssrf-via-open-redirects-in-media-preview-endpoint)
29. [Bug 29 (S8 & S9): Non-Constant-Time `CRON_SECRET` Comparison & Unbounded Visitor Map Keys](#bug-29-s8--s9-non-constant-time-cron_secret-comparison--unbounded-visitor-map-keys)

---

## Part 1 — Authentication, Login, Founder Access & Account Management

---

### Bug 1: "Firebase is not configured" Error on Local Startup

#### 1. Where it was
- [src/app/firebase.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/app/firebase.js#L6-L15)
- [.env.local](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/.env.local) (missing)

#### 2. How it looked
When attempting to sign in or register on `http://localhost:8080/login`, the login form immediately failed with `"Firebase is not configured"`, and `hasFirebaseConfig` evaluated to `false`.

**Old state:**
Only `.env.example` existed in the repository root; no `.env.local` file existed for Vite to load `VITE_FIREBASE_*` variables from.

#### 3. What it means
Vite only loads environment variables from `.env`, `.env.local`, `.env.[mode]`, or `.env.[mode].local` — it never reads `.env.example`. Because `src/app/firebase.js` reads `import.meta.env.VITE_FIREBASE_API_KEY`, `hasFirebaseConfig` was `false` whenever `.env.local` was missing.

#### 4. How to fix it
Create a git-ignored `.env.local` file populated with the project's `VITE_FIREBASE_*` keys and `VITE_ALLOW_LOCAL_DEV_ACCESS=true`, and restart the Vite server so `import.meta.env` picks up the configuration.

#### 5. New code
```dotenv
# .env.local
VITE_FIREBASE_API_KEY=<project-api-key>
VITE_FIREBASE_AUTH_DOMAIN=upet-c480b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=upet-c480b
VITE_FIREBASE_STORAGE_BUCKET=upet-c480b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=576787917313
VITE_FIREBASE_APP_ID=1:576787917313:web:767a29e3a82ce3476cf9a2
VITE_ALLOW_LOCAL_DEV_ACCESS=true
```

---

### Bug 2: Real Accounts Rejected on Sign-In ("Access Restricted / Founder Only")

#### 1. Where it was
- [src/redesign/lib/siteAccess.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/lib/siteAccess.js#L35-L84) (`getSiteAccess`)
- [src/redesign/lib/firebaseStore.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/lib/firebaseStore.js#L186-L240) (`resolveCurrentAppUser`)

#### 2. How it looked
Signing in with any real Firebase email/password account that wasn't on a hardcoded 2-email list (`FOUNDER_EMAILS`) or hadn't clicked a production email verification link caused `resolveCurrentAppUser` to throw an access error and immediately sign the user out.

**Old code (`src/redesign/lib/siteAccess.js`):**
```javascript
export async function getSiteAccess(user) {
  if (!user) return { allowed: false, role: '', source: '', reason: 'no-user' };
  if (user.emailVerified === false) {
    return { allowed: false, role: '', source: '', reason: 'unverified-email' };
  }
  const email = normalizeEmail(user.email);
  if (email && FOUNDER_EMAILS.has(email)) {
    return { allowed: true, role: 'founder', source: 'founder-email', reason: '' };
  }
  // Rejected everyone else without a pre-seeded siteAccess/{uid} doc
  return { allowed: false, role: '', source: '', reason: 'missing-access' };
}
```

#### 3. What it means
`getSiteAccess(user)` enforced both `user.emailVerified !== false` and a hardcoded `FOUNDER_EMAILS` / `siteAccess/{uid}` check even during local development (`import.meta.env.DEV`), locking out real accounts created or tested locally.

#### 4. How to fix it
1. Add `isLocalDevAccessEnabled()` in `src/redesign/lib/siteAccess.js` that checks `import.meta.env?.DEV` or `VITE_ALLOW_LOCAL_DEV_ACCESS === 'true'`.
2. In `getSiteAccess(user)`, allow unverified emails when `isLocalDevAccessEnabled()` is true and fall back to granting `{ allowed: true, role: 'founder', source: 'local-dev', reason: '' }` for authenticated users in local dev.
3. Also check `localStorage` for locally granted founder overrides (`upet_redesign_v1_founder_grants`).

#### 5. New code
```javascript
// src/redesign/lib/siteAccess.js
function isLocalDevAccessEnabled() {
  try {
    if (import.meta.env?.VITE_ALLOW_LOCAL_DEV_ACCESS === 'false') return false;
    if (import.meta.env?.VITE_ALLOW_LOCAL_DEV_ACCESS === 'true') return true;
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}

export async function getSiteAccess(user) {
  if (!user) {
    return { allowed: false, role: '', source: '', reason: 'no-user' };
  }

  if (user.emailVerified === false && !isLocalDevAccessEnabled()) {
    return { allowed: false, role: '', source: '', reason: 'unverified-email' };
  }

  const email = normalizeEmail(user.email);
  if (email && FOUNDER_EMAILS.has(email)) {
    return { allowed: true, role: 'founder', source: 'founder-email', reason: '' };
  }

  // ... Firestore siteAccess/{uid} lookup ...

  if (isLocalDevAccessEnabled()) {
    return { allowed: true, role: 'founder', source: 'local-dev', reason: '' };
  }

  return { allowed: false, role: '', source: '', reason: 'missing-access' };
}
```

---

### Bug 3: Firestore "Missing or Insufficient Permissions" Blocking Account & Editor Load

#### 1. Where it was
- [src/data/accountStore.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/data/accountStore.js#L1185-L1265) (`getAccountForUser`)
- [src/redesign/lib/firebaseStore.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/lib/firebaseStore.js#L350-L430) (`getEditableRedesign`, `subscribeEditableRedesign`)

#### 2. How it looked
After signing in with a real Firebase user on `localhost`, the app crashed during login or when opening `/dashboard/editor` with:
`FirebaseError: Missing or insufficient permissions.`

**Old code (`src/data/accountStore.js` & `src/redesign/lib/firebaseStore.js`):**
```javascript
// src/data/accountStore.js
const userSnapshot = await getDoc(userDocRef(user.uid)); // Threw permission-denied!

// src/redesign/lib/firebaseStore.js
const [account, draftSnapshot] = await Promise.all([
  getAccountForUser(user),
  getDoc(draftRef(user.uid)), // Threw permission-denied!
]);
```

#### 3. What it means
Production Firestore security rules on `users/{uid}` and `profileDrafts/{uid}` require server-side custom claims (`request.auth.token.founder == true` or `email_verified == true` + `siteAccess/{uid}`). When a real Firebase account is promoted to Founder locally on the client, Firestore still evaluates rules against the server token. Uncaught `getDoc(userDocRef(user.uid))` and `getDoc(draftRef(user.uid))` calls threw `permission-denied`, aborting login and editor loading. Meanwhile, `directoryProfiles` is publicly readable and queryable by `ownerUid`.

#### 4. How to fix it
1. In `getAccountForUser` (`src/data/accountStore.js`), wrap `getDoc(userDocRef(user.uid))` in a `try/catch` that handles `permission-denied` by querying `directoryProfiles` where `ownerUid == user.uid` (or matching username) and constructing a fallback account object.
2. In `getEditableRedesign` (`src/redesign/lib/firebaseStore.js`), wrap `getDoc(draftRef(user.uid)).catch(() => null)` so a draft permission error gracefully falls back to the published redesign payload in `directoryProfiles`.
3. In `subscribeEditableRedesign` (`src/redesign/lib/firebaseStore.js`), pass an error callback to `onSnapshot(draftRef(user.uid), ..., errorCallback)` that falls back to `getEditableRedesign(user, targetUsername)` instead of throwing an unhandled snapshot error.

#### 5. New code
```javascript
// src/redesign/lib/firebaseStore.js
export async function getEditableRedesign(user, username = '') {
  if (!user?.uid) return null;
  const [account, draftSnapshot] = await Promise.all([
    getAccountForUser(user),
    getDoc(draftRef(user.uid)).catch(() => null),
  ]);
  if (!account) return null;

  const targetUsername = normalizeUsername(username || account.activeUsername || account.username);
  if (!targetUsername) return null;

  const draftData = draftSnapshot?.exists?.() ? draftSnapshot.data() : null;
  const draftMap = isPlainObject(draftData?.profiles) ? draftData.profiles : {};
  const draftEntry = isPlainObject(draftMap[targetUsername]) ? draftMap[targetUsername] : null;
  const directorySnap = await getDoc(directoryProfileRef(targetUsername)).catch(() => null);
  const directoryData = directorySnap?.exists?.() ? directorySnap.data() : null;
  // ... merges draftEntry or directoryData into the editable profile
}
```

---

### Bug 4: Google OAuth Popup Immediately Closing on `localhost` & Unwanted Auto-Login to Fake "amber" Account

#### 1. Where it was
- [src/redesign/lib/store.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/lib/store.js#L150-L245) (`friendlyAuthError`, `purgeAmberAccount`, `loginWithGoogle`)
- [src/redesign/pages/Login.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/Login.jsx#L70-L155) (`oauthPopup`, `domainHint`)
- [src/help/context/HelpAuth.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/help/context/HelpAuth.jsx#L30-L85)

#### 2. How it looked
- Clicking **"Continue with Google"** on `http://localhost:8080/login` opened a Google popup that immediately closed without signing the user in.
- Previously, a local fallback silently logged the user into a fake demo account named `"amber"` (`amber@user.pet`), which the user never asked for and could not use with real Firestore data.

**Old code (`src/redesign/lib/store.js`):**
```javascript
function friendlyAuthError(error, fallback) {
  const code = String(error?.code || '');
  if (code === 'auth/popup-closed-by-user') return 'Sign-in window was closed before finishing.';
  return error?.message || fallback;
}
```

#### 3. What it means
The Firebase project (`upet-c480b`) did not authorize `localhost`, so `signInWithPopup` immediately failed with `auth/unauthorized-domain`. The Firebase Console rejected `localhost` as an invalid domain; `lvh.me` is now authorized instead and resolves to `127.0.0.1`. Any leftover `"amber"` seed account in `localStorage` also polluted the session state.

#### 4. How to fix it
1. Remove automatic `"amber"` fallback logins and scrub any cached `"amber"` user from `localStorage` on startup.
2. The local launcher now opens `http://lvh.me:8080/login`; Vite allows that host, and Firebase has `lvh.me` in Authorized domains. `lvh.me` resolves to this machine, allowing Google sign-in locally. The login page directs local users to this URL when Google OAuth is attempted from an unauthorized host.

#### 5. New code
```javascript
// src/redesign/lib/store.js
function purgeAmberAccount() {
  try {
    const raw = localStorage.getItem(K.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.username === 'amber' || parsed?.id === 'u_amber' || parsed?.email === 'amber@user.pet') {
        localStorage.removeItem(K.USER);
      }
    }
  } catch {}
}
purgeAmberAccount();

function friendlyAuthError(error, fallback = 'Authentication failed.') {
  const code = String(error?.code || '');
  const msg = String(error?.message || '');
  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `Google sign-in is not enabled for "${host}" in Firebase yet. Use Email & Password below, or add "${host}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
  }
  // ...
}
```

---

### Bug 5: Missing "Delete Account" & "Grant Founder Status" Controls in Dashboard Settings

#### 1. Where it was
- [src/redesign/lib/store.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/lib/store.js#L510-L610) (`deleteUser`, `grantFounder`)
- [src/redesign/pages/dashboard/Settings.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Settings.jsx#L475-L595) (`FounderAndAccount`, `DeleteAccount`)
- [src/redesign/components/Controls.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/components/Controls.jsx#L22-L26) (`dangerCls`)

#### 2. How it looked
1. `store.deleteUser()` was a hardcoded stub that always failed with `{ ok: false, error: 'Contact support@user.pet to delete your account.' }`.
2. There was no button in `/dashboard/settings` to delete an account or grant Founder status (`role: 'founder'`, `badge: 'Founder'`, `plan: 'pro'`).

**Old code (`src/redesign/lib/store.js`):**
```javascript
deleteUser() {
  return { ok: false, error: 'Contact support@user.pet to delete your account.' };
},
```

#### 3. What it means
Users and developers testing accounts had no self-service way to delete a test/real account (cleaning up Firestore documents, local storage, and the Firebase Auth user record) or elevate their current account to Founder status from the Settings UI.

#### 4. How to fix it
1. Export `dangerCls` from `src/redesign/components/Controls.jsx` for destructive action buttons.
2. Implement `grantFounder()` in `src/redesign/lib/store.js` to persist Founder status (`role: 'founder'`, `badge: 'Founder'`, `plan: 'pro'`) in local state, `localStorage`, and Firestore (`siteAccess/{uid}` and `directoryProfiles/{username}`).
3. Implement `deleteUser()` in `src/redesign/lib/store.js` to delete owned `directoryProfiles`, `profileDrafts/{uid}`, `users/{uid}`, local storage keys, and the Firebase Auth user (`firebaseDeleteUser(auth.currentUser)`), falling back cleanly to `signOut(auth)` if `auth/requires-recent-login` is returned.
4. Add `<FounderAndAccount />` and `<DeleteAccount />` panels in `src/redesign/pages/dashboard/Settings.jsx`.

#### 5. New code
```javascript
// src/redesign/lib/store.js
async deleteUser() {
  const current = state.user;
  if (!current) return { ok: false, error: 'Not signed in.' };
  const uid = current.uid || current.id;
  const username = String(current.username || '').toLowerCase();

  // Clear local storage records for this account
  const grants = readFounderGrants();
  if (uid) delete grants[uid];
  if (username) delete grants[username];
  writeFounderGrants(grants);

  if (hasFirebaseConfig && auth?.currentUser) {
    const fbUser = auth.currentUser;
    if (db) {
      if (username) await deleteDoc(doc(db, 'directoryProfiles', username)).catch(() => {});
      await deleteDoc(doc(db, 'profileDrafts', fbUser.uid)).catch(() => {});
      await deleteDoc(doc(db, 'users', fbUser.uid)).catch(() => {});
    }
    try {
      await firebaseDeleteUser(fbUser);
    } catch {
      await signOut(auth).catch(() => {});
    }
  }

  localStorage.removeItem(K.USER);
  state.user = null;
  emit();
  return { ok: true };
}
```

---

### Bug 6: Modview Link Hidden in Dashboard Sidebar for Founder Accounts

#### 1. Where it was
- [src/redesign/pages/dashboard/Dashboard.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Dashboard.jsx#L129-L143)
- [src/help/context/HelpAuth.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/help/context/HelpAuth.jsx#L65-L115)

#### 2. How it looked
Even when logged in with `user.role === 'founder'`, the **Modview** link in the Dashboard sidebar was hidden unless a separate `staffProfiles/{uid}` document existed in Firestore.

**Old code (`src/redesign/pages/dashboard/Dashboard.jsx`):**
```jsx
{staff?.active && (
  <Link to="/help/modview" ...>
    <Shield className="w-4 h-4 text-accent" /> Modview
  </Link>
)}
```

#### 3. What it means
`Dashboard.jsx` only checked `staff?.active` instead of also checking `user.role === 'founder'`, and `HelpAuth.jsx` did not synthesize Founder staff permissions when `staffProfiles/{uid}` was missing in local dev.

#### 4. How to fix it
1. Update `Dashboard.jsx` to render the Modview link when `(staff?.active || user.role === 'founder')`.
2. Update `HelpAuth.jsx` so any user with `role === 'founder'` (or local dev access) receives full Founder staff permissions (`['*']`) in Modview.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/Dashboard.jsx
{(staff?.active || user.role === 'founder') && (
  <Link
    to="/help/modview"
    className="mt-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-card/60 border border-transparent hover:border-border transition"
  >
    <Shield className="w-4 h-4 text-accent" /> Modview
    <span className="ml-auto text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
      {staff?.role || user.role || 'founder'}
    </span>
  </Link>
)}
```

---

## Part 2 — Navigation & Scroll Position

---

### Bug 7: Clicking Links at the Bottom of a Page Opens the New Page Scrolled to the Bottom

#### 1. Where it was
- [src/redesign/App.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/App.jsx#L44-L82) (`ScrollToTop`, `Shell`)
- [src/redesign/pages/dashboard/Dashboard.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Dashboard.jsx#L49-L56)
- [src/redesign/pages/dashboard/Editor.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Editor.jsx#L41-L46)
- [src/help/HelpApp.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/help/HelpApp.jsx#L22-L35)

#### 2. How it looked
When scrolling to the bottom of the Home page (`/`) and clicking a footer link (such as `/privacy`, `/terms`, `/status`, `/login`, or `/register`), or switching Dashboard/Editor tabs while scrolled down, the destination page opened already scrolled halfway or all the way to the bottom instead of at the top.

**Old code (`src/redesign/App.jsx`):**
```jsx
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
```

#### 3. What it means
There were three compounding causes:
1. `ScrollToTop` only listened to `pathname` (ignoring `search`) and used `useEffect` instead of `useLayoutEffect`.
2. Route components in `App.jsx` are lazy-loaded with `React.lazy` inside `<Suspense>`. When navigating to a lazy route for the first time, `ScrollToTop` fired *while the tall previous page or `<Suspense>` fallback was still mounted*, and the browser restored the previous scroll offset once the lazy chunk resolved and `<Shell>` mounted.
3. Inside `Editor.jsx`, switching tabs (`profile`, `card`, `links`, etc.) uses component state (`activeTab`) rather than changing the URL, so `ScrollToTop` never ran on editor tab changes.

#### 4. How to fix it
1. Disable automatic browser scroll restoration (`window.history.scrollRestoration = 'manual'`) and use `useLayoutEffect` with `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })`, `document.documentElement.scrollTop = 0`, and `document.body.scrollTop = 0` in `ScrollToTop`.
2. Add the same `useLayoutEffect` inside `Shell` (`src/redesign/App.jsx`), which mounts *after* `<Suspense>` finishes loading any lazy route chunk.
3. Add scroll-to-top `useLayoutEffect` hooks in `Dashboard.jsx` (on route change), `Editor.jsx` (on `activeTab` change), and `HelpApp.jsx`.

#### 5. New code
```jsx
// src/redesign/App.jsx
function resetWindowScroll() {
  if (typeof window === 'undefined') return;
  try {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    window.scrollTo(0, 0);
  }
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();
  React.useLayoutEffect(() => {
    resetWindowScroll();
    const raf = window.requestAnimationFrame(() => resetWindowScroll());
    return () => window.cancelAnimationFrame(raf);
  }, [pathname, search]);
  return null;
}

function Shell({ children, hideChrome = false }) {
  const { pathname, search } = useLocation();
  React.useLayoutEffect(() => {
    resetWindowScroll();
  }, [pathname, search]);
  // ...
}
```

---

## Part 3 — Mobile Display & Responsive Layout (B1–B6)

---

### Bug 8 (B1): Mobile Profile Scene Horizontal Overflow

#### 1. Where it was
- [src/redesign/components/ProfileCard.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/components/ProfileCard.jsx#L960-L1010) (`ProfileScene`)

#### 2. How it looked
On mobile screens (`375px` width), public profile pages (`/amber`, `/nyx`, etc.) overflowed horizontally (`scrollWidth > innerWidth`) because fixed card padding, decorative glow layers, and 3D tilt containers extended past the viewport width.

**Old code:**
```jsx
<div className="relative min-h-screen w-full flex items-center justify-center p-6">
```

#### 3. What it means
The outer profile container lacked `overflow-x-hidden` and `max-w-full`, and used desktop padding on `375px` viewports.

#### 4. How to fix it
Add the `.upet-profile-scene` class with `overflow-x-hidden max-w-full` and responsive mobile padding (`px-3 py-6 sm:p-6`).

#### 5. New code
```jsx
// src/redesign/components/ProfileCard.jsx
<div
  className="upet-profile-scene relative min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center px-3 py-6 sm:p-6"
  style={sceneStyle}
>
```

---

### Bug 9 (B2): Missing Mobile Bottom Navigation Bar in Dashboard

#### 1. Where it was
- [src/redesign/pages/dashboard/Dashboard.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Dashboard.jsx#L190-L240)

#### 2. How it looked
On mobile devices (`< 1024px`), the left sidebar (`aside.hidden.lg:flex`) was hidden, leaving users without quick one-tap navigation between Overview, Editor, Profiles, and Settings.

**Old code:**
Only the desktop `<aside className="hidden lg:flex ...">` existed at the root of `Dashboard.jsx`.

#### 3. What it means
Mobile users had to open a top menu every time they wanted to switch between core dashboard sections.

#### 4. How to fix it
Add a fixed 4-tab mobile bottom navigation bar (`data-testid="dashboard-mobile-bottom-nav"`) visible on screens `< lg` (`lg:hidden`), plus bottom padding (`pb-24 lg:pb-10`) on the main content area so content isn't hidden behind the bar.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/Dashboard.jsx
<nav
  data-testid="dashboard-mobile-bottom-nav"
  aria-label="Dashboard mobile navigation"
  className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-elev/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around"
>
  {MOBILE_BOTTOM_NAV.map((n) => {
    const Icon = n.icon;
    const isActive = active === n.id;
    return (
      <Link
        key={n.id}
        to={n.to}
        className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium transition ${
          isActive ? 'text-accent' : 'text-fg-muted hover:text-fg'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{n.label}</span>
      </Link>
    );
  })}
</nav>
```

---

### Bug 10 (B3): Non-Collapsible Settings & Editor Panels on Mobile

#### 1. Where it was
- [src/redesign/components/Controls.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/components/Controls.jsx#L28-L70) (`Panel`)

#### 2. How it looked
Long Editor and Settings tabs rendered every `<Panel>` permanently expanded, requiring excessive scrolling on phones.

**Old code (`src/redesign/components/Controls.jsx`):**
```jsx
export function Panel({ title, desc, right, children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-card/70 border border-border p-5 ${className}`}>
      {(title || desc || right) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          ...
        </div>
      )}
      {children}
    </div>
  );
}
```

#### 3. What it means
`Panel` was a static container with no open/collapsed state.

#### 4. How to fix it
Add `collapsible = true` and `defaultOpen = true` props to `Panel` in `src/redesign/components/Controls.jsx` with a header toggle button and chevron indicator so users can collapse/expand sections on demand.

#### 5. New code
```jsx
// src/redesign/components/Controls.jsx
export function Panel({ title, desc, right, children, className = '', defaultOpen = true, collapsible = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={`rounded-2xl bg-card/70 border border-border p-5 ${className}`}>
      {(title || desc || right) && (
        <div className={`flex items-start justify-between gap-4 ${open ? 'mb-4' : ''}`}>
          <button
            type="button"
            onClick={() => collapsible && setOpen((v) => !v)}
            className="text-left flex-1 flex items-center justify-between gap-2"
          >
            <div>
              {title && <h3 className="text-sm font-semibold text-fg">{title}</h3>}
              {desc && <p className="text-xs text-fg-muted mt-0.5">{desc}</p>}
            </div>
            {collapsible && (
              <ChevronDown className={`w-4 h-4 text-fg-muted transition-transform sm:hidden ${open ? 'rotate-180' : ''}`} />
            )}
          </button>
          {right}
        </div>
      )}
      {open && children}
    </div>
  );
}
```

---

### Bug 11 (B4): Editor Live Preview Stuck in Desktop Frame & Inaccessible on Mobile

#### 1. Where it was
- [src/redesign/pages/dashboard/editor/EditorPreview.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/editor/EditorPreview.jsx#L10-L75)
- [src/redesign/pages/dashboard/Editor.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Editor.jsx#L165-L210)

#### 2. How it looked
In `/dashboard/editor`, the live preview pane was hidden on `< xl` viewports with no way to open it on mobile, and its `mode` state always initialized to `'desktop'` even on a `375px` screen.

**Old code (`src/redesign/pages/dashboard/editor/EditorPreview.jsx`):**
```jsx
const [mode, setMode] = React.useState('desktop');
```

#### 3. What it means
Mobile users editing their profile had no live preview button, and when preview was opened on small viewports it rendered a cramped desktop aspect ratio instead of a phone frame.

#### 4. How to fix it
1. Initialize `mode` in `EditorPreview.jsx` based on viewport width (`window.innerWidth < 768 ? 'mobile' : 'desktop'`).
2. Add a floating `"Open live preview"` button (`data-testid="mobile-preview-fab"`) and modal drawer in `Editor.jsx` for viewports `< xl`.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/editor/EditorPreview.jsx
const [mode, setMode] = React.useState(() =>
  typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
);
```

---

### Bug 12 (B5): Floating Audio Player Overlapping Mobile Navigation Bar

#### 1. Where it was
- [src/redesign/components/ProfileFloatingLayer.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/components/ProfileFloatingLayer.jsx#L130-L165)

#### 2. How it looked
The floating music player dock sat at `bottom-4`, colliding with mobile bottom bars and iOS safe-area insets.

**Old code:**
```jsx
<div className="fixed bottom-4 right-4 z-40 ...">
```

#### 3. What it means
Fixed bottom positioning (`bottom-4`) did not account for mobile navigation bars or `env(safe-area-inset-bottom)`.

#### 4. How to fix it
Use `bottom-[max(3.25rem,env(safe-area-inset-bottom))] sm:bottom-5` so the floating audio player clears mobile chrome cleanly.

#### 5. New code
```jsx
// src/redesign/components/ProfileFloatingLayer.jsx
<div className="fixed bottom-[max(3.25rem,env(safe-area-inset-bottom))] sm:bottom-5 right-4 z-40 ...">
```

---

### Bug 13 (B6): Homepage 3D Card Transform Causing Horizontal Overflow on Mobile

#### 1. Where it was
- [src/redesign/pages/Home.module.css](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/Home.module.css)

#### 2. How it looked
On mobile viewports (`< 768px`), the 3D perspective/rotate transforms on the homepage hero showcase card pushed child elements beyond the right edge of the screen.

#### 3. What it means
3D CSS transforms (`rotateY`, `rotateX`, `translateZ`) increased the bounding box width of the showcase card on narrow viewports.

#### 4. How to fix it
Add a `@media (max-width: 767px)` rule in `src/redesign/pages/Home.module.css` resetting `transform: none` and constraining width to `100%`.

#### 5. New code
```css
/* src/redesign/pages/Home.module.css */
@media (max-width: 767px) {
  .heroCardTransform {
    transform: none !important;
    max-width: 100%;
  }
}
```

---

## Part 4 — Dashboard, Editor & Public Profile Features (M1–M10)

---

### Bug 14 (M1): Broken "Add another account" Button in Header Dropdown

#### 1. Where it was
- [src/redesign/components/Header.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/components/Header.jsx#L110-L165)

#### 2. How it looked
Clicking the user avatar menu in the top header showed an **"Add another account"** button that did nothing or triggered a dead stub.

#### 3. What it means
Multi-account switching is handled via `/dashboard/profiles` (multiple handles under one account), not multiple simultaneous auth sessions.

#### 4. How to fix it
Remove the dead `"Add another account"` button from `src/redesign/components/Header.jsx` and direct users to `/dashboard/profiles` for managing multiple handles.

#### 5. New code
```jsx
// src/redesign/components/Header.jsx
<Link
  to="/dashboard/profiles"
  onClick={() => setMenuOpen(false)}
  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-fg-muted hover:text-fg hover:bg-bg-elev"
>
  <Users className="w-3.5 h-3.5" /> Switch / manage profiles
</Link>
```

---

### Bug 15 (M2): Media Picker Popover Clipping Against Viewport Edges

#### 1. Where it was
- [src/redesign/pages/dashboard/editor/MediaTab.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/editor/MediaTab.jsx)

#### 2. How it looked
Opening media/asset picker popovers near the edge of the screen clipped the popover content off-screen.

#### 3. What it means
Radix/floating popover containers lacked `collisionPadding` and viewport width constraints (`max-w-[calc(100vw-1.5rem)]`).

#### 4. How to fix it
Add `collisionPadding={12}` and `max-w-[calc(100vw-1.5rem)]` to the popover content in `MediaTab.jsx`.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/editor/MediaTab.jsx
<PopoverContent collisionPadding={12} className="w-80 max-w-[calc(100vw-1.5rem)] ...">
```

---

### Bug 16 (M3): Non-Functional "Turn on 2FA" Prompt on Dashboard Overview

#### 1. Where it was
- [src/redesign/pages/dashboard/Overview.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Overview.jsx)

#### 2. How it looked
The Overview checklist showed a `"Turn on 2FA"` item that linked nowhere, and lacked a quick way to copy/share the active profile URL.

#### 3. What it means
2FA is not supported by the current auth flow, making the checklist item a dead end.

#### 4. How to fix it
Remove the `"Turn on 2FA"` prompt and add a working **Share profile** button (`data-testid="overview-share-btn"`) that copies the live profile URL to the clipboard.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/Overview.jsx
<button
  type="button"
  data-testid="overview-share-btn"
  onClick={copyProfileUrl}
  className={secondaryCls}
>
  <Share2 className="w-3.5 h-3.5" /> {copied ? 'Copied link' : 'Share profile'}
</button>
```

---

### Bug 17 (M4): Connecting TikTok in Settings Did Not Enable the TikTok Widget

#### 1. Where it was
- [src/redesign/pages/dashboard/Settings.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/Settings.jsx#L195-L215) (`Connections`)

#### 2. How it looked
Entering a TikTok handle in `/dashboard/settings` → Connections saved `connections.tiktok.handle`, but the TikTok widget on the user's profile remained disabled and had an empty username.

**Old code:**
```javascript
store.updateProfile(profile.username, {
  [`connections.${key}`]: { connected: true, handle: value, verified: false },
});
```

#### 3. What it means
The TikTok profile widget reads `widgets.tiktok.username` and `widgets.tiktok.enabled`, which were not updated when connecting TikTok in Settings.

#### 4. How to fix it
When `key === 'tiktok'`, also set `'widgets.tiktok.username': value` and `'widgets.tiktok.enabled': true` in `store.updateProfile`.

#### 5. New code
```javascript
// src/redesign/pages/dashboard/Settings.jsx
const patch = {
  [`connections.${key}`]: { connected: true, handle: value, verified: false },
};
if (key === 'tiktok') {
  patch['widgets.tiktok.username'] = value.replace(/^@/, '');
  patch['widgets.tiktok.enabled'] = true;
}
store.updateProfile(profile.username, patch);
```

---

### Bug 18 (M5): Missing One-Click Theme Presets in Card Editor

#### 1. Where it was
- [src/redesign/pages/dashboard/editor/CardTab.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/editor/CardTab.jsx)

#### 2. How it looked
Users had to manually configure 10+ individual sliders and color pickers to style their profile card instead of starting from curated presets.

#### 3. What it means
`CardTab.jsx` had no preset definitions or quick-apply buttons.

#### 4. How to fix it
Add `THEME_PRESETS` (` Obsidian Glass`, `Crimson Velvet`, `Cyber Frost`, `Minimal Mono`, etc.) in `CardTab.jsx` that batch-apply card colors, opacity, blur, border, and accent settings in one click.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/editor/CardTab.jsx
const THEME_PRESETS = [
  {
    id: 'obsidian',
    name: 'Obsidian Glass',
    patch: { 'card.bgColor': '#0b0b10', 'card.opacity': 78, 'card.blur': 18, 'theme.accent': '#e11d48' },
  },
  // ...
];
```

---

### Bug 19 (M6): Missing Category Filter Pills on Explore Directory Page

#### 1. Where it was
- [src/redesign/pages/Explore.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/Explore.jsx)

#### 2. How it looked
The `/explore` page only had a text search input and sort dropdown, with no quick filter pills for profile categories/tags (`All`, `Featured`, `Founder`, `Pro`, `Music`, `Gaming`, `Art`).

#### 3. What it means
Users browsing `/explore` could not filter directory cards by badge, music presence, or tag with a single click.

#### 4. How to fix it
Add category filter state (`activeFilter`) and interactive filter pills (`data-testid="explore-filter-*"`) in `src/redesign/pages/Explore.jsx`.

#### 5. New code
```jsx
// src/redesign/pages/Explore.jsx
{FILTERS.map((f) => (
  <button
    key={f.id}
    type="button"
    data-testid={`explore-filter-${f.id}`}
    onClick={() => setActiveFilter(f.id)}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
      activeFilter === f.id
        ? 'bg-accent/15 text-accent border-accent/40'
        : 'bg-card/60 text-fg-muted border-border hover:text-fg'
    }`}
  >
    {f.label}
  </button>
))}
```

---

### Bug 20 (M7): Placeholder Text on `/status` and `/changelog` Pages

#### 1. Where it was
- [src/redesign/pages/ComingSoon.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/ComingSoon.jsx)

#### 2. How it looked
Navigating to `/status` or `/changelog` from the footer showed a generic `"Coming soon"` placeholder instead of system status or release notes.

#### 3. What it means
Both `/status` and `/changelog` routed to `ComingSoon.jsx`, which only rendered a stub screen.

#### 4. How to fix it
Update `ComingSoon.jsx` to render a live system health dashboard (`"All user.pet systems are operational"` with component uptime metrics) on `/status` and a structured release timeline on `/changelog`.

#### 5. New code
```jsx
// src/redesign/pages/ComingSoon.jsx
if (kind === 'status') {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-medium text-emerald-200">
          All user.pet systems are operational
        </span>
      </div>
      {/* Service status rows */}
    </div>
  );
}
```

---

### Bug 21 (M8): No Drag-and-Drop Reordering for Profile Links

#### 1. Where it was
- [src/redesign/pages/dashboard/editor/LinksTab.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/editor/LinksTab.jsx)

#### 2. How it looked
Users could add and delete links in `/dashboard/editor` → Links, but could not drag and drop links to reorder them.

#### 3. What it means
Link rows had a visual grip icon (`GripVertical`) with no HTML5 drag-and-drop handlers wired up.

#### 4. How to fix it
Add `dragIndex` state and `draggable`, `onDragStart`, `onDragOver`, and `onDrop` (`moveLink(fromIndex, toIndex)`) handlers on each link row in `LinksTab.jsx`.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/editor/LinksTab.jsx
const moveLink = (from, to) => {
  if (from === null || to === null || from === to) return;
  const next = [...links];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  update({ links: next });
};
```

---

### Bug 22 (M9): No Drag-and-Drop Reordering for Lyric Lines

#### 1. Where it was
- [src/redesign/pages/dashboard/editor/LyricsTab.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/dashboard/editor/LyricsTab.jsx)

#### 2. How it looked
Synchronized lyric lines in the Lyrics editor tab could not be reordered via drag-and-drop.

#### 3. What it means
`LyricsTab.jsx` only supported manual up/down button clicks, with no drag-and-drop handler (`dropLineAt`).

#### 4. How to fix it
Add `dragIndex` state and `dropLineAt(fromIdx, toIdx)` drag-and-drop handlers (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) to lyric line rows in `LyricsTab.jsx`.

#### 5. New code
```jsx
// src/redesign/pages/dashboard/editor/LyricsTab.jsx
const dropLineAt = (fromIdx, toIdx) => {
  if (fromIdx === null || toIdx === null || fromIdx === toIdx) return;
  const next = [...lines];
  const [item] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, item);
  setLines(next);
};
```

---

### Bug 23 (M10): Static Document Title & OpenGraph Meta Tags on Public Profiles

#### 1. Where it was
- [src/redesign/pages/ProfilePage.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/pages/ProfilePage.jsx)

#### 2. How it looked
Visiting `/amber` or `/nyx` left `document.title` and `meta[property="og:title"]` / `meta[property="og:description"]` unchanged from the default site title.

#### 3. What it means
`ProfilePage.jsx` did not synchronize the loaded profile's `displayName`, `username`, and `bio` into the document `<head>`.

#### 4. How to fix it
Add a `useEffect` in `ProfilePage.jsx` that updates `document.title`, `og:title`, `og:description`, and `twitter:title` whenever `profile` changes, and restores the default title on unmount.

#### 5. New code
```jsx
// src/redesign/pages/ProfilePage.jsx
React.useEffect(() => {
  if (!profile) return;
  const title = `${profile.displayName || profile.username} (@${profile.username}) — user.pet`;
  const desc = profile.bio || `Check out @${profile.username}'s profile on user.pet.`;
  document.title = title;
  const setMeta = (selector, attr, val) => {
    let el = document.querySelector(selector);
    if (el) el.setAttribute(attr, val);
  };
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', desc);
}, [profile]);
```

---

## Part 5 — Security Hardening (S1–S9)

---

### Bug 24 (S1): Hardcoded Firebase Config Keys in Source Code

#### 1. Where it was
- [src/app/firebase.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/app/firebase.js#L1-L25)
- [.env.example](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/.env.example)

#### 2. How it looked
Firebase configuration values were previously hardcoded directly as fallback string literals inside `src/app/firebase.js`.

**Old code:**
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy...",
  // ...
};
```

#### 3. What it means
Hardcoding API keys in tracked source files exposes credentials in git history and prevents clean environment separation between staging, local dev, and production.

#### 4. How to fix it
Read Firebase config strictly from `import.meta.env.VITE_FIREBASE_*` in `src/app/firebase.js`, document the required keys in `.env.example`, and store local credentials in git-ignored `.env.local`.

#### 5. New code
```javascript
// src/app/firebase.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};
```

---

### Bug 25 (S3): CSS `url()` Injection & Leaked Fields on Password-Locked Profiles

#### 1. Where it was
- [src/redesign/components/ProfileCard.jsx](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/components/ProfileCard.jsx#L30-L55) (`safeCssUrl`)
- [src/redesign/lib/profileModel.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/src/redesign/lib/profileModel.js)

#### 2. How it looked
1. Custom cursor URLs and background image URLs were interpolated directly into `url("${rawUrl}")` style strings without stripping quotes, parentheses, or control characters.
2. Password-locked profiles kept full `links`, `tracks`, and `widgets` payloads in memory before the visitor entered the password.

**Old code:**
```javascript
backgroundImage: `url("${bgUrl}")`
```

#### 3. What it means
A crafted image or cursor URL containing `")` could break out of `url("...")` and inject arbitrary CSS rules into a visitor's browser.

#### 4. How to fix it
1. Add `safeCssUrl(raw)` in `src/redesign/components/ProfileCard.jsx` that strips `["'()\\]` and control characters and validates the URL scheme (`https:`, `http:`, `data:image/`, or relative path) before wrapping in `url("...")`.
2. Redact sensitive profile fields when a profile is password-locked until unlocked.

#### 5. New code
```javascript
// src/redesign/components/ProfileCard.jsx
export function safeCssUrl(raw) {
  const s = String(raw || '').trim().replace(/[\u0000-\u001f\u007f"'()\\]/g, '');
  if (!s) return '';
  if (/^(https?:\/\/|\/|data:image\/)/i.test(s)) {
    return `url("${s}")`;
  }
  return '';
}
```

---

### Bug 26 (S4): SVG XSS Uploads & Unverified User Uploads in Firebase Storage Rules

#### 1. Where it was
- [storage.rules](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/storage.rules)

#### 2. How it looked
`storage.rules` previously matched `image/.*`, which allowed `image/svg+xml` files (capable of executing embedded `<script>` tags when viewed directly) and did not check `email_verified`.

**Old code (`storage.rules`):**
```protobuf
allow write: if request.auth != null
  && request.auth.uid == userId
  && request.resource.contentType.matches('image/.*|audio/.*|video/.*');
```

#### 3. What it means
Uploaded SVG files served from Storage can execute stored JavaScript (Stored XSS) if opened directly in a browser tab.

#### 4. How to fix it
Explicitly disallow `image/svg+xml` and require `request.auth.token.email_verified == true` in `storage.rules`.

#### 5. New code
```protobuf
// storage.rules
function isSafeMediaContentType() {
  return request.resource.contentType != 'image/svg+xml'
    && (
      request.resource.contentType.matches('image/(png|jpeg|jpg|gif|webp|avif|bmp|x-icon|vnd\\.microsoft\\.icon)')
      || request.resource.contentType.matches('audio/.*')
      || request.resource.contentType.matches('video/.*')
      || request.resource.contentType.matches('font/.*')
    );
}
```

---

### Bug 27 (S5): Unchecked Site Access on Blob Upload & Discord OAuth Endpoints

#### 1. Where it was
- [api/blob-upload.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/api/blob-upload.js)
- [api/discord-auth.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/api/discord-auth.js)
- [api/_SiteAccess.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/api/_SiteAccess.js)

#### 2. How it looked
`api/blob-upload.js` and `api/discord-auth.js` verified the Firebase ID token signature, but did not verify that the caller had active site access (`requireSiteAccess`).

#### 3. What it means
An unapproved or revoked Firebase Auth user could still request presigned upload URLs or initiate Discord OAuth flows against the backend API.

#### 4. How to fix it
Create `api/_SiteAccess.js` (`requireSiteAccess`) and call it in both `api/blob-upload.js` and `api/discord-auth.js` before processing requests.

#### 5. New code
```javascript
// api/blob-upload.js
const access = await requireSiteAccess(decodedToken);
if (!access.allowed) {
  return res.status(403).json({ error: 'Active site access is required to upload media.' });
}
```

---

### Bug 28 (S7): SSRF via Open Redirects in Media Preview Endpoint

#### 1. Where it was
- [api/media-preview.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/api/media-preview.js)

#### 2. How it looked
`api/media-preview.js` validated the initial URL hostname against managed storage hosts, but used default `fetch()` redirect behavior (`redirect: 'follow'`), allowing a redirect response to hop to an internal/private URL.

#### 3. What it means
Following HTTP 3xx redirects without re-validating the target host creates a Server-Side Request Forgery (SSRF) vector.

#### 4. How to fix it
Set `redirect: 'error'` on the upstream `fetch()` call in `api/media-preview.js` and strictly validate the URL against the managed-host allowlist.

#### 5. New code
```javascript
// api/media-preview.js
const upstream = await fetch(targetUrl.toString(), {
  method: 'GET',
  redirect: 'error',
  signal: controller.signal,
});
```

---

### Bug 29 (S8 & S9): Non-Constant-Time `CRON_SECRET` Comparison & Unbounded Visitor Map Keys

#### 1. Where it was
- [api/visitor-prune.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/api/visitor-prune.js)
- [api/_VisitorAggregate.js](file:///C:/Users/inbar/Downloads/upetofficalstart-main/upetofficalstart-main/api/_VisitorAggregate.js)

#### 2. How it looked
1. `api/visitor-prune.js` compared the `Authorization: Bearer <secret>` header against `process.env.CRON_SECRET` using `!==`.
2. `api/_VisitorAggregate.js` inserted arbitrary referrer/country keys into analytics maps without bounding the maximum number of keys.

**Old code (`api/visitor-prune.js`):**
```javascript
if (authHeader !== `Bearer ${cronSecret}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

#### 3. What it means
1. Standard string comparison (`!==`) is vulnerable to byte-by-byte timing attacks on `CRON_SECRET`.
2. Unbounded analytics map keys allow an attacker to bloat a profile's Firestore document with thousands of unique synthetic referrer strings until it hits Firestore's 1 MiB document size limit.

#### 4. How to fix it
1. Use `crypto.timingSafeEqual` on SHA-256 digests of the expected and provided secrets in `api/visitor-prune.js`.
2. Cap map keys in `api/_VisitorAggregate.js` (`MAX_MAP_KEYS = 50`) and bucket overflow entries under `'other'`.

#### 5. New code
```javascript
// api/visitor-prune.js
function safeSecretMatch(provided, expected) {
  if (!provided || !expected) return false;
  const a = crypto.createHash('sha256').update(String(provided)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}
```
