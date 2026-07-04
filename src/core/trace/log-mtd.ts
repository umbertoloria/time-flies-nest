import { traceFunction } from './log-fn';

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
      return traceFunction(fnId, () => originalMethod.apply(this, args))();
    };

    return descriptor;
  };
}
