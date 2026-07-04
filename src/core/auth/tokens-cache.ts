interface CacheEntry {
  user: ReqUser;
  expiresAt: number;
}

const tokensCache = new Map<string, CacheEntry>();

// Cache miss after 5 minutes = 300.000 ms
const CACHE_ENTRY_TTL_MS = 5 * 60 * 1000;

export function getReqUserFromTokensCache(token: string) {
  const now = Date.now();

  const cached = tokensCache.get(token);

  if (cached) {
    if (now < cached.expiresAt) {
      return cached.user;
    }

    // Expired token
    tokensCache.delete(token);
  }

  return null;
}

export function cacheValidToken(token: string, reqUser: ReqUser) {
  const now = Date.now();

  tokensCache.set(token, {
    user: reqUser,
    expiresAt: now + CACHE_ENTRY_TTL_MS,
  });
}
