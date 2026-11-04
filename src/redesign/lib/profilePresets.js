import { auth } from '../../app/firebase.js';
import { defaultProfile, sanitizeRedesignProfile } from './profileModel.js';

const LOCAL_PRESETS_KEY = 'upet_local_dev_presets_v1';
const LOCAL_PROFILE_KEY = 'upet_local_dev_profile_v1';
const LOCAL_SESSION_KEY = 'upet_local_dev_session_v1';

function isLocalDevPresetMode() {
  return Boolean(import.meta.env?.DEV) && typeof window !== 'undefined' && !auth?.currentUser;
}

function readLocalPresetStore() {
  try {
    const raw = window.localStorage.getItem(LOCAL_PRESETS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.items)) return { items: parsed.items.slice(0, 5), activePresetId: parsed.activePresetId || '', max: 5 };
  } catch {}
  return { items: [], activePresetId: '', max: 5 };
}

function writeLocalPresetStore(store) {
  const next = { items: (store.items || []).slice(0, 5), activePresetId: store.activePresetId || '', max: 5 };
  try { window.localStorage.setItem(LOCAL_PRESETS_KEY, JSON.stringify(next)); } catch {}
  return next;
}

function readCurrentLocalProfile() {
  try {
    const sess = JSON.parse(window.localStorage.getItem(LOCAL_SESSION_KEY) || '{}');
    const username = sess.username || 'user';
    const raw = window.localStorage.getItem(`${LOCAL_PROFILE_KEY}_${username}`) || window.localStorage.getItem(LOCAL_PROFILE_KEY);
    return sanitizeRedesignProfile(raw ? JSON.parse(raw) : defaultProfile(username), username);
  } catch {
    return defaultProfile('user');
  }
}

function handleLocalPresets(options = {}) {
  const store = readLocalPresetStore();
  if (!options.method || options.method === 'GET') return store;
  const body = options.body ? JSON.parse(options.body) : {};
  const { action, id, name } = body;
  const currentProfile = readCurrentLocalProfile();

  if (action === 'create') {
    if (store.items.length >= 5) throw new Error('You can save up to 5 profile presets.');
    const presetId = `preset-${Date.now()}`;
    const item = {
      id: presetId,
      name: String(name || 'Saved profile').trim().slice(0, 40),
      preview: currentProfile,
      updatedAt: Date.now(),
    };
    return writeLocalPresetStore({ items: [item, ...store.items], activePresetId: presetId, max: 5 });
  }
  if (action === 'rename') {
    return writeLocalPresetStore({
      ...store,
      items: store.items.map((item) => item.id === id ? { ...item, name: String(name || item.name).trim().slice(0, 40) } : item),
    });
  }
  if (action === 'update') {
    return writeLocalPresetStore({
      ...store,
      items: store.items.map((item) => item.id === id ? { ...item, preview: currentProfile, updatedAt: Date.now() } : item),
    });
  }
  if (action === 'delete') {
    const items = store.items.filter((item) => item.id !== id);
    return writeLocalPresetStore({
      items,
      activePresetId: store.activePresetId === id ? '' : store.activePresetId,
      max: 5,
    });
  }
  if (action === 'activate') {
    const found = store.items.find((item) => item.id === id);
    if (!found) throw new Error('Preset not found.');
    try {
      window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(found.preview));
      window.dispatchEvent(new Event('upet-local-profile-saved'));
    } catch {}
    const updated = writeLocalPresetStore({ ...store, activePresetId: id });
    return { ...updated, activatedProfile: found.preview };
  }
  if (action === 'clearActive') {
    return writeLocalPresetStore({ ...store, activePresetId: '' });
  }
  return store;
}

async function requestProfilePresets(options = {}) {
  if (isLocalDevPresetMode()) return handleLocalPresets(options);
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (!token) throw new Error('Sign in again before managing profile presets.');
    const response = await fetch('/api/profile-presets', {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Profile presets could not be loaded.');
    return result;
  } catch (err) {
    if (import.meta.env?.DEV) return handleLocalPresets(options);
    throw err;
  }
}

export const listProfilePresets = () => requestProfilePresets();
export const changeProfilePreset = (action, values = {}) => requestProfilePresets({ method: 'POST', body: JSON.stringify({ action, ...values }) });
