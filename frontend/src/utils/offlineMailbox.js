/**
 * Offline Mailbox Storage Manager
 * Ensures users have instant access to their currently loaded messages,
 * message bodies, and active disposable email accounts even without an internet connection.
 */

const OFFLINE_MSG_PREFIX = 'offline_inbox_';
const OFFLINE_CONTENT_PREFIX = 'offline_content_';
const OFFLINE_META_KEY = 'offline_mailbox_metadata';

// Phase A caps (Nov 2026): browser localStorage is ~5 MB and a heavy inbox
// (many messages with full HTML bodies) used to grow unbounded — the old
// code saved up to 100 messages per inbox with no expiry and only logged
// quota failures. These caps keep offline browsing useful without letting
// the cache crash the app. Keys are deliberately NOT consolidated: other
// code reads the legacy `inbox-<token>` key, and renaming keys would
// orphan existing users' offline cache for no benefit.
const MESSAGE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_MESSAGES_PER_ACCOUNT = 50;
const MAX_CACHED_BODIES = 30;

function isExpired(savedAt) {
  if (!savedAt) return false;
  const t = new Date(savedAt).getTime();
  return Number.isFinite(t) && Date.now() - t > MESSAGE_TTL_MS;
}

function isQuotaError(e) {
  return e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
}

// Evict oldest cached bodies, then oldest inbox payloads, until a write
// fits. Never throws: if eviction still cannot free space, the write is
// dropped with a warning instead of crashing the app.
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (!isQuotaError(e)) {
      console.warn('[OfflineMailbox] Could not write to localStorage:', e);
      return false;
    }
  }
  try {
    const bodyKeys = [];
    const msgKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(OFFLINE_CONTENT_PREFIX)) bodyKeys.push(k);
      else if (k.startsWith(OFFLINE_MSG_PREFIX)) msgKeys.push(k);
    }
    const bySavedAt = (keys) => keys
      .map((k) => {
        try {
          const parsed = JSON.parse(localStorage.getItem(k));
          return { k, t: new Date(parsed?.savedAt || parsed?.lastUpdated || 0).getTime() || 0 };
        } catch { return { k, t: 0 }; }
      })
      .sort((a, b) => a.t - b.t);
    for (const { k } of [...bySavedAt(bodyKeys), ...bySavedAt(msgKeys)]) {
      try { localStorage.removeItem(k); } catch {}
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        if (!isQuotaError(e)) return false;
      }
    }
  } catch {}
  console.warn('[OfflineMailbox] Storage quota full even after eviction; dropping write for', key);
  return false;
}

function purgeExpired() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k || (!k.startsWith(OFFLINE_MSG_PREFIX) && !k.startsWith(OFFLINE_CONTENT_PREFIX))) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(k));
        if (parsed && isExpired(parsed.savedAt)) localStorage.removeItem(k);
      } catch {}
    }
  } catch {}
}

