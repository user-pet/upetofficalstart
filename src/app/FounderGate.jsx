import React from 'react';
const ENV_FOUNDERS = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FOUNDER_EMAILS ? String(import.meta.env.VITE_FOUNDER_EMAILS) : '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
export const FOUNDER_EMAILS = new Set([
  'zurihcs@gmail.com',
  'lampjustlamp123@gmail.com',
  'iamjayvonlol@gmail.com',
  'riotsoffical@proton.me',
  'daalt38@gmail.com',
  'whatdidido6969@gmail.com',
  'amberepis0de.f@gmail.com',
  ...ENV_FOUNDERS,
]);
export const FOUNDER_USERNAMES = new Set(['dome', 'lamp']);

export function isApprovedFounder(user) {
  const email = String(user?.email || '').trim().toLowerCase();
  const username = String(user?.username || '').trim().toLowerCase();
  return Boolean(
    user?.uid &&
    (user?.emailVerified === true || user?.isLocalDev === true) &&
    (user?.role === 'founder' || user?.role === 'owner' || FOUNDER_EMAILS.has(email) || (username && FOUNDER_USERNAMES.has(username)))
  );
}
export default function FounderGate({ user, children }) { return isApprovedFounder(user) ? children : null; }
