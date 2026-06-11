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

    descriptor.value = function (...args: any[]) {
      const start = performance.now();

      const fnId = `${className ? `${className}.` : ''}${methodName}`;

      const calcDurationAndLogOk = () => {
        const duration = (performance.now() - start).toFixed(2).padStart(7, ' ');
        console.log(`[PERF] ${fnId} - Completato in |${duration}ms|`);
      };

      const calcDurationAndLogKo = () => {
        const duration = (performance.now() - start).toFixed(2);
        console.log(`[PERF] ${fnId} - Errore     in |${duration}ms|`);
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
