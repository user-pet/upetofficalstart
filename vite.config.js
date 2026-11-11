import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const discordCodes = new Map();

function normalizeDhCode(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  const withPrefix = trimmed.startsWith('dh=') ? trimmed : `dh=${trimmed}`;
  return /^dh=[a-zA-Z0-9_-]{6,128}$/.test(withPrefix) ? withPrefix : '';
}

function upetWellKnownDiscordPlugin() {
  const middleware = (req, res, next) => {
    const rawUrl = req.url || '';
    const urlObj = new URL(rawUrl, 'http://localhost');
    const pathname = urlObj.pathname;

    if (pathname === '/api/well-known-discord' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const username = String(parsed.username || '').trim().toLowerCase();
          const code = normalizeDhCode(parsed.code);
          if (username) {
            if (code) {
              discordCodes.set(username, code);
              discordCodes.set('__latest__', code);
            } else {
              discordCodes.delete(username);
            }
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, username, code }));
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Invalid request payload' }));
        }
      });
      return;
    }

    const wellKnownMatch = pathname === '/.well-known/discord' || /^\/([a-zA-Z0-9._-]+)\/\.well-known\/discord$/.exec(pathname);
    if (wellKnownMatch && (req.method === 'GET' || req.method === 'HEAD')) {
      const pathUser = Array.isArray(wellKnownMatch) ? wellKnownMatch[1].toLowerCase() : '';
      const queryUser = (urlObj.searchParams.get('user') || urlObj.searchParams.get('username') || '').toLowerCase();
      const host = String(req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
      let subUser = '';
      if (host.endsWith('.user.pet')) subUser = host.slice(0, -'.user.pet'.length);
      else if (host.endsWith('.localhost')) subUser = host.slice(0, -'.localhost'.length);
      const targetUser = subUser || pathUser || queryUser;
      const code = (targetUser && discordCodes.get(targetUser)) || discordCodes.get('__latest__') || '';
      res.statusCode = code ? 200 : 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(code || 'Discord verification code not set yet.');
      return;
    }

    next();
  };

  return {
    name: 'upet-well-known-discord',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), upetWellKnownDiscordPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/@firebase/') || id.includes('/firebase/')) return 'firebase';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/@radix-ui/') || id.includes('/@floating-ui/')) return 'react';
          if (id.includes('/framer-motion/') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) return 'motion';
          if (id.includes('/lucide-react/')) return 'icons';
          if (id.includes('/zod/') || id.includes('/re2js/')) return 'validation';
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/redesign', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 8080,
    allowedHosts: ['lvh.me'],
    watch: {
      ignored: ['**/public/profile-background.mp4'],
    },
  },
});
