import { repositoryCache } from './cache-repository';

export interface CacheMethodOptions {
  ttl?: number;
}

export function CacheMethod(options?: CacheMethodOptions): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    if (typeof originalMethod !== 'function') {
      return descriptor;
    }

    const methodName = String(propertyKey);
    const className: string | undefined = target.constructor?.name;

    const fnId = `${className ? `${className}.` : ''}${methodName}`;

    descriptor.value = function (this: any, ...args: any[]) {
      const cacheKey = `${fnId}:${JSON.stringify(args)}`;

      if (repositoryCache.has(cacheKey)) {
        // console.debug(`[CACHE HIT] ${cacheKey}`);
        return repositoryCache.get(cacheKey);
      }

      // console.debug(`[CACHE MISS] ${cacheKey}`);

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.then((value) => {
          repositoryCache.set(cacheKey, value, { ttl: options?.ttl });
          return value;
        });
      }

      repositoryCache.set(cacheKey, result, { ttl: options?.ttl });
      return result;
    };

    return descriptor;
  };
}
