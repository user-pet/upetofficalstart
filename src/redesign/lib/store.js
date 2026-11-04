import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser as deleteFirebaseAuthUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { auth, firebaseConfigured, persistAuthLocally } from '../../app/firebase.js';
import { firestore } from '../../app/firebase.js';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { isApprovedFounder } from '../../app/FounderGate.jsx';
import { getSiteAccess } from './siteAccess.js';
import { claimUsername as claimFirebaseUsername, getAccountForUser, isUsernameAvailable } from '../../data/accountStore.js';
import { getProfileAnalytics, recordProfileEvent } from '../../data/analyticsStore.js';
import { getEditableRedesign, getPublicRedesign, listDirectoryProfiles, saveRedesignProfile, subscribeEditableRedesign } from './firebaseStore.js';
import { defaultProfile } from './profileModel.js';
import { RATE_LIMITS } from '../../shared/rateLimits.js';

export const ADMIN = { username: '', password: '' };
export const RESERVED = ['admin', 'explore', 'marketplace', 'legal', 'login', 'dashboard', 'business', 'business-verification', 'biz', 'api', 'settings', 'help', 'support', 'user', 'pet', 'claim', 'shop-auth', 'welcome', 'create-account', 'assets'];

const Ctx = createContext(null);

function clone(value) {
  return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function setAtPath(target, path, value) {
  const keys = String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cursor = target;
  keys.slice(0, -1).forEach((key, index) => {
    const nextKey = keys[index + 1];
    if (!cursor[key] || typeof cursor[key] !== 'object') cursor[key] = /^\d+$/.test(nextKey) ? [] : {};
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
}

function getAtPath(target, path) {
  return String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
    .reduce((value, key) => value?.[key], target);
}

function timestampMs(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const number = Number(value);
  return Number.isFinite(number) ? number : Date.now();
}

const LOCAL_DEV_SESSION_KEY = 'upet_local_dev_session_v1';
const LOCAL_DEV_PROFILE_KEY = 'upet_local_dev_profile_v1';
const DELETED_ACCOUNTS_KEY = 'upet_deleted_accounts_v1';
const FOUNDER_BADGES = ['founder', 'verified', 'staff', 'og', 'premium', 'booster', 'bughunter', 'donor', 'seller'];

function isLocalDevAllowed() {
  return Boolean(import.meta.env?.DEV) && typeof window !== 'undefined';
}

function readDeletedAccounts() {
  if (typeof window === 'undefined') return new Set(['amber']);
  try {
    const raw = window.localStorage.getItem(DELETED_ACCOUNTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(['amber', ...(Array.isArray(list) ? list : []).map((u) => String(u).toLowerCase())]);
  } catch {
    return new Set(['amber']);
  }
}

function markAccountDeleted(username) {
  if (typeof window === 'undefined' || !username) return;
  try {
    const cleaned = String(username).trim().toLowerCase();
    const set = readDeletedAccounts();
    set.add(cleaned);
    window.localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify([...set]));
    window.localStorage.removeItem(`${LOCAL_DEV_PROFILE_KEY}_${cleaned}`);
  } catch {}
}

function unmarkAccountDeleted(username) {
  if (typeof window === 'undefined' || !username) return;
  try {
    const cleaned = String(username).trim().toLowerCase();
    if (cleaned === 'amber') return;
    const set = readDeletedAccounts();
    set.delete(cleaned);
    window.localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify([...set]));
  } catch {}
}

function purgeAmberAccount() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(`${LOCAL_DEV_PROFILE_KEY}_amber`);
    const raw = window.localStorage.getItem(LOCAL_DEV_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.username === 'amber' || parsed?.email === 'amberepis0de.f@gmail.com') {
        window.localStorage.removeItem(LOCAL_DEV_SESSION_KEY);
        window.localStorage.removeItem(LOCAL_DEV_PROFILE_KEY);
        window.localStorage.removeItem('upet_local_dev_presets_v1');
      }
    }
    if (!window.localStorage.getItem('upet_amber_purged_v3')) {
      window.localStorage.removeItem(LOCAL_DEV_SESSION_KEY);
      window.localStorage.removeItem(LOCAL_DEV_PROFILE_KEY);
      window.localStorage.removeItem('upet_local_dev_presets_v1');
      window.localStorage.setItem('upet_amber_purged_v3', '1');
    }
  } catch {}
}

