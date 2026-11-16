import { database } from '../server/visitorStore.js';
import { bearerToken, verifyFirebaseIdentity } from '../server/firebaseAuth.js';
import { isFounderIdentity } from '../server/modviewPolicy.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let actor;
  try {
    actor = await verifyFirebaseIdentity(bearerToken(req));
  } catch {
    return res.status(401).json({ error: 'Sign in required.' });
  }

  const email = String(actor.email || '').trim().toLowerCase();
  const founder = isFounderIdentity(actor);

  try {
    const db = database();
    let hasAccess = founder;
    if (!hasAccess && email) {
      const inviteSnap = await db.collection('accessInvites').doc(email).get();
      const invite = inviteSnap.exists ? inviteSnap.data() : null;
      hasAccess = Boolean(invite?.active === true && invite?.role === 'member');
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'No active member invitation for this account.' });
    }

    const userSnap = await db.collection('users').doc(actor.uid).get();
    if (userSnap.exists) {
      const data = userSnap.data();
      return res.status(200).json({
        account: {
          uid: actor.uid,
          username: data.username || '',
          email,
          role: founder ? 'founder' : data.role === 'founder' ? 'founder' : 'member',
          createdAt: data.createdAt || null,
          usernameChangedAt: data.usernameChangedAt || 0,
        },
      });
    }

    const dirSnap = await db
      .collection('directoryProfiles')
      .where('ownerUid', '==', actor.uid)
      .limit(1)
      .get();
    if (!dirSnap.empty) {
      const docSnap = dirSnap.docs[0];
      const data = docSnap.data();
      return res.status(200).json({
        account: {
          uid: actor.uid,
          username: data.username || docSnap.id,
          email,
          role: founder ? 'founder' : 'member',
          createdAt: data.updatedAt || Date.now(),
          usernameChangedAt: 0,
        },
      });
    }

    return res.status(200).json({
      account: {
        uid: actor.uid,
        username: '',
        email,
        role: founder ? 'founder' : 'member',
      },
    });
  } catch {
    return res.status(500).json({ error: 'Could not load account.' });
  }
}
