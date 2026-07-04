export type StdFn = (...args: any[]) => any;

export function traceFunction<T extends StdFn>(fnId: string, fn: T): T {
  const originalMethod = fn;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();

    // const fnId = originalMethod.name || 'anonymousFunction';

    const calcDurationAndLogOk = () => {
      const duration = (performance.now() - start).toFixed(2).padStart(7, ' ');
      console.log(`[PERF] |${fnId.padEnd(50, ' ')}|   |${duration}ms| Ok`);
    };

    const calcDurationAndLogKo = () => {
      const duration = (performance.now() - start).toFixed(2).padStart(7, ' ');
      console.log(`[PERF] |${fnId.padEnd(50, ' ')}|   |${duration}ms| Error`);
    };

    try {
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result
          .then((value) => {
            calcDurationAndLogOk();
            return value;
          })
          .catch((error) => {
            calcDurationAndLogKo();
            throw error;
          }) as ReturnType<T>;
      }

      calcDurationAndLogOk();
      return result;
    } catch (error) {
      calcDurationAndLogKo();
      throw error;
    }
  } as T;
}