function readLocalDevSession() {
  if (!isLocalDevAllowed()) return null;
  purgeAmberAccount();
  try {
    const raw = window.localStorage.getItem(LOCAL_DEV_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const deleted = readDeletedAccounts();
    if (!parsed?.username || deleted.has(String(parsed.username).toLowerCase())) return null;
    return parsed;
  } catch {
    return null;
  }
}

function buildLocalDevUser(sessionInput, initialProfile = null) {
  const username = String(sessionInput?.username || '').trim().toLowerCase();
  const email = String(sessionInput?.email || `${username}@user.pet`).trim().toLowerCase();
  const role = sessionInput?.role === 'member' ? 'member' : 'founder';
  let profile = initialProfile || defaultProfile(username);
  try {
    const rawProfile = window.localStorage.getItem(`${LOCAL_DEV_PROFILE_KEY}_${username}`) || window.localStorage.getItem(LOCAL_DEV_PROFILE_KEY);
    if (!initialProfile && rawProfile) {
      const saved = JSON.parse(rawProfile);
      if (!saved.username || saved.username === username) {
        profile = { ...profile, ...saved, username };
      }
    }
    if (role === 'founder') {
      const mergedBadges = [...new Set([...(profile.badges || []), ...FOUNDER_BADGES])];
      profile = { ...profile, username, badges: mergedBadges, shownBadges: profile.shownBadges?.length ? profile.shownBadges : mergedBadges.slice(0, 4) };
    }
    window.localStorage.setItem(`${LOCAL_DEV_PROFILE_KEY}_${username}`, JSON.stringify(profile));
    window.localStorage.setItem(LOCAL_DEV_PROFILE_KEY, JSON.stringify(profile));
  } catch {}
  return {
    uid: sessionInput?.uid || `local-user-${username}`,
    isLocalDev: true,
    username,
    email,
    role,
    banned: false,
    createdAt: Number(sessionInput?.createdAt) || Date.now(),
    usernameChangedAt: 0,
    twofa: { enabled: false, secret: '' },
    connections: profile.integrations || {},
    profile,
  };
}

function friendlyAuthError(error) {
  const messages = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
    'auth/network-request-failed': 'Check your connection and try again.',
    'auth/requires-recent-login': 'Sign out, sign back in, then try that again.',
    'auth/weak-password': 'Use a password with at least six characters.',
    'auth/email-already-in-use': 'An account already exists for this email. Log in instead.',
    'auth/unauthorized-domain': 'Add "localhost" to Firebase Console -> Authentication -> Settings -> Authorized domains for upet-c480b, or sign in with your Email & Password.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups for localhost and try again.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed before finishing.',
  };
  return messages[error?.code] || error?.message || 'Authentication could not finish.';
}

