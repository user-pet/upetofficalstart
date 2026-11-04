import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseConfigured, persistAuthLocally } from '../../app/firebase';
import { ensureOwnerMembership, subscribeStaffMembership } from '../lib/helpStore';
import { getSiteAccess } from '../../redesign/lib/siteAccess.js';

const HelpAuthContext = createContext(null);

function readLocalHelpSession() {
  if (!import.meta.env?.DEV || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('upet_local_dev_session_v1');
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed?.username || parsed.username === 'amber') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function HelpAuthProvider({ children }) {
  const [user, setUser] = useState(null); const [staff, setStaff] = useState(null); const [ready, setReady] = useState(false);
  useEffect(() => {
    const syncLocal = () => {
      const local = readLocalHelpSession();
      if (!local) return false;
      setUser({ uid: local.uid || `local-user-${local.username}`, email: local.email || `${local.username}@user.pet`, username: local.username, emailVerified: true, isLocalDev: true, getIdToken: async () => 'local-dev-token' });
      setStaff({ active: true, role: 'owner', department: 'operations', jobTitle: 'Founder', permissions: ['tickets', 'articles', 'legal', 'reports', 'accounts', 'staff'] });
      setReady(true);
      return true;
    };
    const onLocalChange = () => { if (!syncLocal()) { setUser(null); setStaff(null); } };
    window.addEventListener('upet-local-auth-change', onLocalChange);
    window.addEventListener('storage', onLocalChange);
    if (syncLocal()) {
      return () => { window.removeEventListener('upet-local-auth-change', onLocalChange); window.removeEventListener('storage', onLocalChange); };
    }
    if (!auth || !firebaseConfigured) {
      setReady(true);
      return () => { window.removeEventListener('upet-local-auth-change', onLocalChange); window.removeEventListener('storage', onLocalChange); };
    }
    let stopStaff = () => {};
    let active = true;
    const stopAuth = onAuthStateChanged(auth, async (next) => {
      if (syncLocal()) return;
      stopStaff(); setUser(next); setStaff(null);
      if (next) {
        const access = await getSiteAccess(next).catch(() => null);
        if (!active) return;
        if (!access) {
          await signOut(auth).catch(() => {});
          setUser(null); setReady(true);
          return;
        }
        const membership = await ensureOwnerMembership(next).catch(() => null);
        if (!active) return;
        if (membership) {
          setStaff(membership);
          stopStaff = subscribeStaffMembership(next.uid, setStaff);
        } else if (import.meta.env?.DEV) {
          setStaff({ active: true, role: 'owner', department: 'operations', jobTitle: 'Founder', permissions: ['tickets', 'articles', 'legal', 'reports', 'accounts', 'staff'] });
        } else {
          stopStaff = subscribeStaffMembership(next.uid, setStaff);
        }
      }
      setReady(true);
    });
    return () => { active = false; stopAuth(); stopStaff(); window.removeEventListener('upet-local-auth-change', onLocalChange); window.removeEventListener('storage', onLocalChange); };
  }, []);
  const activateLocalHelp = (rawInput) => {
    const cleanedInput = String(rawInput || '').trim().toLowerCase();
    const username = (cleanedInput.includes('@') ? cleanedInput.split('@')[0] : cleanedInput).replace(/[^a-z0-9._-]/g, '');
    if (!username || username === 'amber') return { ok: false, error: 'Enter your account email or username.' };
    const email = cleanedInput.includes('@') ? cleanedInput : `${username}@user.pet`;
    const sessionData = { uid: `local-user-${username}`, email, username, role: 'founder', createdAt: Date.now() };
    try {
      window.localStorage.setItem('upet_local_dev_session_v1', JSON.stringify(sessionData));
      window.dispatchEvent(new Event('upet-local-auth-change'));
    } catch {}
    setUser({ uid: sessionData.uid, email: sessionData.email, username: sessionData.username, emailVerified: true, isLocalDev: true, getIdToken: async () => 'local-dev-token' });
    setStaff({ active: true, role: 'owner', department: 'operations', jobTitle: 'Founder', permissions: ['tickets', 'articles', 'legal', 'reports', 'accounts', 'staff'] });
    setReady(true);
    return { ok: true };
  };
  const value = useMemo(() => ({ user, staff, ready,
    login: async (email, password) => { try { await persistAuthLocally(); const credential = await signInWithEmailAndPassword(auth, email.trim(), password); const access = await getSiteAccess(credential.user); if (!access) { await signOut(auth); return { ok: false, error: 'This email needs an active Upet member invitation.' }; } return { ok: true }; } catch (error) { if (import.meta.env?.DEV) return activateLocalHelp(email); return { ok: false, error: error?.code === 'auth/invalid-credential' ? 'Email or password is incorrect.' : error?.message || 'Sign-in failed.' }; } },
    loginWithGoogle: async () => { try { await persistAuthLocally(); const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' }); const credential = await signInWithPopup(auth, provider); const access = await getSiteAccess(credential.user); if (!access) { await signOut(auth); return { ok: false, error: 'This Google account needs an active Upet access invitation.' }; } return { ok: true }; } catch (error) { return { ok: false, error: error?.message || 'Google sign-in failed.' }; } },
    logout: () => { try { window.localStorage.removeItem('upet_local_dev_session_v1'); window.dispatchEvent(new Event('upet-local-auth-change')); } catch {} setUser(null); setStaff(null); return auth ? signOut(auth).catch(() => {}) : Promise.resolve(); }, resetPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
  }), [user, staff, ready]);
  return <HelpAuthContext.Provider value={value}>{children}</HelpAuthContext.Provider>;
}

export const useHelpAuth = () => useContext(HelpAuthContext);
