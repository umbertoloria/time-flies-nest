export function TraceMethod(): MethodDecorator {
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
      const start = performance.now();

      const calcDurationAndLogOk = () => {
        const duration = (performance.now() - start)
          .toFixed(2)
          .padStart(7, ' ');
        console.log(`[PERF] |${fnId.padEnd(50, ' ')}|   |${duration}ms| Ok`);
      };

      const calcDurationAndLogKo = () => {
        const duration = (performance.now() - start)
          .toFixed(2)
          .padStart(7, ' ');
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
            });
        }

        calcDurationAndLogOk();
        return result;
      } catch (error) {
        calcDurationAndLogKo();
        throw error;
      }
    };

    return descriptor;
  };
}