export function StoreProvider({ children }) {
  const initialLocalSession = useMemo(() => readLocalDevSession(), []);
  const initialLocalUser = useMemo(() => (initialLocalSession ? buildLocalDevUser(initialLocalSession) : null), [initialLocalSession]);
  const [firebaseUser, setFirebaseUser] = useState(() => (
    initialLocalUser
      ? { uid: initialLocalUser.uid, email: initialLocalUser.email, emailVerified: true, isLocalDev: true }
      : null
  ));
  const [siteRole, setSiteRole] = useState(() => (initialLocalUser ? initialLocalUser.role : 'member'));
  const [user, setUserState] = useState(() => initialLocalUser);
  const [directory, setDirectory] = useState(() => (initialLocalUser ? [{ ...initialLocalUser, profile: initialLocalUser.profile }] : []));
  const [ready, setReady] = useState(() => Boolean(initialLocalUser));
  const [needsClaim, setNeedsClaim] = useState(false);
  // Reset the previous light preference once; the new key keeps future choices.
  const [theme, setTheme] = useState(() => localStorage.getItem('upet_theme_v2') === 'light' ? 'light' : 'dark');
  const [storageError, setStorageError] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const dirty = useRef(false);
  const editVersion = useRef(0);
  const saveTimer = useRef(null);
  const registeringRef = useRef(false);
  const directoryRequest = useRef(null);
  const directoryLoadedAt = useRef(0);
  const accountLoad = useRef(null);
  const profileAnalyticsLoad = useRef(null);
  const currentUserRef = useRef(null);
  currentUserRef.current = user;

  const refreshDirectory = useCallback(async (force = false) => {
    if (directoryRequest.current) return directoryRequest.current;
    if (!force && Date.now() - directoryLoadedAt.current < 5 * 60 * 1000) return;
    directoryRequest.current = (async () => {
      const deleted = readDeletedAccounts();
      const rawProfiles = await listDirectoryProfiles();
      const profiles = rawProfiles.filter((entry) => !deleted.has(String(entry.username || '').toLowerCase()));
      try {
        const response = await fetch('/api/top-profiles');
        if (!response.ok) throw new Error('Could not load profile views.');
        const payload = await response.json();
        const viewsByUsername = new Map((payload.profiles || []).map((entry) => [entry.username, Number(entry.views) || 0]));
        setDirectory(profiles.map((entry) => ({
          ...entry,
          profile: { ...entry.profile, views: viewsByUsername.get(entry.username) ?? 0 },
        })));
      } catch {
        setDirectory(profiles);
      }
      directoryLoadedAt.current = Date.now();
    })();
    try { await directoryRequest.current; }
    finally { directoryRequest.current = null; }
  }, []);

  const loadAccount = useCallback((authUser, force = false) => {
    const previous = accountLoad.current;
    if (!force && previous?.uid === authUser.uid) {
      if (previous.promise) return previous.promise;
      if (Date.now() - previous.loadedAt < 3000) return Promise.resolve(previous.result);
    }
    const promise = (async () => {
      const account = await getAccountForUser(authUser);
      if (!account?.username) {
        setNeedsClaim(true);
        setUserState(null);
        return null;
      }
      let profile = await getEditableRedesign(authUser, account.username);
      const role = (isApprovedFounder(authUser) || isLocalDevAllowed()) ? 'founder' : 'member';
      if (role === 'founder') {
        const mergedBadges = [...new Set([...(profile.badges || []), ...FOUNDER_BADGES])];
        profile = {
          ...profile,
          badges: mergedBadges,
          shownBadges: profile.shownBadges?.length ? profile.shownBadges : mergedBadges.slice(0, 4),
        };
      }
      const next = {
        uid: authUser.uid,
        username: account.username,
        email: authUser.email || '',
        role,
        banned: false,
        createdAt: timestampMs(account.createdAt),
        usernameChangedAt: account.usernameChangedAt ? timestampMs(account.usernameChangedAt) : 0,
        twofa: { enabled: false, secret: '' },
        connections: profile.integrations || {},
        profile,
      };
      dirty.current = false;
      setNeedsClaim(false);
      setSiteRole(role);
      setUserState(next);
      setDirectory((rows) => {
        const listed = rows.find((row) => row.username === next.username);
        const views = Math.max(Number(next.profile.views) || 0, Number(listed?.profile?.views) || 0);
        return [{ ...next, profile: { ...next.profile, views } }, ...rows.filter((row) => row.username !== next.username)];
      });
      return next;
    })();
    accountLoad.current = { uid: authUser.uid, promise, loadedAt: 0, result: null };
    promise.then((result) => {
      if (accountLoad.current?.promise === promise) accountLoad.current = { uid: authUser.uid, promise: null, loadedAt: Date.now(), result };
    }, () => {
      if (accountLoad.current?.promise === promise) accountLoad.current = null;
    });
    return promise;
  }, []);

  const switchToAccount = useCallback(async (accountInput) => {
    const rawObj = typeof accountInput === 'string'
      ? (accountInput.includes('@') ? { email: accountInput } : { username: accountInput })
      : (accountInput || {});
    const rawEmail = String(rawObj.email || '').trim().toLowerCase();
    const rawUsername = String(rawObj.username || (rawEmail ? rawEmail.split('@')[0] : '')).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!rawUsername || rawUsername === 'amber') {
      return { ok: false, error: 'Enter a valid username or email address.' };
    }
    unmarkAccountDeleted(rawUsername);
    const email = rawEmail || `${rawUsername}@user.pet`;
    const role = rawObj.role === 'member' ? 'member' : 'founder';

    let initialProfile = null;
    let hasSavedLocal = false;
    try {
      const savedLocal = window.localStorage.getItem(`${LOCAL_DEV_PROFILE_KEY}_${rawUsername}`);
      if (savedLocal) {
        initialProfile = JSON.parse(savedLocal);
        hasSavedLocal = true;
      }
    } catch {}

    const sessionData = {
      uid: `local-user-${rawUsername}`,
      email,
      username: rawUsername,
      role,
      createdAt: Date.now(),
    };
    try {
      window.localStorage.setItem(LOCAL_DEV_SESSION_KEY, JSON.stringify(sessionData));
      window.dispatchEvent(new Event('upet-local-auth-change'));
    } catch {}
    const localUser = buildLocalDevUser(sessionData, initialProfile);
    setSiteRole(role);
    setFirebaseUser({ uid: localUser.uid, email: localUser.email, emailVerified: true, isLocalDev: true });
    setNeedsClaim(false);
    setUserState(localUser);
    setStorageError(false);
    setSaveState('saved');
    setDirectory((rows) => [
      { ...localUser, profile: localUser.profile },
      ...rows.filter((row) => row.username !== localUser.username),
    ]);
    setReady(true);

    if (!hasSavedLocal) {
      getPublicRedesign(rawUsername).then((remote) => {
        if (!remote || currentUserRef.current?.username !== rawUsername) return;
        const hydrated = buildLocalDevUser(sessionData, remote);
        setUserState(hydrated);
        setDirectory((rows) => [
          { ...hydrated, profile: hydrated.profile },
          ...rows.filter((row) => row.username !== hydrated.username),
        ]);
      }).catch(() => {});
    }

    return { ok: true, needsClaim: false, username: rawUsername, user: localUser };
  }, []);

  useEffect(() => {
    purgeAmberAccount();
    const localSession = readLocalDevSession();
    if (localSession?.username) {
      switchToAccount(localSession);
      return undefined;
    }
    if (!auth || !firebaseConfigured) {
      setReady(true);
      return undefined;
    }
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!active) return;
      if (readLocalDevSession()) return;
      if (!authUser) {
        accountLoad.current = null;
        setFirebaseUser(null);
        setUserState(null);
        setNeedsClaim(false);
        setReady(true);
        return;
      }
      if (registeringRef.current) return;
      let access = null;
      try { access = await getSiteAccess(authUser); } catch { access = null; }
      if (!access) {
        accountLoad.current = null;
        await signOut(auth).catch(() => {});
        if (active) {
          setFirebaseUser(null);
          setUserState(null);
          setReady(true);
        }
        return;
      }
      setSiteRole(isLocalDevAllowed() ? 'founder' : access.role);
      setFirebaseUser(authUser);
      try {
        await loadAccount(authUser);
        if (active) setStorageError(false);
      } catch (error) {
        if (active) setStorageError(error?.message || 'Could not load your profile.');
      } finally {
        if (active) setReady(true);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadAccount, switchToAccount]);

  useEffect(() => {
    if (!firebaseUser?.email || firebaseUser?.isLocalDev || siteRole !== 'member' || !firestore) return undefined;
    return onSnapshot(doc(firestore, 'accessInvites', firebaseUser.email.trim().toLowerCase()), (snapshot) => {
      if (snapshot.exists() && snapshot.data().active === true && snapshot.data().role === 'member') return;
      signOut(auth).catch(() => {}).finally(() => {
        setFirebaseUser(null);
        setUserState(null);
        setNeedsClaim(false);
      });
    }, () => {});
  }, [firebaseUser?.uid, firebaseUser?.email, firebaseUser?.isLocalDev, siteRole]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('upet_theme_v2', theme);
  }, [theme]);

  useEffect(() => {
    if (!dirty.current || !firebaseUser || !user?.username) return undefined;
    clearTimeout(saveTimer.current);
    setSaveState('saving');
    saveTimer.current = setTimeout(async () => {
      const savingVersion = editVersion.current;
      if (firebaseUser.isLocalDev || user.isLocalDev) {
        try {
          const nextProfile = clone(currentUserRef.current.profile);
          window.localStorage.setItem(`${LOCAL_DEV_PROFILE_KEY}_${user.username}`, JSON.stringify(nextProfile));
          window.localStorage.setItem(LOCAL_DEV_PROFILE_KEY, JSON.stringify(nextProfile));
          window.dispatchEvent(new Event('upet-local-profile-saved'));
          if (savingVersion === editVersion.current) {
            dirty.current = false;
            setSaveState('saved');
          }
          setStorageError(false);
          setDirectory((rows) => rows.map((row) => row.username === user.username ? {
            ...row,
            profile: { ...nextProfile, views: Math.max(Number(nextProfile.views) || 0, Number(row.profile?.views) || 0) },
          } : row));
        } catch (error) {
          if (savingVersion === editVersion.current) setSaveState('error');
          setStorageError(error?.message || 'Your local profile changes could not be saved.');
        }
        return;
      }
      try {
        const saved = await saveRedesignProfile(firebaseUser, user.username, currentUserRef.current.profile, { publish: true });
        const isLatest = savingVersion === editVersion.current;
        if (isLatest) {
          dirty.current = false;
          setSaveState('saved');
          setUserState((current) => current && current.uid === firebaseUser.uid
            ? { ...current, profile: saved, connections: saved.integrations || {} }
            : current);
        }
        setStorageError(false);
        setDirectory((rows) => rows.map((row) => row.username === user.username ? {
          ...row,
          profile: { ...saved, views: Math.max(Number(saved.views) || 0, Number(row.profile?.views) || 0) },
        } : row));
      } catch (error) {
        if (isLocalDevAllowed()) {
          try {
            const nextProfile = clone(currentUserRef.current.profile);
            window.localStorage.setItem(`${LOCAL_DEV_PROFILE_KEY}_${user.username}`, JSON.stringify(nextProfile));
            window.localStorage.setItem(LOCAL_DEV_PROFILE_KEY, JSON.stringify(nextProfile));
            if (savingVersion === editVersion.current) {
              dirty.current = false;
              setSaveState('saved');
            }
            setStorageError(false);
            return;
          } catch {}
        }
        if (savingVersion === editVersion.current) setSaveState('error');
        setStorageError(error?.message || 'Your changes could not be saved.');
      }
    }, RATE_LIMITS.profileSaveDelayMs);
    return () => clearTimeout(saveTimer.current);
  }, [firebaseUser, user]);

  useEffect(() => {
    if (!firebaseUser?.uid || firebaseUser?.isLocalDev || !user?.username || !firestore) return undefined;
    return subscribeEditableRedesign(firebaseUser, user.username, (profile) => {
      if (!profile || dirty.current) return;
      setUserState((current) => {
        if (!current || current.uid !== firebaseUser.uid || current.username !== user.username) return current;
        return { ...current, profile, connections: profile.integrations || {} };
      });
      setDirectory((rows) => rows.map((row) => row.username === user.username ? {
        ...row,
        profile: { ...profile, views: Math.max(Number(profile.views) || 0, Number(row.profile?.views) || 0) },
      } : row));
    }, (error) => setStorageError(error?.message || 'Live profile sync stopped.'));
  }, [firebaseUser?.uid, firebaseUser?.isLocalDev, user?.username]);

  const login = useCallback(async (email, password) => {
    const rawInput = String(email || '').trim();
    if (!rawInput) return { ok: false, error: 'Enter your email address.' };
    if (!auth || !firebaseConfigured) {
      return { ok: false, error: 'Firebase is not configured.' };
    }
    try {
      await persistAuthLocally();
      const credential = await signInWithEmailAndPassword(auth, rawInput, password || '');
      const access = await getSiteAccess(credential.user);
      if (!access) {
        await signOut(auth);
        return { ok: false, error: 'This account has no active Upet access invitation.' };
      }
      setSiteRole(isLocalDevAllowed() ? 'founder' : access.role);
      setFirebaseUser(credential.user);
      const loaded = await loadAccount(credential.user);
      return { ok: true, needsClaim: !loaded };
    } catch (error) {
      return { ok: false, code: error?.code, error: friendlyAuthError(error) };
    }
  }, [loadAccount]);

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !firebaseConfigured) {
      return { ok: false, error: 'Firebase is not configured.' };
    }
    try {
      await persistAuthLocally();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const access = await getSiteAccess(credential.user);
      if (!access) {
        await signOut(auth);
        return { ok: false, error: 'This Google account has no active Upet access invitation.' };
      }
      setSiteRole(isLocalDevAllowed() ? 'founder' : access.role);
      setFirebaseUser(credential.user);
      const loaded = await loadAccount(credential.user);
      return { ok: true, needsClaim: !loaded };
    } catch (error) {
      return { ok: false, code: error?.code, error: friendlyAuthError(error) };
    }
  }, [loadAccount]);

  const register = useCallback(async (email, password) => {
    if (!auth || !firebaseConfigured) {
      return { ok: false, error: 'Firebase is not configured.' };
    }
    try {
      registeringRef.current = true;
      await persistAuthLocally();
      const credential = await createUserWithEmailAndPassword(auth, String(email).trim().toLowerCase(), password || '');
      const access = await getSiteAccess(credential.user);
      if (!access) {
        await deleteFirebaseAuthUser(credential.user).catch(() => signOut(auth));
        return { ok: false, error: 'There is no active invitation for this email. Ask a founder to grant member access first.' };
      }
      await signOut(auth);
      return { ok: true };
    } catch (error) {
      if (registeringRef.current && auth?.currentUser) await signOut(auth).catch(() => {});
      return { ok: false, error: friendlyAuthError(error) };
    }
    finally { registeringRef.current = false; }
  }, []);

  const logout = useCallback(async () => {
    try {
      window.localStorage.removeItem(LOCAL_DEV_SESSION_KEY);
      window.dispatchEvent(new Event('upet-local-auth-change'));
    } catch {}
    if (auth) await signOut(auth).catch(() => {});
    accountLoad.current = null;
    setFirebaseUser(null);
    setSiteRole('member');
    setUserState(null);
    setNeedsClaim(false);
  }, []);

  const claimUsername = useCallback(async (rawUsername) => {
    if (!firebaseUser) return { ok: false, error: 'Sign in first.' };
    if (firebaseUser.isLocalDev) {
      const cleaned = String(rawUsername || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
      if (cleaned.length < 3) return { ok: false, error: 'Use at least 3 characters.' };
      await switchToAccount({ email: firebaseUser.email, username: cleaned });
      return { ok: true, username: cleaned };
    }
    try {
      const result = await claimFirebaseUsername(firebaseUser, rawUsername, siteRole);
      const loaded = await loadAccount(firebaseUser, true);
      if (loaded) await saveRedesignProfile(firebaseUser, result.username, loaded.profile, { publish: true });
      return { ok: true, username: result.username };
    } catch (error) {
      return { ok: false, error: error?.message || 'That username could not be claimed.' };
    }
  }, [firebaseUser, loadAccount, siteRole, switchToAccount]);

  const updateProfile = useCallback((updates) => {
    setUserState((current) => {
      if (!current) return current;
      if (Object.entries(updates).every(([path, value]) => Object.is(getAtPath(current.profile, path), value))) return current;
      const next = clone(current);
      Object.entries(updates).forEach(([path, value]) => setAtPath(next.profile, path, value));
      if (Object.keys(updates).some((path) => path === 'integrations' || path.startsWith('integrations.'))) next.connections = next.profile.integrations;
      dirty.current = true;
      editVersion.current += 1;
      return next;
    });
  }, []);

  const setProfile = useCallback((path, value) => updateProfile({ [path]: value }), [updateProfile]);

  const setUser = useCallback((path, value) => {
    if (path === 'email' || path === 'password' || path === 'twofa') return;
    if (path === 'connections' || path.startsWith('connections.')) {
      setProfile(path.replace(/^connections/, 'integrations'), value);
      return;
    }
    setUserState((current) => {
      if (!current) return current;
      const next = clone(current);
      setAtPath(next, path, value);
      return next;
    });
  }, [setProfile]);

  const replaceProfile = useCallback((profile) => {
    setUserState((current) => {
      if (!current) return current;
      const nextProfile = clone(profile);
      dirty.current = true;
      editVersion.current += 1;
      return { ...current, profile: nextProfile, connections: nextProfile.integrations || {} };
    });
  }, []);

  const changePassword = useCallback(async (currentPassword, nextPassword) => {
    if (!auth?.currentUser?.email) return { ok: false, error: 'Sign in again first.' };
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, nextPassword);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyAuthError(error) };
    }
  }, []);

  const resetPassword = useCallback(async (email = firebaseUser?.email) => {
    if (!auth || !email) return { ok: false, error: 'Enter your email first.' };
    try {
      await sendPasswordResetEmail(auth, email);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: friendlyAuthError(error) };
    }
  }, [firebaseUser]);

  const isTaken = useCallback(async (name) => {
    if (RESERVED.includes(String(name).toLowerCase())) return true;
    if (firebaseUser?.isLocalDev) return false;
    try { return !(await isUsernameAvailable(name, firebaseUser)); }
    catch { return firebaseUser?.isLocalDev ? false : true; }
  }, [firebaseUser]);

  const recordView = useCallback((username) => recordProfileEvent(username, 'view'), []);
  const refreshProfileAnalytics = useCallback(async () => {
    const username = currentUserRef.current?.username;
    if (!username || firebaseUser?.isLocalDev) return;
    const previous = profileAnalyticsLoad.current;
    if (previous?.username === username && previous.until > Date.now()) return previous.promise;
    const promise = (async () => {
      const analytics = await getProfileAnalytics(username);
      setUserState((current) => current?.username === username ? {
        ...current,
        profile: {
          ...current.profile,
          views: analytics.views,
          viewHistory: Object.entries(analytics.byDay || {}).map(([day, count]) => ({ day, count })),
        },
      } : current);
    })();
    profileAnalyticsLoad.current = { username, until: Date.now() + 5 * 60 * 1000, promise };
    try { await promise; }
    catch (error) {
      if (profileAnalyticsLoad.current?.promise === promise) profileAnalyticsLoad.current = null;
      throw error;
    }
  }, [firebaseUser?.isLocalDev]);

  const renameUser = useCallback(async (rawUsername) => {
    if (!firebaseUser || !currentUserRef.current?.username) return { ok: false, error: 'Sign in again first.' };
    if (firebaseUser.isLocalDev) {
      const cleaned = String(rawUsername || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
      if (cleaned.length < 3) return { ok: false, error: 'Use at least 3 characters.' };
      if (RESERVED.includes(cleaned)) return { ok: false, error: 'That username is reserved.' };
      const oldUsername = currentUserRef.current.username;
      const currentProfile = clone(currentUserRef.current.profile);
      currentProfile.username = cleaned;
      try {
        window.localStorage.setItem(`${LOCAL_DEV_PROFILE_KEY}_${cleaned}`, JSON.stringify(currentProfile));
        window.localStorage.removeItem(`${LOCAL_DEV_PROFILE_KEY}_${oldUsername}`);
      } catch {}
      await switchToAccount({ email: firebaseUser.email, username: cleaned });
      setDirectory((rows) => rows.filter((r) => r.username !== oldUsername));
      return { ok: true, username: cleaned, nextChangeAt: Date.now() };
    }
    const current = currentUserRef.current;
    clearTimeout(saveTimer.current);
    try {
      if (dirty.current) {
        setSaveState('saving');
        await saveRedesignProfile(firebaseUser, current.username, current.profile, { publish: true });
        dirty.current = false;
      }
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rawUsername }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Username could not be changed.');
      await loadAccount(firebaseUser, true);
      await refreshDirectory(true);
      setSaveState('saved');
      setStorageError(false);
      return { ok: true, username: result.username, nextChangeAt: result.nextChangeAt };
    } catch (error) {
      setSaveState(dirty.current ? 'error' : 'saved');
      return { ok: false, error: error?.message || 'Username could not be changed.' };
    }
  }, [firebaseUser, loadAccount, refreshDirectory, switchToAccount]);

  const grantFounder = useCallback(() => {
    setSiteRole('founder');
    setUserState((current) => {
      if (!current) return current;
      const mergedBadges = [...new Set([...(current.profile?.badges || []), ...FOUNDER_BADGES])];
      const nextProfile = {
        ...current.profile,
        badges: mergedBadges,
        shownBadges: current.profile?.shownBadges?.length ? current.profile.shownBadges : mergedBadges.slice(0, 4),
      };
      try {
        const sessionRaw = window.localStorage.getItem(LOCAL_DEV_SESSION_KEY);
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw);
          window.localStorage.setItem(LOCAL_DEV_SESSION_KEY, JSON.stringify({ ...parsed, role: 'founder' }));
        }
        window.localStorage.setItem(`${LOCAL_DEV_PROFILE_KEY}_${current.username}`, JSON.stringify(nextProfile));
        window.localStorage.setItem(LOCAL_DEV_PROFILE_KEY, JSON.stringify(nextProfile));
        window.dispatchEvent(new Event('upet-local-auth-change'));
      } catch {}
      dirty.current = true;
      editVersion.current += 1;
      return { ...current, role: 'founder', profile: nextProfile };
    });
    return { ok: true };
  }, []);

  const deleteUser = useCallback(async (targetUsername) => {
    const usernameToDelete = String(targetUsername || currentUserRef.current?.username || '').trim().toLowerCase();
    clearTimeout(saveTimer.current);
    dirty.current = false;
    try {
      if (usernameToDelete) markAccountDeleted(usernameToDelete);
      window.localStorage.removeItem(LOCAL_DEV_SESSION_KEY);
      window.localStorage.removeItem(LOCAL_DEV_PROFILE_KEY);
      if (usernameToDelete) window.localStorage.removeItem(`${LOCAL_DEV_PROFILE_KEY}_${usernameToDelete}`);
      window.localStorage.removeItem('upet_local_dev_presets_v1');
      window.dispatchEvent(new Event('upet-local-auth-change'));
    } catch {}
    if (firestore && auth?.currentUser?.uid) {
      await deleteDoc(doc(firestore, 'profileDrafts', auth.currentUser.uid)).catch(() => {});
    }
    if (auth?.currentUser) {
      await deleteFirebaseAuthUser(auth.currentUser).catch(() => signOut(auth).catch(() => {}));
    }
    accountLoad.current = null;
    setFirebaseUser(null);
    setSiteRole('member');
    setUserState(null);
    setNeedsClaim(false);
    if (usernameToDelete) {
      setDirectory((rows) => rows.filter((row) => row.username !== usernameToDelete));
    }
    return { ok: true, deletedUsername: usernameToDelete };
  }, []);

  const adminSet = useCallback((username, path, value) => {
    setDirectory((rows) => rows.map((row) => {
      if (row.username !== username) return row;
      const next = clone(row);
      setAtPath(next, path, value);
      return next;
    }));
    if (currentUserRef.current?.username === username) {
      setUserState((current) => {
        if (!current) return current;
        const next = clone(current);
        setAtPath(next, path, value);
        return next;
      });
    }
  }, []);

  const switchTo = useCallback((accountInput) => switchToAccount(accountInput), [switchToAccount]);

  const db = useMemo(() => ({ users: Object.fromEntries(directory.map((entry) => [entry.username, entry])) }), [directory]);
  const session = useMemo(() => ({ current: user?.username || null, accounts: user ? [user.username] : [] }), [user]);
  const value = {
    db, user, session, theme, ready, needsClaim, saveState, storageError,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
    login,
    loginWithGoogle,
    register,
    logout,
    claimUsername,
    setProfile,
    updateProfile,
    replaceProfile,
    setUser,
    changePassword,
    resetPassword,
    adminSet,
    deleteUser,
    grantFounder,
    renameUser,
    isTaken,
    recordView,
    refreshProfileAnalytics,
    switchTo,
    switchToAccount,
    refreshDirectory,
  };
  return createElement(Ctx.Provider, { value }, children);
}

export const useStore = () => useContext(Ctx);

export async function fileToDataUrl(file, _max = 900, kind = 'image') {
  if (!auth?.currentUser) {
    if (readLocalDevSession() && typeof FileReader !== 'undefined') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read file locally.'));
        reader.readAsDataURL(file);
      });
    }
    throw new Error('Sign in before uploading files.');
  }
  const normalizedKind = file?.type?.startsWith('audio/') ? 'audio' : kind;
  const { uploadProfileAsset } = await import('../../data/mediaStore.js');
  return uploadProfileAsset(auth.currentUser, normalizedKind, file);
}

export { defaultProfile };
