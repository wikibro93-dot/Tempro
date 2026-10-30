/**
 * Single source of truth for the backend API root.
 * Production frontend is static (Vercel) with no same-origin /api, so every
 * call must go through VITE_API_BASE when it is set, exactly as TempMailApp
 * originally did. Without VITE_API_BASE (local dev with the Vite /api proxy)
 * it falls back to '/api'.
 * Known limitation (documented, not silently fixed): SSE uses EventSource,
 * which cannot send Authorization headers, so the inbox token stays in the
 * SSE URL path. The app UI warns users to keep an inbox private.
 */
export function getApiRoot() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  const raw = env.VITE_API_BASE || '';
  const base = String(raw).replace(/\/+$/, '');
  return base ? `${base}/api` : '/api';
}
export default getApiRoot;
