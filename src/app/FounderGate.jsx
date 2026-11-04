import React from 'react';
const ENV_FOUNDERS = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FOUNDER_EMAILS ? String(import.meta.env.VITE_FOUNDER_EMAILS) : '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const FOUNDER_EMAILS = new Set(['zurihcs@gmail.com', 'lampjustlamp123@gmail.com', 'iamjayvonlol@gmail.com', 'riotsoffical@proton.me', 'daalt38@gmail.com', 'whatdidido6969@gmail.com', ...ENV_FOUNDERS]);
export function isApprovedFounder(user) {
  const email = String(user?.email || '').trim().toLowerCase();
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && import.meta.env?.VITE_ALLOW_LOCAL_DEV_ACCESS === 'true' && user?.uid && user?.emailVerified === true) {
    return true;
  }
  return Boolean(
    user?.uid &&
    user?.emailVerified === true &&
    (user?.role === 'founder' || FOUNDER_EMAILS.has(email))
  );
}
export default function FounderGate({ user, children }) { return isApprovedFounder(user) ? children : null; }
