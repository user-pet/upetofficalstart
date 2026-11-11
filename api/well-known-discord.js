import { database } from '../server/visitorStore.js';

const memoryCodes = new Map();

export function normalizeDiscordDomainCode(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  const withPrefix = trimmed.startsWith('dh=') ? trimmed : `dh=${trimmed}`;
  return /^dh=[a-zA-Z0-9_-]{6,128}$/.test(withPrefix) ? withPrefix : '';
}

export function extractSubdomainUsername(hostHeader) {
  const host = String(hostHeader || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
  if (!host) return '';
  if (host.endsWith('.user.pet')) {
    const sub = host.slice(0, -'.user.pet'.length);
    if (sub && sub !== 'www' && !sub.includes('.')) return sub;
  }
  if (host.endsWith('.localhost')) {
    const sub = host.slice(0, -'.localhost'.length);
    if (sub && sub !== 'www' && !sub.includes('.')) return sub;
  }
  return '';
}

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : (request.body || {});
      const username = String(body.username || '').trim().toLowerCase();
      const code = normalizeDiscordDomainCode(body.code);
      if (!username) return response.status(400).json({ error: 'Username is required.' });
      if (!code && body.code) {
        return response.status(400).json({ error: 'Invalid dh= verification code format.' });
      }
      if (code) {
        memoryCodes.set(username, code);
        memoryCodes.set('__latest__', code);
      } else {
        memoryCodes.delete(username);
      }
      return response.status(200).json({ ok: true, username, code });
    } catch {
      return response.status(400).json({ error: 'Could not register verification code.' });
    }
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return response.status(405).send('Method not allowed');
  }

  const host = request.headers?.['x-forwarded-host'] || request.headers?.host || '';
  const queryUser = String(request.query?.user || request.query?.username || '').trim().toLowerCase();
  const subUser = extractSubdomainUsername(host);
  const targetUser = (subUser || queryUser).replace(/[^a-z0-9._-]/g, '');

  let code = '';

  if (targetUser && memoryCodes.has(targetUser)) {
    code = memoryCodes.get(targetUser) || '';
  }

  if (!code && targetUser) {
    try {
      const db = database();
      if (db) {
        const snap = await db.collection('profiles').doc(targetUser).get();
        if (snap.exists) {
          const data = snap.data() || {};
          const rawCode =
            data?.integrations?.discordDomain?.code ||
            data?.redesign?.integrations?.discordDomain?.code ||
            data?.discordDomainCode ||
            '';
          code = normalizeDiscordDomainCode(rawCode);
        }
      }
    } catch {
      // Fall back to in-memory cache if Firestore is unavailable in local dev
    }
  }

  if (!code && memoryCodes.has('__latest__')) {
    code = memoryCodes.get('__latest__') || '';
  }

  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Access-Control-Allow-Origin', '*');

  if (!code) {
    return response.status(404).send('Discord domain verification token not configured for this user.pet profile.');
  }

  return response.status(200).send(code);
}