export const offlineMailbox = {
  /**
   * Cache all messages for a specific inbox token
   */
  saveMessages(token, messages) {
    if (!token || !Array.isArray(messages)) return;
    try {
      purgeExpired();
      const kept = messages.slice(0, MAX_MESSAGES_PER_ACCOUNT);
      const payload = {
        token,
        savedAt: new Date().toISOString(),
        count: kept.length,
        messages: kept,
      };
      safeSetItem(`${OFFLINE_MSG_PREFIX}${token}`, JSON.stringify(payload));
      safeSetItem(`inbox-${token}`, JSON.stringify(kept));

      // Update metadata registry
      const meta = this.getMetadata();
      meta[token] = {
        lastUpdated: payload.savedAt,
        count: payload.count,
      };
      safeSetItem(OFFLINE_META_KEY, JSON.stringify(meta));
    } catch (e) {
      console.warn('[OfflineMailbox] Could not cache messages to localStorage:', e);
    }
  },

  /**
   * Retrieve cached messages for a specific inbox token
   */
  getMessages(token) {
    if (!token) return [];
    try {
      const raw = localStorage.getItem(`${OFFLINE_MSG_PREFIX}${token}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && isExpired(parsed.savedAt)) {
          // Stale beyond the 24h TTL: drop it (and the legacy twin) rather
          // than serving day-old mail as if it were current.
          try { localStorage.removeItem(`${OFFLINE_MSG_PREFIX}${token}`); } catch {}
          try { localStorage.removeItem(`inbox-${token}`); } catch {}
          return [];
        }
        if (Array.isArray(parsed?.messages)) {
          return parsed.messages;
        }
      }
      // Fallback to legacy inbox key
      const legacy = localStorage.getItem(`inbox-${token}`);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('[OfflineMailbox] Could not read cached messages:', e);
    }
    return [];
  },

  /**
   * Cache detailed message content (HTML, plain text, attachments list)
   */
  saveMessageContent(token, msgId, content) {
    if (!msgId || !content) return;
    try {
      purgeExpired();
      const key = `${OFFLINE_CONTENT_PREFIX}${msgId}`;
      // Enforce the body cap before writing: keep only the newest
      // MAX_CACHED_BODIES bodies, evicting the oldest first.
      const existing = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(OFFLINE_CONTENT_PREFIX) && k !== key) existing.push(k);
      }
      if (existing.length >= MAX_CACHED_BODIES) {
        const dated = existing.map((k) => {
          try {
            const parsed = JSON.parse(localStorage.getItem(k));
            return { k, t: new Date(parsed?.savedAt || 0).getTime() || 0 };
          } catch { return { k, t: 0 }; }
        }).sort((a, b) => a.t - b.t);
        for (const { k } of dated.slice(0, existing.length - MAX_CACHED_BODIES + 1)) {
          try { localStorage.removeItem(k); } catch {}
        }
      }
      const payload = {
        token,
        msgId,
        savedAt: new Date().toISOString(),
        text: content.text || '',
        html: content.html || '',
        attachments: content.attachments || [],
        intro: content.intro || '',
      };
      safeSetItem(key, JSON.stringify(payload));
    } catch (e) {
      console.warn('[OfflineMailbox] Could not cache message body:', e);
    }
  },

  /**
   * Retrieve cached message content
   */
  getMessageContent(msgId) {
    if (!msgId) return null;
    try {
      const raw = localStorage.getItem(`${OFFLINE_CONTENT_PREFIX}${msgId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && isExpired(parsed.savedAt)) {
          try { localStorage.removeItem(`${OFFLINE_CONTENT_PREFIX}${msgId}`); } catch {}
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('[OfflineMailbox] Could not read cached message body:', e);
    }
    return null;
  },

  /**
   * Purge every local cache entry for one inbox token: the offline inbox
   * payload, the legacy inbox key, cached message bodies whose payload
   * belongs to this token, and this token's metadata entry. Used when an
   * inbox is removed/deleted so no message body survives locally.
   */
  purgeToken(token) {
    if (!token) return;
    try { localStorage.removeItem(`${OFFLINE_MSG_PREFIX}${token}`); } catch {}
    try { localStorage.removeItem(`inbox-${token}`); } catch {}
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(OFFLINE_CONTENT_PREFIX)) keys.push(key);
      }
      for (const key of keys) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          if (parsed && parsed.token === token) localStorage.removeItem(key);
        } catch {}
      }
    } catch {}
    try {
      const meta = this.getMetadata();
      if (meta && token in meta) {
        delete meta[token];
        localStorage.setItem(OFFLINE_META_KEY, JSON.stringify(meta));
      }
    } catch {}
  },

  /**
   * Check if a message has its content cached
   */
  hasMessageContent(msgId) {
    if (!msgId) return false;
    return !!localStorage.getItem(`${OFFLINE_CONTENT_PREFIX}${msgId}`);
  },

  /**
   * Get metadata summary of offline cached mailboxes
   */
  getMetadata() {
    try {
      const raw = localStorage.getItem(OFFLINE_META_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },
};

export default offlineMailbox;
