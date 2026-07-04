import { LRUCache } from 'lru-cache';

export const repositoryCache = new LRUCache<string, any>({
  max: 1000, // Max 1000 entries
  ttl: 1000 * 60 * 5, // Default expiration: 5 minutes
});
