/**
 * Offline Mailbox Storage Manager
 * Ensures users have instant access to their currently loaded messages,
 * message bodies, and active disposable email accounts even without an internet connection.
 */

const OFFLINE_MSG_PREFIX = 'offline_inbox_';
const OFFLINE_CONTENT_PREFIX = 'offline_content_';
const OFFLINE_META_KEY = 'offline_mailbox_metadata';

export const offlineMailbox = {
  /**
   * Cache all messages for a specific inbox token
   */
  saveMessages(token, messages) {
    if (!token || !Array.isArray(messages)) return;
    try {
      const payload = {
        token,
        savedAt: new Date().toISOString(),
        count: messages.length,
        messages: messages.slice(0, 100), // Keep up to 100 recent messages for instant offline browsing
      };
      localStorage.setItem(`${OFFLINE_MSG_PREFIX}${token}`, JSON.stringify(payload));
      localStorage.setItem(`inbox-${token}`, JSON.stringify(messages.slice(0, 100)));

      // Update metadata registry
      const meta = this.getMetadata();
      meta[token] = {
        lastUpdated: payload.savedAt,
        count: payload.count,
      };
      localStorage.setItem(OFFLINE_META_KEY, JSON.stringify(meta));
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
      const key = `${OFFLINE_CONTENT_PREFIX}${msgId}`;
      const payload = {
        token,
        msgId,
        savedAt: new Date().toISOString(),
        text: content.text || '',
        html: content.html || '',
        attachments: content.attachments || [],
        intro: content.intro || '',
      };
      localStorage.setItem(key, JSON.stringify(payload));
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
        return JSON.parse(raw);
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
