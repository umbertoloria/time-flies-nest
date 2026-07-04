import { repositoryCache } from './cache-repository';

export interface EvictCacheOptions {
  /** Method/pattern name to evict. If missing, evicts all repository entries */
  methodName?: string;
  /** If true, evicts ALL cache entries */
  evictAll?: boolean;
}

export function EvictCache(options?: EvictCacheOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    if (typeof originalMethod !== 'function') {
      return descriptor;
    }

    const className: string | undefined = target.constructor?.name;

    const purge = () => {
      const prefix = className ? `${className}.` : '';

      if (options?.evictAll) {
        // Evicts ALL cache entries (from this and other repositories...)
        // console.debug(`[CACHE EVICT FILTER] ALL`);
        for (const key of repositoryCache.keys()) {
          // console.debug(`[CACHE EVICT] ${key}`);
          repositoryCache.delete(key);
        }
      } else {
        let targetPrefix: string;
        if (options?.methodName) {
          // Evicts current method's cache entries (es. UserRepository.findById)
          targetPrefix = `${prefix}${options.methodName}:`;
        } else {
          // Evicts all cache entries from this repository
          targetPrefix = prefix;
        }
        // console.debug(`[CACHE EVICT FILTER] ${targetPrefix}`);
        for (const key of repositoryCache.keys()) {
          if (key.startsWith(targetPrefix)) {
            // console.debug(`[CACHE EVICT] ${key}`);
            repositoryCache.delete(key);
          }
        }
      }
    };

    descriptor.value = function (this: any, ...args: any[]) {
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((value) => {
          purge();
          return value;
        });
      }

      purge();
      return result;
    };

    return descriptor;
  };
}
